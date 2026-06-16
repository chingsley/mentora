"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { SPACING } from "@/constants/spacing.constants";

const Frame = styled.div`
  position: relative;
  width: 100%;
  max-width: 28rem;
  margin-inline: auto;
  border-radius: ${MARKETING.CARD_RADIUS};
  border: 1px solid ${COLORS.MARKETING_CARD_BORDER};
  background-color: ${COLORS.FOREGROUND};
  box-shadow: ${MARKETING.CARD_SHADOW};
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.TWO};
  padding: ${SPACING.THREE} ${SPACING.FOUR};
  border-bottom: 1px solid ${COLORS.MARKETING_BORDER};
  background-color: ${COLORS.SURFACE_OFF_WHITE};
`;

const Dot = styled.span<{ $tone: "primary" | "muted" | "accent" }>`
  width: ${SPACING.TWO};
  height: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${(p) => {
    if (p.$tone === "primary") return COLORS.ACTION_PRIMARY;
    if (p.$tone === "accent") return COLORS.ACCENT;
    return COLORS.MARKETING_BORDER_STRONG;
  }};
`;

const TopLabel = styled.span`
  margin-left: ${SPACING.TWO};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MARKETING_TEXT_TERTIARY};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  padding: ${SPACING.FIVE};
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${SPACING.THREE};
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  padding: ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.SURFACE_OFF_WHITE};
  border: 1px solid ${COLORS.MARKETING_BORDER};
`;

const StatValue = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const StatLabel = styled.span`
  font-size: ${FONTS.SIZE.MICRO};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.MARKETING_TEXT_TERTIARY};
`;

const SessionCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.MARKETING_BORDER};
  background: linear-gradient(135deg, ${COLORS.ACTION_PRIMARY_TINT_10} 0%, ${COLORS.FOREGROUND} 100%);
`;

const SessionTitle = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const SessionMeta = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

const SessionButton = styled.span`
  align-self: flex-start;
  margin-top: ${SPACING.TWO};
  padding: ${SPACING.TWO} ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.ACTION_PRIMARY};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.WHITE};
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.THREE};
  padding: ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.MARKETING_BORDER};
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

const Pill = styled.span`
  padding: ${SPACING.ONE} ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  font-size: ${FONTS.SIZE.MICRO};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.ACTION_PRIMARY};
`;

export function MarketingProductPreview() {
  return (
    <Frame aria-hidden>
      <TopBar>
        <Dot $tone="accent" />
        <Dot $tone="muted" />
        <Dot $tone="muted" />
        <TopLabel>Mentora dashboard</TopLabel>
      </TopBar>
      <Body>
        <StatRow>
          <StatCard>
            <StatValue>3</StatValue>
            <StatLabel>Active classes</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>92%</StatValue>
            <StatLabel>Attendance</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>A</StatValue>
            <StatLabel>Avg. grade</StatLabel>
          </StatCard>
        </StatRow>
        <SessionCard>
          <SessionTitle>Algebra II · Live now</SessionTitle>
          <SessionMeta>Today · 4:00 PM · 45 min</SessionMeta>
          <SessionButton>Join class</SessionButton>
        </SessionCard>
        <List>
          <ListItem>
            <span>Physics homework</span>
            <Pill>Due Fri</Pill>
          </ListItem>
          <ListItem>
            <span>Spanish conversation</span>
            <Pill>Tomorrow</Pill>
          </ListItem>
        </List>
      </Body>
    </Frame>
  );
}
