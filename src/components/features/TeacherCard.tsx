import Image from "next/image";
import Link from "next/link";
import type { DayOfWeek } from "@prisma/client";
import { DAY_LABEL, formatPrice } from "@/lib/time";

export interface TeacherCardProps {
  id: string;
  displayId?: string | null;
  name: string;
  headline: string;
  image?: string | null;
  rating: number;
  ratingsCount: number;
  subjectNames: string[];
  regionCode?: string | null;
  minRate?: { hourlyRate: number; currency: string } | null;
  daysTaught?: DayOfWeek[];
}

const INITIALS = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join("").toUpperCase() || "?";
};

export function TeacherCard({
  id,
  displayId,
  name,
  headline,
  image,
  rating,
  ratingsCount,
  subjectNames,
  regionCode,
  minRate,
  daysTaught,
}: TeacherCardProps) {
  const uniqueDays = daysTaught ? [...new Set(daysTaught)] : [];
  const visibleSubjects = subjectNames.slice(0, 3);
  const extraSubjects = subjectNames.length - visibleSubjects.length;

  return (
    <Link
      href={`/teachers/${id}`}
      className="flex flex-col gap-3 rounded-xl bg-foreground p-5 shadow-sm ring-1 ring-black/5 transition hover:ring-header/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
          {image ? (
            <Image
              src={image}
              alt={`${name} profile photo`}
              fill
              sizes="56px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
              {INITIALS(name)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-header">{name}</h3>
            <span className="shrink-0 rounded-md bg-header/5 px-2 py-0.5 text-xs font-medium text-header">
              <span aria-hidden>★</span> {rating.toFixed(1)}
              <span className="ml-1 text-muted-foreground">({ratingsCount})</span>
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{headline}</p>
          {displayId ? (
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{displayId}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {visibleSubjects.map((s) => (
          <span
            key={s}
            className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text/80"
          >
            {s}
          </span>
        ))}
        {extraSubjects > 0 ? (
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
            +{extraSubjects} more
          </span>
        ) : null}
      </div>

      {uniqueDays.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Teaches
          </span>
          {uniqueDays.map((d) => (
            <span
              key={d}
              className="rounded-md bg-background px-1.5 py-0.5 text-[11px] font-medium text-header"
              title={DAY_LABEL[d]}
            >
              {DAY_LABEL[d].slice(0, 3)}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{regionCode ?? "Global"}</span>
        {minRate ? (
          <span>from {formatPrice(minRate.hourlyRate, minRate.currency)}/hr</span>
        ) : null}
      </div>
    </Link>
  );
}
