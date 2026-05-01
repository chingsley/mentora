"use client";

import Link from "next/link";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export const WardGrid = styled.ul`
  display: grid;
  gap: ${SPACING.THREE};
  list-style: none;
  padding: 0;
  margin: 0;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Tile = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.XL};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.FOUR};
  outline: 1px solid ${COLORS.RING_BLACK_5};
  outline-offset: -1px;
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(23, 32, 51, 0.03);
  }
`;

const Avatar = styled.span`
  display: flex;
  height: 3rem;
  width: 3rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: rgba(23, 32, 51, 0.1);
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  text-transform: uppercase;
  color: ${COLORS.HEADER};
`;

const Body = styled.div`
  min-width: 0;
`;

const Name = styled.p`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const Subtitle = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface WardLinkProps {
  studentProfileId: string;
  name: string;
  initials: string;
}

export function WardLink({ studentProfileId, name, initials }: WardLinkProps) {
  return (
    <li>
      <Tile href={`/guardian/w/${studentProfileId}`}>
        <Avatar>{initials}</Avatar>
        <Body>
          <Name>{name}</Name>
          <Subtitle>View profile &amp; schedule</Subtitle>
        </Body>
      </Tile>
    </li>
  );
}
