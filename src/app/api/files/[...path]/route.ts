import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storageProvider } from "@/lib/providers/storage";
import { assertGuardianHasStudent } from "@/server/guardians";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { path: segments } = await params;
  if (!segments || segments.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const key = segments.map((s) => decodeURIComponent(s)).join("/");
  if (key.includes("..") || key.startsWith("/")) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const allowed = await canAccessFile({
    key,
    userId: session.user.id,
    role: session.user.role,
  });
  if (!allowed.ok) {
    return new NextResponse(allowed.reason ?? "Forbidden", { status: allowed.status });
  }

  try {
    const { stream, size } = await storageProvider.readStream(key);
    return new NextResponse(stream as unknown as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": allowed.contentType ?? "application/octet-stream",
        "Content-Length": size.toString(),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

interface AccessResult {
  ok: boolean;
  status: number;
  reason?: string;
  contentType?: string;
}

async function canAccessFile(args: {
  key: string;
  userId: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "GUARDIAN";
}): Promise<AccessResult> {
  const { key, userId, role } = args;

  if (role === "ADMIN") {
    const guess = await guessContentType(key);
    return { ok: true, status: 200, contentType: guess };
  }

  if (key.startsWith("assignments/")) {
    const assignment = await db.assignment.findFirst({
      where: { attachmentPath: key },
      include: {
        offering: {
          include: {
            teacherProfile: { select: { userId: true } },
            enrollments: {
              where: { status: "ACTIVE" },
              include: {
                studentProfile: {
                  include: { user: { select: { id: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!assignment) return { ok: false, status: 404 };

    if (role === "TEACHER") {
      if (assignment.offering.teacherProfile.userId !== userId) {
        return { ok: false, status: 403 };
      }
      return { ok: true, status: 200, contentType: assignment.attachmentMime ?? undefined };
    }
    if (role === "STUDENT") {
      const enrolled = assignment.offering.enrollments.some(
        (e) => e.studentProfile.user.id === userId,
      );
      if (!enrolled) return { ok: false, status: 403 };
      return { ok: true, status: 200, contentType: assignment.attachmentMime ?? undefined };
    }
    if (role === "GUARDIAN") {
      const enrollmentStudentIds = assignment.offering.enrollments.map(
        (e) => e.studentProfile.id,
      );
      for (const sid of enrollmentStudentIds) {
        try {
          await assertGuardianHasStudent(userId, sid);
          return { ok: true, status: 200, contentType: assignment.attachmentMime ?? undefined };
        } catch {
          // try next
        }
      }
      return { ok: false, status: 403 };
    }
  }

  if (key.startsWith("submissions/")) {
    const submission = await db.assignmentSubmission.findFirst({
      where: { filePath: key },
      include: {
        studentProfile: { include: { user: { select: { id: true } } } },
        assignment: {
          include: {
            offering: {
              include: { teacherProfile: { select: { userId: true } } },
            },
          },
        },
      },
    });
    if (!submission) return { ok: false, status: 404 };

    if (role === "TEACHER") {
      if (submission.assignment.offering.teacherProfile.userId !== userId) {
        return { ok: false, status: 403 };
      }
      return { ok: true, status: 200, contentType: submission.fileMime };
    }
    if (role === "STUDENT") {
      if (submission.studentProfile.user.id !== userId) {
        return { ok: false, status: 403 };
      }
      return { ok: true, status: 200, contentType: submission.fileMime };
    }
    if (role === "GUARDIAN") {
      try {
        await assertGuardianHasStudent(userId, submission.studentProfile.id);
        return { ok: true, status: 200, contentType: submission.fileMime };
      } catch {
        return { ok: false, status: 403 };
      }
    }
  }

  return { ok: false, status: 403 };
}

async function guessContentType(key: string): Promise<string | undefined> {
  const assignment = await db.assignment.findFirst({
    where: { attachmentPath: key },
    select: { attachmentMime: true },
  });
  if (assignment?.attachmentMime) return assignment.attachmentMime;
  const submission = await db.assignmentSubmission.findFirst({
    where: { filePath: key },
    select: { fileMime: true },
  });
  return submission?.fileMime;
}
