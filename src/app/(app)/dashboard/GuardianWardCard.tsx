"use client";

import styled from "styled-components";
import { SmallPrimaryLink } from "@/components/ui/Link";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export const GuardianWardGrid = styled.ul`
  display: grid;
  gap: ${SPACING.THREE};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Item = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.THREE};
`;

const Name = styled.p`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Meta = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface GuardianWardCardProps {
  studentProfileId: string;
  studentName: string | null;
  enrollmentCount: number;
}

export function GuardianWardCard({
  studentProfileId,
  studentName,
  enrollmentCount,
}: GuardianWardCardProps) {
  return (
    <Item>
      <div>
        <Name>{studentName}</Name>
        <Meta>
          {enrollmentCount} active class{enrollmentCount === 1 ? "" : "es"}
        </Meta>
      </div>
      <SmallPrimaryLink href={`/guardian/w/${studentProfileId}`}>
        View profile
      </SmallPrimaryLink>
    </Item>
  );
}
