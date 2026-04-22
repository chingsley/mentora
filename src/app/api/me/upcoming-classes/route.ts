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
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ classes: [] satisfies UpcomingClass[] });
  }

  const student = await db.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) {
    return NextResponse.json({ classes: [] satisfies UpcomingClass[] });
  }

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
