"use client";

import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const Wrap = styled.div`
  border-radius: ${LAYOUT.RADIUS.XL};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.SIX};
  box-shadow: ${LAYOUT.SHADOW.SM};
  outline: 1px solid ${COLORS.RING_BLACK_5};
  outline-offset: -1px;
`;

const Title = styled.h2`
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const Body = styled.p`
  margin-top: ${SPACING.TWO};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Actions = styled.div`
  margin-top: ${SPACING.FOUR};
`;

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Wrap>
      <Title>Authentication error</Title>
      <Body>{error.message}</Body>
      <Actions>
        <Button onClick={reset}>Try again</Button>
      </Actions>
    </Wrap>
  );
}
