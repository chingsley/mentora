"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  clearRateAction,
  saveRateAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";

export interface RateSubject {
  id: string;
  name: string;
}

export interface RateRegion {
  id: string;
  code: string;
  name: string;
  currency: string;
  minMajor: number;
}

export interface RateCell {
  subjectId: string;
  regionCode: string;
  hourlyMajor: number;
}

export interface TeacherRatesGridProps {
  subjects: RateSubject[];
  regions: RateRegion[];
  rates: RateCell[];
}

const Empty = styled.p`
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Scroll = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 640px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: ${FONTS.SIZE.SM};
`;

const StickyTh = styled.th`
  position: sticky;
  left: 0;
  z-index: 10;
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  text-align: left;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Th = styled.th`
  padding: ${SPACING.TWO} ${SPACING.THREE};
  text-align: left;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const ThStack = styled.div`
  display: flex;
  flex-direction: column;
`;

const ThMeta = styled.span`
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Row = styled.tr`
  vertical-align: top;
`;

const RowHead = styled.th`
  position: sticky;
  left: 0;
  z-index: 10;
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.THREE};
  text-align: left;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Cell = styled.td`
  border-top: 1px solid ${COLORS.BORDER};
  padding: ${SPACING.THREE};
  vertical-align: middle;
`;

const EditStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const EditRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const NumberInput = styled.input`
  height: 2.25rem;
  width: 7rem;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${SPACING.TWO};
  text-align: right;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};
`;

const Suffix = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${SPACING.TWO};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};
`;

const RateButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px dashed ${COLORS.BORDER};
  background-color: transparent;
  padding: ${SPACING.TWO} ${SPACING.THREE};
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: rgba(23, 32, 51, 0.3);
    background-color: rgba(23, 32, 51, 0.03);
  }
`;

const RateValue = styled.span`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const RatePlaceholder = styled.span`
  color: ${COLORS.MUTED_FOREGROUND};
`;

const RateAction = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export function TeacherRatesGrid({ subjects, regions, rates }: TeacherRatesGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [editing, setEditing] = React.useState<string | null>(null);
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const rateMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rates) map.set(key(r.subjectId, r.regionCode), r.hourlyMajor);
    return map;
  }, [rates]);

  function key(subjectId: string, regionCode: string) {
    return `${subjectId}::${regionCode}`;
  }

  function startEdit(subjectId: string, regionCode: string) {
    const current = rateMap.get(key(subjectId, regionCode));
    setEditing(key(subjectId, regionCode));
    setValue(current !== undefined ? String(current) : "");
    setError(null);
  }

  function onSave(subjectId: string, regionCode: string) {
    setError(null);
    const fd = new FormData();
    fd.append("subjectId", subjectId);
    fd.append("regionCode", regionCode);
    fd.append("hourlyRateMajor", value);
    startTransition(async () => {
      const res: ActionResult = await saveRateAction(fd);
      if (!res.ok) {
        setError(res.fieldErrors?.hourlyRateMajor ?? res.error);
        return;
      }
      setEditing(null);
      router.refresh();
    });
  }

  function onClear(subjectId: string, regionCode: string) {
    const fd = new FormData();
    fd.append("subjectId", subjectId);
    fd.append("regionCode", regionCode);
    startTransition(async () => {
      await clearRateAction(fd);
      setEditing(null);
      router.refresh();
    });
  }

  if (subjects.length === 0) {
    return (
      <Empty>
        Pick your subjects above first — you&apos;ll then be able to set a
        per-subject hourly rate for each region.
      </Empty>
    );
  }

  return (
    <Scroll>
      <Table>
        <thead>
          <tr>
            <StickyTh>Subject</StickyTh>
            {regions.map((r) => (
              <Th key={r.code}>
                <ThStack>
                  <span>{r.name}</span>
                  <ThMeta>
                    {r.currency} &middot; min {r.minMajor}
                  </ThMeta>
                </ThStack>
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subjects.map((s) => (
            <Row key={s.id}>
              <RowHead scope="row">{s.name}</RowHead>
              {regions.map((r) => {
                const cellKey = key(s.id, r.code);
                const current = rateMap.get(cellKey);
                const isEditing = editing === cellKey;
                return (
                  <Cell key={r.code}>
                    {isEditing ? (
                      <EditStack>
                        <EditRow>
                          <NumberInput
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.01"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={`${r.minMajor}`}
                            autoFocus
                          />
                          <Suffix>{r.currency}/hr</Suffix>
                        </EditRow>
                        <ButtonRow>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onSave(s.id, r.code)}
                            isLoading={isPending}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditing(null)}
                          >
                            Cancel
                          </Button>
                          {current !== undefined ? (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => onClear(s.id, r.code)}
                            >
                              Remove
                            </Button>
                          ) : null}
                        </ButtonRow>
                        {error ? <ErrorText>{error}</ErrorText> : null}
                      </EditStack>
                    ) : (
                      <RateButton type="button" onClick={() => startEdit(s.id, r.code)}>
                        {current !== undefined ? (
                          <RateValue>
                            {current} {r.currency}/hr
                          </RateValue>
                        ) : (
                          <RatePlaceholder>Set rate</RatePlaceholder>
                        )}
                        <RateAction aria-hidden>
                          {current !== undefined ? "Edit" : "+"}
                        </RateAction>
                      </RateButton>
                    )}
                  </Cell>
                );
              })}
            </Row>
          ))}
        </tbody>
      </Table>
    </Scroll>
  );
}
