"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface WardOption {
  studentProfileId: string;
  name: string;
  image: string | null;
}

export interface WardSelectorProps {
  wards: WardOption[];
  collapsed?: boolean;
}

export function WardSelector({ wards, collapsed = false }: WardSelectorProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const params = useParams<{ studentId?: string }>();
  const active = params?.studentId ?? wards[0]?.studentProfileId;
  const current = wards.find((w) => w.studentProfileId === active);

  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (wards.length === 0) return null;

  function selectWard(studentProfileId: string) {
    setOpen(false);
    const prefix = `/guardian/w/`;
    if (pathname.startsWith(prefix) && active) {
      const rest = pathname.slice(prefix.length);
      const slash = rest.indexOf("/");
      const tail = slash === -1 ? "" : rest.slice(slash);
      router.push(`${prefix}${studentProfileId}${tail}`);
    } else {
      router.push(`${prefix}${studentProfileId}`);
    }
    router.refresh();
  }

  if (collapsed) {
    return (
      <div className="border-t border-white/10 py-2" aria-label="Ward selector">
        <div className="flex justify-center">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase text-white"
            title={current ? `Ward: ${current.name}` : "Select a ward"}
          >
            {current ? initials(current.name) : "?"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 p-3" ref={containerRef}>
      <p className="mb-1 text-[10px] uppercase tracking-wider text-white/50">Viewing ward</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-md bg-white/5 px-2 py-2 text-left text-sm text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[11px] font-semibold uppercase">
          {current ? initials(current.name) : "?"}
        </span>
        <span className="min-w-0 flex-1 truncate">{current?.name ?? "Select a ward"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="mt-1 flex max-h-64 flex-col gap-0.5 overflow-y-auto rounded-md bg-white/5 p-1"
        >
          {wards.map((w) => {
            const selected = w.studentProfileId === active;
            return (
              <li key={w.studentProfileId}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectWard(w.studentProfileId)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                    selected ? "bg-white/15 font-medium text-white" : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold uppercase">
                    {initials(w.name)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{w.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("").toUpperCase() || "?";
}
