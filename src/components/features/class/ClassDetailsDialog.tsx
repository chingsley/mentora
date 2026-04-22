"use client";

import type { DayOfWeek, Role } from "@prisma/client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { DAY_LABEL, formatPrice, minutesToTime } from "@/lib/time";
import { FILL_CLASSES, FILL_LABEL, fillStatus } from "@/components/features/calendar/types";
import { JoinClassButton } from "@/components/features/student/JoinClassButton";

export interface ClassDetailTestimonial {
  id: string;
  rating: number;
  body: string;
  createdAt: string | Date;
  studentName: string;
}

export interface ClassDetail {
  offeringId: string;
  title: string;
  subjectName: string;
  teacherName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  effectiveCap: number;
  enrolled: number;
  hourlyRate: { amount: number; currency: string } | null;
  rules: string;
  description?: string | null;
  testimonials: ClassDetailTestimonial[];
}

export interface ClassDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  detail: ClassDetail | null;
  viewerRole: Role;
  viewerName: string | null;
  enrollmentId: string | null;
  isBusy?: boolean;
  message?: { tone: "success" | "error"; text: string } | null;
  onEnrol?: (offeringId: string) => void | Promise<void>;
  onDrop?: (enrollmentId: string) => void | Promise<void>;
}

export function ClassDetailsDialog({
  open,
  onClose,
  detail,
  viewerRole,
  viewerName,
  enrollmentId,
  isBusy,
  message,
  onEnrol,
  onDrop,
}: ClassDetailsDialogProps) {
  if (!open || !detail) {
    return <Dialog open={open} onClose={onClose}>{null}</Dialog>;
  }

  const status = fillStatus(detail);
  const durationMinutes = detail.endMinutes - detail.startMinutes;
  const hourlyPrice = detail.hourlyRate
    ? formatPrice(detail.hourlyRate.amount, detail.hourlyRate.currency)
    : null;
  const classPrice =
    detail.hourlyRate && durationMinutes > 0
      ? formatPrice(
          Math.round(detail.hourlyRate.amount * (durationMinutes / 60)),
          detail.hourlyRate.currency,
        )
      : null;
  const slotsRemaining = Math.max(0, detail.effectiveCap - detail.enrolled);
  const ruleLines = detail.rules
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const isStudent = viewerRole === "STUDENT";
  const isEnrolled = Boolean(enrollmentId);
  const canEnrol = isStudent && !isEnrolled && status !== "full";

  return (
    <Dialog open={open} onClose={onClose} className="max-w-2xl">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-header">{detail.title}</h2>
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${FILL_CLASSES[status]}`}>
            {FILL_LABEL[status]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {detail.subjectName} · with {detail.teacherName}
        </p>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Day" value={DAY_LABEL[detail.dayOfWeek]} />
        <Stat
          label="Time"
          value={`${minutesToTime(detail.startMinutes)}–${minutesToTime(detail.endMinutes)}`}
        />
        <Stat
          label="Duration"
          value={formatDuration(durationMinutes)}
        />
        <Stat
          label="Hourly rate"
          value={hourlyPrice ? `${hourlyPrice}/hr` : "—"}
        />
        <Stat label="Class limit" value={detail.effectiveCap.toString()} />
        <Stat label="Currently enrolled" value={detail.enrolled.toString()} />
        <Stat
          label={status === "full" ? "Spots" : "Spots remaining"}
          value={status === "full" ? "Full" : slotsRemaining.toString()}
          emphasised={status === "full"}
        />
        <Stat
          label="Session total"
          value={classPrice ?? "—"}
        />
      </dl>

      {detail.description?.trim() ? (
        <section className="mt-4">
          <h3 className="mb-1 text-sm font-semibold text-header">About this class</h3>
          <p className="whitespace-pre-wrap text-sm text-text/80">{detail.description}</p>
        </section>
      ) : null}

      <section className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-header">Rules &amp; expectations</h3>
        {ruleLines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            The teacher hasn&apos;t posted specific rules for this class yet.
          </p>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm text-text/80">
            {ruleLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-header">
          What previous students said
        </h3>
        {detail.testimonials.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No testimonials yet. Be the first to share feedback.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {detail.testimonials.slice(0, 5).map((t) => (
              <li key={t.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-header">{t.studentName}</p>
                  <span className="text-xs text-amber-700" aria-label={`${t.rating} out of 5`}>
                    {"★".repeat(t.rating)}
                    <span className="text-muted-foreground">
                      {"★".repeat(5 - t.rating)}
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-sm text-text/80">{t.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {message ? (
        <p
          className={`mt-4 text-sm ${
            message.tone === "success" ? "text-success" : "text-destructive"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <footer className="mt-5 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
        {isStudent && isEnrolled ? (
          <>
            <JoinClassButton
              offeringId={detail.offeringId}
              offeringTitle={detail.title}
              studentName={viewerName ?? "Student"}
              dayOfWeek={detail.dayOfWeek}
              startMinutes={detail.startMinutes}
              endMinutes={detail.endMinutes}
            />
            <Button
              type="button"
              variant="destructive"
              isLoading={isBusy}
              onClick={() => enrollmentId && onDrop?.(enrollmentId)}
            >
              Leave class
            </Button>
          </>
        ) : null}
        {canEnrol ? (
          <Button
            type="button"
            isLoading={isBusy}
            onClick={() => onEnrol?.(detail.offeringId)}
          >
            Enrol in this class
          </Button>
        ) : null}
        {isStudent && !isEnrolled && status === "full" ? (
          <Button type="button" disabled>
            Class full
          </Button>
        ) : null}
      </footer>
    </Dialog>
  );
}

function Stat({
  label,
  value,
  emphasised,
}: {
  label: string;
  value: string;
  emphasised?: boolean;
}) {
  return (
    <div className="rounded-md bg-background p-2">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-sm font-semibold ${
          emphasised ? "text-destructive" : "text-header"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
