"use client";

import Image from "next/image";
import styled from "styled-components";
import { AppHyperLink } from "@/components/ui/Link";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { ICON_THEME } from "@/constants/iconTheme.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherDashboardMessageItem } from "@/types/teacherDashboard";
import {
  DashboardCard,
  DashboardCardBody,
  DashboardLink,
  TeacherDashboardCardHeader,
} from "./TeacherDashboardCard";

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 5px;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background: ${ICON_THEME.MAJE_BRAND};
  color: ${ICON_THEME.GLYPH_ON_FILLED_BOX};
  font-size: 0.625rem;
  font-weight: ${FONTS.WEIGHT.BOLD};
  box-shadow: ${ICON_THEME.METRIC_ICON_BOX_SHADOW};
`;

const FooterPad = styled.div`
  padding: 0 ${SPACING.SIX} ${SPACING.SIX};
`;

const List = styled.ul`
  margin: 0;
  padding: 0 ${SPACING.SIX} ${SPACING.SIX};
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const Item = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${SPACING.THREE};
`;

const Avatar = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${LAYOUT.RADIUS.FULL};
  overflow: hidden;
  flex-shrink: 0;
  background: ${ICON_THEME.AVATAR_PLACEHOLDER_BACKGROUND};
  color: ${ICON_THEME.AVATAR_PLACEHOLDER_GLYPH};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
  padding-right: ${SPACING.FOUR};
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const Name = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const Preview = styled.p`
  margin: ${SPACING.ONE} 0 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${DASHBOARD.TEXT_SECONDARY};
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Meta = styled.span`
  display: block;
  margin-top: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.XS};
  color: ${DASHBOARD.TEXT_MUTED};
`;

const Dot = styled.span`
  position: absolute;
  top: 6px;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background: ${ICON_THEME.MAJE_BRAND};
`;

const Empty = styled.p`
  margin: 0;
  padding: 0 ${SPACING.SIX} ${SPACING.SIX};
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
  line-height: 1.5;
`;

export interface TeacherRecentMessagesCardProps {
  items: TeacherDashboardMessageItem[];
}

export function TeacherRecentMessagesCard({ items }: TeacherRecentMessagesCardProps) {
  const unread = items.filter((m) => m.unread).length;

  return (
    <DashboardCard $flush>
      <TeacherDashboardCardHeader
        title="Recent messages"
        action={
          unread > 0 ? (
            <Badge aria-label={`${unread} unread`}>{unread > 9 ? "9+" : unread}</Badge>
          ) : null
        }
      />
      <DashboardCardBody $pad={false}>
        {items.length === 0 ? (
          <Empty>
            In-app messaging isn&apos;t available yet. We&apos;ll notify you when clients can reach you
            here.
          </Empty>
        ) : (
          <>
            <List>
              {items.map((item) => {
                const initials = item.senderName
                  .split(/\s+/)
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <Item key={item.id}>
                    <Avatar>
                      {item.senderImage ? (
                        <Image
                          src={item.senderImage}
                          alt=""
                          width={40}
                          height={40}
                          style={{ objectFit: "cover" }}
                          unoptimized
                        />
                      ) : (
                        initials
                      )}
                    </Avatar>
                    <Body>
                      <NameRow>
                        <Name>{item.senderName}</Name>
                        {item.unread ? <Dot aria-label="Unread" /> : null}
                      </NameRow>
                      <Preview>{item.preview}</Preview>
                      <Meta>{item.timeAgo}</Meta>
                    </Body>
                  </Item>
                );
              })}
            </List>
            <FooterPad>
              <DashboardLink>
                <AppHyperLink href="/dashboard">Go to Messages →</AppHyperLink>
              </DashboardLink>
            </FooterPad>
          </>
        )}
      </DashboardCardBody>
    </DashboardCard>
  );
}
