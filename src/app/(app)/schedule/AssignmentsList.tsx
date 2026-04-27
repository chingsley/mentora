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
  padding: 0;
  margin: 0;

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

const Title = styled.p`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Subject = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ManageLink = styled(Link)`
  display: inline-flex;
  height: 2.25rem;
  align-items: center;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    background-color: rgba(23, 32, 51, 0.06);
  }
`;

export interface AssignmentsListProps {
  offerings: { id: string; title: string; subjectName: string }[];
}

export function AssignmentsList({ offerings }: AssignmentsListProps) {
  return (
    <List>
      {offerings.map((o) => (
        <Row key={o.id}>
          <Body>
            <Title>{o.title}</Title>
            <Subject>{o.subjectName}</Subject>
          </Body>
          <ManageLink href={`/classes/${o.id}/assignments`}>
            Manage assignments
          </ManageLink>
        </Row>
      ))}
    </List>
  );
}
