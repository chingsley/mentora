"use client";

import * as React from "react";

export type ToastTone = "default" | "success" | "warning" | "error";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
  action?: ToastAction;
}

export interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  show: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = React.useCallback<ToastContextValue["show"]>(
    (opts) => {
      idRef.current += 1;
      const id = `toast-${idRef.current}`;
      const item: ToastItem = { id, ...opts };
      setToasts((prev) => [...prev, item]);
      const duration = opts.durationMs ?? 8_000;
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const ctx = React.useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const tone = toast.tone ?? "default";
  const toneClass =
    tone === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : tone === "warning"
        ? "border-amber-300 bg-amber-50 text-amber-900"
        : tone === "error"
          ? "border-rose-300 bg-rose-50 text-rose-900"
          : "border-border bg-foreground text-text";

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${toneClass}`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-sm opacity-90">{toast.description}</p>
        ) : null}
        <div className="mt-2 flex gap-2">
          {toast.action ? (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                onDismiss();
              }}
              className="inline-flex h-7 items-center rounded-md bg-header px-2.5 text-xs font-medium text-white hover:bg-header/90"
            >
              {toast.action.label}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex h-7 items-center rounded-md border border-current/30 px-2.5 text-xs font-medium hover:bg-current/5"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
