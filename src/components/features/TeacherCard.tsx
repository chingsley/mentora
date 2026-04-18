import Link from "next/link";
import { formatPrice } from "@/lib/time";

export interface TeacherCardProps {
  id: string;
  name: string;
  headline: string;
  rating: number;
  ratingsCount: number;
  subjectNames: string[];
  regionCode?: string | null;
  minRate?: { hourlyRate: number; currency: string } | null;
}

export function TeacherCard({
  id,
  name,
  headline,
  rating,
  ratingsCount,
  subjectNames,
  regionCode,
  minRate,
}: TeacherCardProps) {
  return (
    <Link
      href={`/teachers/${id}`}
      className="flex flex-col gap-3 rounded-xl bg-foreground p-5 shadow-sm ring-1 ring-black/5 transition hover:ring-header/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-header">{name}</h3>
          <p className="text-sm text-muted-foreground">{headline}</p>
        </div>
        <div className="shrink-0 rounded-md bg-header/5 px-2 py-1 text-xs font-medium text-header">
          ★ {rating.toFixed(1)}{" "}
          <span className="text-muted-foreground">({ratingsCount})</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {subjectNames.slice(0, 4).map((s) => (
          <span
            key={s}
            className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text/80"
          >
            {s}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{regionCode ?? "Global"}</span>
        {minRate ? <span>from {formatPrice(minRate.hourlyRate, minRate.currency)}/hr</span> : null}
      </div>
    </Link>
  );
}
