"use client";

import Link from "next/link";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const List = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;

  & > li + li {
    border-top: 1px solid ${COLORS.BORDER};
  }
`;

const Row = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  padding: ${SPACING.THREE} 0;

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const Body = styled.div`
  min-width: 0;
`;

const TitleLink = styled(Link)`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Due = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Meta = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface AssignmentListItem {
  id: string;
  title: string;
  dueAt: string;
  submissionsCount: number;
}

export interface AssignmentListProps {
  offeringId: string;
  items: AssignmentListItem[];
  showCounts: boolean;
}

export function AssignmentList({ offeringId, items, showCounts }: AssignmentListProps) {
  return (
    <List>
      {items.map((a) => (
        <Row key={a.id}>
          <Body>
            <TitleLink href={`/classes/${offeringId}/assignments/${a.id}`}>
              {a.title}
            </TitleLink>
            <Due>Due {a.dueAt}</Due>
          </Body>
          {showCounts ? (
            <Meta>
              {a.submissionsCount} submission{a.submissionsCount === 1 ? "" : "s"}
            </Meta>
          ) : null}
        </Row>
      ))}
    </List>
  );
}
