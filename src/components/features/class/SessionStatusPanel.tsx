"use client";

import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  SESSION_MARKER_LABEL,
  SESSION_MARKER_THEME,
  SESSION_NOT_HELD_REASON_LABEL,
  type SessionMarkerKind,
} from "@/constants/sessionOutcome.constants";
import type { SessionOccurrenceSnapshot } from "@/lib/sessionOccurrenceKey";

export interface SessionStatusPanelProps {
  snapshot: SessionOccurrenceSnapshot;
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StatusChip = styled.span<{ $kind: SessionMarkerKind | "pending" }>`
  border-radius: ${LAYOUT.RADIUS.FULL};
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  border: 1px solid;

  ${(p) => {
    if (p.$kind === "pending") {
      return css`
        border-color: ${COLORS.BORDER};
        background-color: ${COLORS.FOREGROUND};
        color: ${COLORS.MUTED_FOREGROUND};
      `;
    }
    const theme = SESSION_MARKER_THEME[p.$kind];
    return css`
      border-color: ${theme.border};
      background-color: ${theme.bg};
      color: ${theme.text};
    `;
  }}
`;

const ReasonText = styled.p`
  margin-top: ${SPACING.TWO};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

function resolveDisplayKind(snapshot: SessionOccurrenceSnapshot): SessionMarkerKind | "pending" {
  if (snapshot.marker) return snapshot.marker;
  if (snapshot.outcome === "NOT_HELD") return "not_held";
  return "pending";
}

export function SessionStatusPanel({ snapshot }: SessionStatusPanelProps) {
  const kind = resolveDisplayKind(snapshot);
  const label =
    kind === "pending"
      ? "No attendance recorded yet"
      : SESSION_MARKER_LABEL[kind];

  return (
    <Wrap>
      <StatusChip $kind={kind}>{label}</StatusChip>

      {snapshot.notHeldReason ? (
        <ReasonText>
          Reason: {SESSION_NOT_HELD_REASON_LABEL[snapshot.notHeldReason]}
        </ReasonText>
      ) : null}
    </Wrap>
  );
}
