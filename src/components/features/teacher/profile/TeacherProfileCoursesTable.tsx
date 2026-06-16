"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
export interface TeacherProfileCoursesTableProps {
  taughtSubjects: { id: string; name: string; defaultCap: number | null }[];
  globalCap: number;
  onEditSubject?: (subjectId: string) => void;
  onDeleteSubject?: (subjectId: string) => void;
}

const TableScroll = styled.div`
  width: 100%;
  min-width: ${LAYOUT.TABLE_MIN_WIDTH};
  overflow-x: auto;
`;

const TableEl = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  color: ${COLORS.TEXT};
`;

const Thead = styled.thead`
  border-bottom: 1px solid ${COLORS.BORDER};
`;

const ThBase = styled.th<{ $textAlign: "left" | "right" | "center" }>`
  box-sizing: border-box;
  height: ${SPACING.TEN};
  padding: 0 ${SPACING.TWO};
  vertical-align: middle;
  text-align: ${(p) => p.$textAlign};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Tbody = styled.tbody`
  & > tr:nth-child(odd) {
    background-color: ${COLORS.BACKGROUND};
  }

  & > tr:nth-child(even) {
    background-color: ${COLORS.FOREGROUND};
  }

  & > tr[data-interactive="true"]:hover {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
  }

  @media (prefers-reduced-motion: no-preference) {
    & > tr[data-interactive="true"] {
      transition: background-color 0.15s ease;
    }
  }
`;

const Td = styled.td<{ $textAlign?: "left" | "right" }>`
  box-sizing: border-box;
  padding: ${SPACING.TWO} ${SPACING.TWO};
  vertical-align: middle;
  text-align: ${(p) => p.$textAlign ?? "left"};

  &:first-child {
    border-top-left-radius: ${LAYOUT.RADIUS.SM};
    border-bottom-left-radius: ${LAYOUT.RADIUS.SM};
  }

  &:last-child {
    border-top-right-radius: ${LAYOUT.RADIUS.SM};
    border-bottom-right-radius: ${LAYOUT.RADIUS.SM};
  }
`;

const Tfoot = styled.tfoot`
  border-top: 1px solid ${COLORS.BORDER};
`;

const Tf = styled.td<{ $textAlign?: "left" | "right" }>`
  box-sizing: border-box;
  padding: ${SPACING.THREE} ${SPACING.TWO};
  vertical-align: middle;
  text-align: ${(p) => p.$textAlign ?? "left"};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const EmptyState = styled.p`
  margin: 0;
  padding: ${SPACING.FOUR} 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ActionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: ${SPACING.ONE} ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  cursor: pointer;
  background-color: ${COLORS.TRANSPARENT};
  color: ${COLORS.ACTION_PRIMARY};

  &:hover {
    background-color: ${COLORS.ACTION_PRIMARY_TINT_06};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_28};
    outline-offset: ${SPACING.ONE};
  }
`;

const DeleteActionBtn = styled(ActionBtn)`
  color: ${COLORS.DESTRUCTIVE};

  &:hover {
    background-color: ${COLORS.DESTRUCTIVE_BG_HOVER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.DESTRUCTIVE_BORDER_HOVER};
    outline-offset: ${SPACING.ONE};
  }
`;

function formatTeacherClassLimit(defaultCap: number | null, adminCap: number): string {
  return String(defaultCap ?? adminCap);
}

export function TeacherProfileCoursesTable({
  taughtSubjects,
  globalCap,
  onEditSubject,
  onDeleteSubject,
}: TeacherProfileCoursesTableProps) {
  if (taughtSubjects.length === 0) {
    return (
      <TableScroll>
        <EmptyState>Add subjects on your profile to see them listed here.</EmptyState>
      </TableScroll>
    );
  }

  return (
    <TableScroll>
      <TableEl>
        <Thead>
          <tr>
            <ThBase scope="col" $textAlign="left">
              Subject
            </ThBase>
            <ThBase scope="col" $textAlign="left">
              Default class limit
            </ThBase>
            <ThBase scope="col" $textAlign="left">
              Action
            </ThBase>
          </tr>
        </Thead>
        <Tbody>
          {taughtSubjects.map((subject) => (
            <tr key={subject.id} data-interactive="true">
              <Td>{subject.name}</Td>
              <Td>{formatTeacherClassLimit(subject.defaultCap, globalCap)}</Td>
              <Td>
                <ActionGroup>
                  <ActionBtn
                    type="button"
                    aria-label={`Edit ${subject.name}`}
                    onClick={() => onEditSubject?.(subject.id)}
                  >
                    Edit
                  </ActionBtn>
                  <DeleteActionBtn
                    type="button"
                    aria-label={`Delete ${subject.name}`}
                    onClick={() => onDeleteSubject?.(subject.id)}
                  >
                    Delete
                  </DeleteActionBtn>
                </ActionGroup>
              </Td>
            </tr>
          ))}
        </Tbody>
        <Tfoot>
          <tr>
            <Tf colSpan={2}>Total courses</Tf>
            <Tf $textAlign="right">
              {taughtSubjects.length}
            </Tf>
          </tr>
        </Tfoot>
      </TableEl>
    </TableScroll>
  );
}
