export interface ProfileCompletenessItem {
  label: string;
  done: boolean;
}

export interface ProfileCompletenessBarProps {
  items: ProfileCompletenessItem[];
}

export function ProfileCompletenessBar({ items }: ProfileCompletenessBarProps) {
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Profile completeness: <strong className="text-header">{done}/{total}</strong>
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-header transition-all"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        />
      </div>
      <ul className="flex flex-wrap gap-2 pt-1">
        {items.map((i) => (
          <li
            key={i.label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${
              i.done
                ? "border-success/30 bg-success/10 text-success"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            <span aria-hidden className="text-[10px]">{i.done ? "✓" : "○"}</span>
            {i.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
