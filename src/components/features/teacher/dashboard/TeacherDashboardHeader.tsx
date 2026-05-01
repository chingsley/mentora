"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Search } from "lucide-react";
import styled from "styled-components";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { ICON_THEME } from "@/constants/iconTheme.constants";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const Wrap = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  margin-bottom: ${SPACING.SIX};

  ${LAYOUT.MEDIA.MD} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${SPACING.FIVE};
  }
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.375rem;
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
  letter-spacing: -0.03em;
`;

const SearchWrap = styled.div`
  flex: 1;
  max-width: 36rem;
  min-width: 0;
`;

const SearchField = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  height: 2.75rem;
  padding: 0 ${SPACING.FOUR};
  border-radius: ${DASHBOARD.SEARCH_RADIUS};
  border: 1px solid ${DASHBOARD.BORDER_SUBTLE};
  background: ${COLORS.FOREGROUND};
  box-shadow: ${LAYOUT.SHADOW.SM};
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
  outline: none;

  &::placeholder {
    color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
  }
`;

const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
`;

const IconButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${DASHBOARD.BORDER_SUBTLE};
  background: ${COLORS.FOREGROUND};
  color: ${ICON_THEME.INLINE_MUTED};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${ICON_THEME.FOCUS_RING_NEUTRAL};
    outline-offset: 2px;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 1rem;
  height: 1rem;
  padding: 0 4px;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background: ${COLORS.DESTRUCTIVE};
  color: ${COLORS.WHITE};
  font-size: 0.625rem;
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  line-height: 1rem;
  text-align: center;
`;

const ProfileLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  padding: ${SPACING.ONE} ${SPACING.TWO} ${SPACING.ONE} ${SPACING.ONE};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${DASHBOARD.BORDER_SUBTLE};
  background: ${COLORS.FOREGROUND};
  text-decoration: none;
  color: inherit;

  &:focus-visible {
    outline: 2px solid ${ICON_THEME.FOCUS_RING_NEUTRAL};
    outline-offset: 2px;
  }
`;

const Avatar = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${LAYOUT.RADIUS.FULL};
  overflow: hidden;
  background: ${ICON_THEME.MAJE_BRAND};
  color: ${ICON_THEME.GLYPH_ON_FILLED_BOX};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
`;

const ProfileText = styled.div`
  display: none;
  min-width: 0;
  text-align: left;

  ${LAYOUT.MEDIA.SM} {
    display: block;
  }
`;

const ProfileName = styled.span`
  display: block;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const ProfileRole = styled.span`
  display: block;
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
`;

export interface TeacherDashboardHeaderProps {
  teacherName: string;
  teacherImage: string | null;
  notificationCount?: number;
}

export function TeacherDashboardHeader({
  teacherName,
  teacherImage,
  notificationCount = 0,
}: TeacherDashboardHeaderProps) {
  const initials = teacherName
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Wrap>
      <TitleBlock>
        <PageTitle>Teacher Dashboard</PageTitle>
      </TitleBlock>

      <SearchWrap>
        <SearchField>
          <Search size={18} strokeWidth={2} aria-hidden color={ICON_THEME.INLINE_SUBTLE} />
          <SearchInput
            type="search"
            name="dashboard-search"
            placeholder="Search students, classes, schedule…"
            aria-label="Search dashboard"
          />
        </SearchField>
      </SearchWrap>

      <Tools>
        <IconButton type="button" aria-label="Notifications">
          <Bell size={18} strokeWidth={2} />
          {notificationCount > 0 ? <Badge aria-hidden>{notificationCount > 9 ? "9+" : notificationCount}</Badge> : null}
        </IconButton>

        <ProfileLink href="/profile" aria-label="Open profile">
          <Avatar>
            {teacherImage ? (
              <Image src={teacherImage} alt="" width={40} height={40} style={{ objectFit: "cover" }} unoptimized />
            ) : (
              initials
            )}
          </Avatar>
          <ProfileText>
            <ProfileName>{teacherName}</ProfileName>
            <ProfileRole>Teacher</ProfileRole>
          </ProfileText>
          <ChevronDown size={16} strokeWidth={2} aria-hidden color={ICON_THEME.INLINE_SUBTLE} />
        </ProfileLink>
      </Tools>
    </Wrap>
  );
}
