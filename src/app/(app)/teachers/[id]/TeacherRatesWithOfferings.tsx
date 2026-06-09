"use client";

import * as React from "react";
import styled from "styled-components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { CalendarEntry } from "@/components/features/calendar/types";
import { fillStatus, FILL_LABEL, FILL_THEME } from "@/components/features/calendar/types";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { DEFAULT_OFFERING_RECURRENCE, formatRecurrenceLabel } from "@/lib/offeringRecurrence";
import { minutesToTime } from "@/lib/time";
import type { TeacherRateRow } from "./TeacherDetailView";

const RatesGrid = styled.ul`
  display: grid;
  gap: ${SPACING.THREE};
  list-style: none;
  margin: 0;
  padding: 0;
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const RateButton = styled.button<{ $expanded: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  width: 100%;
  text-align: left;
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid
    ${(p) => (p.$expanded ? COLORS.SIDEBAR_BRAND : COLORS.BORDER_SUBTLE_LIGHT)};
  padding: ${SPACING.FOUR};
  background-color: ${(p) => (p.$expanded ? COLORS.SIDEBAR_HOVER : COLORS.FOREGROUND)};
  cursor: pointer;
  outline: none;
  transition: box-shadow 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;

  &:hover {
    border-color: ${COLORS.BORDER};
    box-shadow: ${LAYOUT.SHADOW.SM};
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${COLORS.SIDEBAR_FOCUS_RING};
  }
`;

const RateSubject = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const RateRegion = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.SIDEBAR_MUTED};
`;

const RateMeta = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const RatePrice = styled.span`
  margin-top: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  letter-spacing: -0.01em;
`;

const RatePriceUnit = styled.span`
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.SIDEBAR_MUTED};
`;

const OfferingsPanel = styled.div`
  margin-top: ${SPACING.FIVE};
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const OfferingsHeading = styled.h3`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const OfferingsHint = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const OfferingsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const OfferingButton = styled.button`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  width: 100%;
  text-align: left;
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER_SUBTLE_LIGHT};
  padding: ${SPACING.FOUR};
  background-color: ${COLORS.BACKGROUND};
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: ${COLORS.BORDER};
    box-shadow: ${LAYOUT.SHADOW.SM};
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${COLORS.SIDEBAR_FOCUS_RING};
  }
`;

const OfferingTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${SPACING.THREE};
`;

const OfferingTitle = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const StatusBadge = styled.span<{ $status: keyof typeof FILL_THEME }>`
  flex-shrink: 0;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${(p) => FILL_THEME[p.$status].border};
  background-color: ${(p) => FILL_THEME[p.$status].bg};
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${(p) => FILL_THEME[p.$status].text};
`;

const OfferingMeta = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Muted = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface TeacherRatesWithOfferingsProps {
  rates: TeacherRateRow[];
  entries: CalendarEntry[];
  expandedSubjectId: string | null;
  onToggleSubject: (subjectId: string) => void;
  onOfferingClick: (offeringId: string) => void;
}

export function TeacherRatesWithOfferings({
  rates,
  entries,
  expandedSubjectId,
  onToggleSubject,
  onOfferingClick,
}: TeacherRatesWithOfferingsProps) {
  const classCountBySubject = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.visibility === "blocked") continue;
      counts[entry.subjectId] = (counts[entry.subjectId] ?? 0) + 1;
    }
    return counts;
  }, [entries]);

  const expandedOfferings = React.useMemo(() => {
    if (!expandedSubjectId) return [];
    return entries.filter(
      (e) => e.subjectId === expandedSubjectId && e.visibility !== "blocked",
    );
  }, [entries, expandedSubjectId]);

  const expandedSubjectName =
    rates.find((r) => r.subjectId === expandedSubjectId)?.subjectName ?? "Subject";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rates</CardTitle>
        <CardDescription>
          Hourly rates by subject and region. Select a subject to browse its classes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rates.length === 0 ? (
          <Muted>No rates set yet.</Muted>
        ) : (
          <>
            <RatesGrid>
              {rates.map((r) => {
                const classCount = classCountBySubject[r.subjectId] ?? 0;
                const expanded = expandedSubjectId === r.subjectId;
                return (
                  <li key={r.id}>
                    <RateButton
                      type="button"
                      $expanded={expanded}
                      aria-expanded={expanded}
                      onClick={() => onToggleSubject(r.subjectId)}
                    >
                      <RateSubject>{r.subjectName}</RateSubject>
                      <RateRegion>{r.regionName}</RateRegion>
                      <RatePrice>
                        {r.hourlyDisplay}
                        <RatePriceUnit> /hr</RatePriceUnit>
                      </RatePrice>
                      {classCount > 0 ? (
                        <RateMeta>
                          {classCount} class{classCount === 1 ? "" : "es"} available
                        </RateMeta>
                      ) : (
                        <RateMeta>No published classes yet</RateMeta>
                      )}
                    </RateButton>
                  </li>
                );
              })}
            </RatesGrid>

            {expandedSubjectId ? (
              <OfferingsPanel>
                <OfferingsHeading>{expandedSubjectName} classes</OfferingsHeading>
                <OfferingsHint>
                  Same classes shown on the weekly schedule. Tap a class for full details and
                  enrollment.
                </OfferingsHint>
                {expandedOfferings.length === 0 ? (
                  <Muted>No published classes for this subject yet.</Muted>
                ) : (
                  <OfferingsList>
                    {expandedOfferings.map((entry) => {
                      const status = fillStatus(entry);
                      const schedule = formatRecurrenceLabel(
                        entry.recurrence ?? DEFAULT_OFFERING_RECURRENCE,
                        entry.dayOfWeek,
                      );
                      const time = `${minutesToTime(entry.startMinutes)}–${minutesToTime(entry.endMinutes)}`;
                      return (
                        <li key={entry.offeringId}>
                          <OfferingButton
                            type="button"
                            onClick={() => onOfferingClick(entry.offeringId)}
                          >
                            <OfferingTop>
                              <OfferingTitle>{entry.title}</OfferingTitle>
                              <StatusBadge $status={status}>{FILL_LABEL[status]}</StatusBadge>
                            </OfferingTop>
                            <OfferingMeta>
                              {schedule} · {time} · {entry.enrolled}/{entry.effectiveCap}{" "}
                              enrolled
                            </OfferingMeta>
                          </OfferingButton>
                        </li>
                      );
                    })}
                  </OfferingsList>
                )}
              </OfferingsPanel>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
