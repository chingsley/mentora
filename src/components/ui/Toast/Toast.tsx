"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

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

const TONE_PALETTE: Record<
  ToastTone,
  { bg: string; border: string; text: string }
> = {
  default: { bg: COLORS.FOREGROUND, border: COLORS.BORDER, text: COLORS.TEXT },
  success: { bg: "#ecfdf5", border: "#6ee7b7", text: "#064e3b" },
  warning: { bg: "#fffbeb", border: "#fcd34d", text: "#78350f" },
  error: { bg: "#fef2f2", border: "#fca5a5", text: "#7f1d1d" },
};

const Region = styled.div`
  position: fixed;
  inset-inline: 0;
  bottom: ${SPACING.FOUR};
  z-index: ${LAYOUT.Z.TOAST};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.TWO};
  padding: 0 ${SPACING.FOUR};
  pointer-events: none;

  ${LAYOUT.MEDIA.SM} {
    inset-inline: auto ${SPACING.SIX};
    bottom: ${SPACING.SIX};
    align-items: flex-end;
  }
`;

const Card = styled.div<{ $tone: ToastTone }>`
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: ${SPACING.THREE};
  width: 100%;
  max-width: 24rem;
  padding: ${SPACING.THREE} ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${(p) => TONE_PALETTE[p.$tone].border};
  background-color: ${(p) => TONE_PALETTE[p.$tone].bg};
  color: ${(p) => TONE_PALETTE[p.$tone].text};
  box-shadow: ${LAYOUT.SHADOW.LG};
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.p`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
`;

const Description = styled.p`
  margin-top: 0.125rem;
  font-size: ${FONTS.SIZE.SM};
  opacity: 0.9;
`;

const Actions = styled.div`
  margin-top: ${SPACING.TWO};
  display: flex;
  gap: ${SPACING.TWO};
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  height: 1.75rem;
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.WHITE};
  background-color: ${COLORS.HEADER};
  border-radius: ${LAYOUT.RADIUS.MD};

  &:hover { background-color: rgba(23, 32, 51, 0.92); }
`;

const DismissButton = styled.button`
  display: inline-flex;
  align-items: center;
  height: 1.75rem;
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid currentColor;
  background-color: transparent;
  color: inherit;
  opacity: 0.6;

  &:hover { opacity: 1; }
`;

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
      <Region aria-live="polite">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </Region>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const tone = toast.tone ?? "default";
  return (
    <Card role="status" $tone={tone}>
      <Body>
        <Title>{toast.title}</Title>
        {toast.description ? <Description>{toast.description}</Description> : null}
        <Actions>
          {toast.action ? (
            <ActionButton
              type="button"
              onClick={() => {
                toast.action?.onClick();
                onDismiss();
              }}
            >
              {toast.action.label}
            </ActionButton>
          ) : null}
          <DismissButton type="button" onClick={onDismiss}>
            Dismiss
          </DismissButton>
        </Actions>
      </Body>
    </Card>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
