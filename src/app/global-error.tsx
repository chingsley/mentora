"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const Body = styled.body`
  min-height: 100dvh;
  background-color: ${COLORS.BACKGROUND};
  color: ${COLORS.TEXT};
  margin: 0;
`;

const Main = styled.main`
  margin: 0 auto;
  display: flex;
  min-height: 100dvh;
  max-width: 32rem;
  flex-direction: column;
  justify-content: center;
  gap: ${SPACING.FOUR};
  padding: 2.5rem ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    padding-left: ${SPACING.SIX};
    padding-right: ${SPACING.SIX};
  }
`;

const Title = styled.h1`
  font-size: ${FONTS.SIZE["2XL"]};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const Body2 = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Ref = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const RetryBtn = styled.button`
  display: inline-flex;
  height: 2.5rem;
  width: fit-content;
  align-items: center;
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.HEADER};
  padding: 0 ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.WHITE};
  border: none;
  cursor: pointer;

  &:hover {
    background-color: rgba(23, 32, 51, 0.9);
  }
`;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <Body>
        <Main>
          <Title>Something went wrong</Title>
          <Body2>We hit an unexpected error. Please try again.</Body2>
          {error.digest ? <Ref>Ref: {error.digest}</Ref> : null}
          <RetryBtn onClick={reset}>Try again</RetryBtn>
        </Main>
      </Body>
    </html>
  );
}
