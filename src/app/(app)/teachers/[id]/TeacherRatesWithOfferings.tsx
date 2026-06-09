"use client";

import { Check } from "lucide-react";
import * as React from "react";
import styled from "styled-components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { Role } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import type { CalendarEntry } from "@/components/features/calendar/types";
import { fillStatus } from "@/components/features/calendar/types";
import type { ClassDetail } from "@/components/features/class/ClassDetailsDialog";
import { formatPrice } from "@/lib/time";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { DEFAULT_OFFERING_RECURRENCE, formatRecurrenceLabel } from "@/lib/offeringRecurrence";
import { minutesToTime } from "@/lib/time";
import type { TeacherRateRow } from "./TeacherDetailView";

const OfferingActionButton = styled(Button)`
  padding: ${SPACING.ONE} ${SPACING.THREE};
  font-size: ${FONTS.SIZE["2XS"]};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  min-height: 0;
`;

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

const RateButton = styled.button<{ $expanded: boolean; }>`
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

const OfferingRow = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER_SUBTLE_LIGHT};
  padding: ${SPACING.FOUR};
  background-color: ${COLORS.BACKGROUND};
`;

const OfferingBody = styled.button`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  width: 100%;
  text-align: left;
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
  outline: none;

  &:focus-visible {
    border-radius: ${LAYOUT.RADIUS.SM};
    box-shadow: 0 0 0 2px ${COLORS.SIDEBAR_FOCUS_RING};
  }
`;

const OfferingActions = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const EnrolledMarker = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
  align-self: flex-start;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.STATUS_PRESENT_BG};
  background-color: ${COLORS.STATUS_PRESENT_BG};
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.STATUS_PRESENT_TEXT};
`;

const OfferingTitle = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
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
  detailsByOfferingId: Record<string, ClassDetail>;
  enrollmentByOfferingId: Record<string, string>;
  viewerRole: Role;
  pendingOfferingId: string | null;
  expandedSubjectId: string | null;
  onToggleSubject: (subjectId: string) => void;
  onOfferingClick: (offeringId: string) => void;
  onEnrol: (offeringId: string) => void;
}

function OfferingEnrollmentAction({
  offeringId,
  isFull,
  isBusy,
  onEnrol,
}: {
  offeringId: string;
  isFull: boolean;
  isBusy: boolean;
  onEnrol: (offeringId: string) => void;
}) {
  if (isFull) {
    return (
      <OfferingActionButton type="button" disabled onClick={(e) => e.stopPropagation()}>
        Class full
      </OfferingActionButton>
    );
  }

  return (
    <OfferingActionButton
      type="button"
      isLoading={isBusy}
      onClick={(e) => {
        e.stopPropagation();
        onEnrol(offeringId);
      }}
    >
      Enrol in this class
    </OfferingActionButton>
  );
}

export function TeacherRatesWithOfferings({
  rates,
  entries,
  detailsByOfferingId,
  enrollmentByOfferingId,
  viewerRole,
  pendingOfferingId,
  expandedSubjectId,
  onToggleSubject,
  onOfferingClick,
  onEnrol,
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
          Starting rates by subject (cheapest class shown). Select a subject to browse its classes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rates.length === 0 ? (
          <Muted>No published classes with rates yet.</Muted>
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
                  Same classes shown on the weekly schedule. Tap a class title for full details.
                </OfferingsHint>
                {expandedOfferings.length === 0 ? (
                  <Muted>No published classes for this subject yet.</Muted>
                ) : (
                  <OfferingsList>
                    {expandedOfferings.map((entry) => {
                      const status = fillStatus(entry);
                      const enrollmentId = enrollmentByOfferingId[entry.offeringId] ?? null;
                      const schedule = formatRecurrenceLabel(
                        entry.recurrence ?? DEFAULT_OFFERING_RECURRENCE,
                        entry.dayOfWeek,
                      );
                      const time = `${minutesToTime(entry.startMinutes)}–${minutesToTime(entry.endMinutes)}`;
                      const classRate = detailsByOfferingId[entry.offeringId]?.hourlyRate;
                      const rateLabel = classRate
                        ? `${formatPrice(classRate.amount, classRate.currency)}/hr`
                        : null;
                      return (
                        <OfferingRow key={entry.offeringId}>
                          <OfferingBody
                            type="button"
                            onClick={() => onOfferingClick(entry.offeringId)}
                          >
                            {enrollmentId ? (
                              <EnrolledMarker>
                                <Check
                                  size={ICON_SIZE.XS}
                                  strokeWidth={ICON_STROKE.BOLD}
                                  aria-hidden
                                />
                                Enrolled
                              </EnrolledMarker>
                            ) : null}
                            <OfferingTitle>{entry.title}</OfferingTitle>
                            <OfferingMeta>
                              {schedule} · {time}
                              {rateLabel ? ` · ${rateLabel}` : ""} · {entry.enrolled}/
                              {entry.effectiveCap} enrolled
                            </OfferingMeta>
                          </OfferingBody>
                          {viewerRole === "STUDENT" && !enrollmentId ? (
                            <OfferingActions>
                              <OfferingEnrollmentAction
                                offeringId={entry.offeringId}
                                isFull={status === "full"}
                                isBusy={pendingOfferingId === entry.offeringId}
                                onEnrol={onEnrol}
                              />
                            </OfferingActions>
                          ) : null}
                        </OfferingRow>
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
