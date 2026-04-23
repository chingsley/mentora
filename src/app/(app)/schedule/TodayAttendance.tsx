"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { minutesToTime } from "@/lib/time";
import { markAttendanceAction } from "./attendanceActions";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface TodayAttendanceStudent {
  enrollmentId: string;
  studentName: string;
  status: AttendanceStatus | null;
  source: "AUTO_JOIN" | "TEACHER" | null;
}

export interface TodayAttendanceSession {
  offeringId: string;
  offeringTitle: string;
  subjectName: string;
  startMinutes: number;
  endMinutes: number;
  /** ISO string of the normalized session date. */
  sessionDate: string;
  inJoinWindow: boolean;
  students: TodayAttendanceStudent[];
}

export interface TodayAttendanceProps {
  sessions: TodayAttendanceSession[];
}

const STATUSES: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"];

export function TodayAttendance({ sessions }: TodayAttendanceProps) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function mark(
    enrollmentId: string,
    sessionDate: string,
    status: AttendanceStatus,
  ) {
    const key = `${enrollmentId}:${status}`;
    setPendingKey(key);
    setErrors((prev) => ({ ...prev, [enrollmentId]: "" }));
    const fd = new FormData();
    fd.set("enrollmentId", enrollmentId);
    fd.set("sessionDate", sessionDate);
    fd.set("status", status);
    const res = await markAttendanceAction(fd);
    setPendingKey(null);
    if (!res.ok) {
      setErrors((prev) => ({ ...prev, [enrollmentId]: res.error }));
      return;
    }
    router.refresh();
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No classes on your schedule for today.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((s) => (
        <div key={s.offeringId} className="rounded-lg border border-border bg-foreground p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-header">{s.offeringTitle}</h3>
            <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
              {s.subjectName}
            </span>
            <span className="text-xs text-muted-foreground">
              {minutesToTime(s.startMinutes)}–{minutesToTime(s.endMinutes)}
            </span>
            {s.inJoinWindow ? (
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-900">
                Live now
              </span>
            ) : null}
          </div>
          {s.students.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students enrolled.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {s.students.map((stu) => (
                <li
                  key={stu.enrollmentId}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-header">{stu.studentName}</span>
                    {stu.status ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${statusBadge(stu.status)}`}
                      >
                        {stu.status.toLowerCase()}
                      </span>
                    ) : (
                      <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                        unmarked
                      </span>
                    )}
                    {stu.source ? (
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {stu.source === "AUTO_JOIN" ? "auto" : "override"}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {STATUSES.map((st) => {
                      const key = `${stu.enrollmentId}:${st}`;
                      const isActive = stu.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          disabled={pendingKey !== null}
                          onClick={() => mark(stu.enrollmentId, s.sessionDate, st)}
                          className={`h-7 rounded-md border px-2 text-[11px] font-medium transition-colors ${
                            isActive
                              ? "border-header bg-header text-white"
                              : "border-border bg-foreground text-header hover:bg-header/[0.06]"
                          } disabled:opacity-60`}
                        >
                          {pendingKey === key ? "..." : st.toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                  {errors[stu.enrollmentId] ? (
                    <span className="text-[11px] text-destructive">
                      {errors[stu.enrollmentId]}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function statusBadge(status: AttendanceStatus): string {
  switch (status) {
    case "PRESENT":
      return "border border-emerald-300 bg-emerald-50 text-emerald-900";
    case "LATE":
      return "border border-amber-300 bg-amber-50 text-amber-900";
    case "ABSENT":
      return "border border-rose-300 bg-rose-50 text-rose-900";
    case "EXCUSED":
      return "border border-sky-300 bg-sky-50 text-sky-900";
  }
}
