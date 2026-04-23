import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export interface UpcomingClass {
  enrollmentId: string;
  offeringId: string;
  title: string;
  subject: string;
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  startMinutes: number;
  endMinutes: number;
  /** Guardian-only: the ward's name so reminders can mention which student. */
  studentName?: string;
  /** Guardian-only: ward's studentProfileId so UI can deep-link. */
  studentProfileId?: string;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ classes: [] satisfies UpcomingClass[] });
  }

  if (session.user.role === "STUDENT") {
    const student = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!student) return NextResponse.json({ classes: [] });

    const enrollments = await db.enrollment.findMany({
      where: { studentProfileId: student.id, status: "ACTIVE" },
      select: {
        id: true,
        offering: {
          select: {
            id: true,
            title: true,
            dayOfWeek: true,
            startMinutes: true,
            endMinutes: true,
            subject: { select: { name: true } },
          },
        },
      },
    });

    const classes: UpcomingClass[] = enrollments.map((e) => ({
      enrollmentId: e.id,
      offeringId: e.offering.id,
      title: e.offering.title,
      subject: e.offering.subject.name,
      dayOfWeek: e.offering.dayOfWeek,
      startMinutes: e.offering.startMinutes,
      endMinutes: e.offering.endMinutes,
    }));

    return NextResponse.json({ classes });
  }

  if (session.user.role === "GUARDIAN") {
    const guardian = await db.guardianProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!guardian) return NextResponse.json({ classes: [] });

    const links = await db.guardianLink.findMany({
      where: { guardianProfileId: guardian.id, status: "ACCEPTED" },
      select: {
        studentProfile: {
          select: {
            id: true,
            user: { select: { name: true } },
            enrollments: {
              where: { status: "ACTIVE" },
              select: {
                id: true,
                offering: {
                  select: {
                    id: true,
                    title: true,
                    dayOfWeek: true,
                    startMinutes: true,
                    endMinutes: true,
                    subject: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const classes: UpcomingClass[] = [];
    for (const link of links) {
      const student = link.studentProfile;
      for (const e of student.enrollments) {
        classes.push({
          enrollmentId: e.id,
          offeringId: e.offering.id,
          title: e.offering.title,
          subject: e.offering.subject.name,
          dayOfWeek: e.offering.dayOfWeek,
          startMinutes: e.offering.startMinutes,
          endMinutes: e.offering.endMinutes,
          studentName: student.user.name,
          studentProfileId: student.id,
        });
      }
    }

    return NextResponse.json({ classes });
  }

  return NextResponse.json({ classes: [] satisfies UpcomingClass[] });
}
