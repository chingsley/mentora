"use client";

import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface TeacherProfileWelcomeScreenProps {
  fullName: string;
  onSetupProfile: () => void;
  onSetupLater: () => void;
}

const FullScreen = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${LAYOUT.Z.MODAL};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${LAYOUT.PAGE_INSET.BLOCK} ${LAYOUT.PAGE_INSET.INLINE};
  overflow-y: auto;
  background-color: ${LAYOUT.APP_SHELL.MAIN_BACKGROUND};
`;

const Content = styled.div`
  display: flex;
  width: 100%;
  max-width: 36rem;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.EIGHT};
  margin-inline: auto;
  text-align: center;
`;

const Intro = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.FOUR};
`;

const Eyebrow = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  text-transform: uppercase;
  color: ${COLORS.SIDEBAR_BRAND};
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${FONTS.SIZE.AUTH_HERO_TITLE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${COLORS.HEADER};

  ${LAYOUT.MEDIA.MD} {
    font-size: ${FONTS.SIZE["3XL"]};
  }
`;

const Lead = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.BASE};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  width: 100%;
  max-width: 20rem;

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    max-width: none;
    justify-content: center;
  }
`;

const PrimaryAction = styled(Button)`
  min-width: 12rem;
`;

const SecondaryAction = styled(Button)`
  min-width: 12rem;
`;

function welcomeFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "";
}

export function TeacherProfileWelcomeScreen({
  fullName,
  onSetupProfile,
  onSetupLater,
}: TeacherProfileWelcomeScreenProps) {
  const firstName = welcomeFirstName(fullName);
  const greeting = firstName ? `Welcome to Mentora, ${firstName}` : "Welcome to Mentora";

  return (
    <FullScreen role="dialog" aria-modal="true" aria-labelledby="teacher-welcome-title">
      <Content>
        <Intro>
          <Eyebrow>Teacher onboarding</Eyebrow>
          <Title id="teacher-welcome-title">{greeting}</Title>
          <Lead>
            Before you start using Mentora, complete a quick four-step profile setup so students can
            discover you, understand what you teach, and book your classes.
          </Lead>
        </Intro>

        <Actions>
          <PrimaryAction type="button" onClick={onSetupProfile}>
            Set up profile
          </PrimaryAction>
          <SecondaryAction type="button" variant="secondary" onClick={onSetupLater}>
            Set up later
          </SecondaryAction>
        </Actions>
      </Content>
    </FullScreen>
  );
}
