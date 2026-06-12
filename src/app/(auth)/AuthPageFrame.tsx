"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styled from "styled-components";
import { AUTH } from "@/constants/auth.constants";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const AuthScene = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
`;

const BackgroundImage = styled(Image)`
  object-fit: cover;
  object-position: ${AUTH.BACKGROUND_OBJECT_POSITION};
`;

const SceneOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${AUTH.SCENE_OVERLAY};
  pointer-events: none;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${SPACING.EIGHT};
  width: 100%;
  max-width: ${AUTH.CONTENT_MAX_WIDTH};
  margin: 0 auto;
  padding: ${AUTH.CONTENT_PADDING};
  min-height: 100dvh;
  box-sizing: border-box;

  ${LAYOUT.MEDIA.LG} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${SPACING.TEN};
  }
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  max-width: ${AUTH.HERO_COPY_MAX_WIDTH};
  order: 2;

  ${LAYOUT.MEDIA.LG} {
    flex: 1;
    min-width: 0;
    order: 1;
    padding-right: ${SPACING.SIX};
  }
`;

const HeroTitle = styled.h2`
  margin: 0;
  font-size: ${AUTH.HERO_TITLE_SIZE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.HERO};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${AUTH.HERO_TITLE_COLOR};

  ${LAYOUT.MEDIA.LG} {
    font-size: ${AUTH.HERO_TITLE_SIZE_LG};
  }
`;

const HeroLead = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${AUTH.HERO_LEAD_COLOR};

  ${LAYOUT.MEDIA.LG} {
    font-size: ${FONTS.SIZE.MD};
  }
`;

const HeroLink = styled(Link)`
  align-self: flex-start;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${AUTH.HERO_LINK_COLOR};
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    opacity: 0.85;
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.WHITE};
    outline-offset: 3px;
    border-radius: ${LAYOUT.RADIUS.XS};
  }
`;

const FormColumn = styled.div`
  display: flex;
  flex-shrink: 0;
  width: 100%;
  justify-content: center;
  order: 1;

  ${LAYOUT.MEDIA.LG} {
    order: 2;
    width: min(100%, ${AUTH.CARD_MAX_WIDTH});
    justify-content: flex-end;
  }
`;

const AuthCard = styled.div`
  width: min(100%, ${AUTH.CARD_MAX_WIDTH});
  padding: ${AUTH.CARD_PADDING};
  background: ${COLORS.FOREGROUND};
  border: 1px solid ${COLORS.MARKETING_BORDER};
  border-radius: ${AUTH.CARD_RADIUS};
  box-shadow: ${AUTH.CARD_SHADOW};
`;

const Brand = styled(Link)`
  display: inline-block;
  margin-bottom: ${SPACING.FIVE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
  text-decoration: none;

  &:hover {
    color: ${COLORS.ACTION_PRIMARY};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_45};
    outline-offset: 2px;
    border-radius: ${LAYOUT.RADIUS.XS};
  }
`;

const Title = styled.h1`
  margin: 0 0 ${SPACING.TWO};
  font-size: ${FONTS.SIZE.AUTH_TITLE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
`;

const Lead = styled.p`
  margin: 0 0 ${SPACING.SIX};
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

export function AuthPageFrame({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <AuthScene>
      <BackgroundImage
        src={AUTH.HERO_IMAGE_PATH}
        alt=""
        fill
        priority
        sizes="100vw"
      />
      <SceneOverlay aria-hidden />

      <Content>
        <HeroCopy>
          <HeroTitle>Learn with great teachers, on your schedule.</HeroTitle>
          <HeroLead>
            Mentora connects students with vetted tutors, flexible scheduling, virtual
            classrooms, and progress you can trust.
          </HeroLead>
          <HeroLink href="/">Learn more</HeroLink>
        </HeroCopy>

        <FormColumn>
          <AuthCard>
            <Brand href="/">Mentora</Brand>
            <Title>{title}</Title>
            <Lead>{lead}</Lead>
            {children}
          </AuthCard>
        </FormColumn>
      </Content>
    </AuthScene>
  );
}
