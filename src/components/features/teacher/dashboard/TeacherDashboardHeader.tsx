"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Search } from "lucide-react";
import styled from "styled-components";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { ICON_BOX_TYPE, ICON_SIZE, ICON_STROKE, ICON_THEME } from "@/constants/iconTheme.constants";
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
  flex-shrink: 0;

  ${LAYOUT.MEDIA.MD} {
    text-align: left;
  }
`;

const HeaderTrailing = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.MD} {
    flex: 1;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: ${SPACING.THREE};
    width: auto;
  }
`;

const SearchWrap = styled.div`
  width: 100%;
  max-width: ${DASHBOARD.SEARCH_FIELD_MAX_WIDTH};
  min-width: 0;

  ${LAYOUT.MEDIA.MD} {
    flex: 0 1 ${DASHBOARD.SEARCH_FIELD_MAX_WIDTH};
    width: auto;
  }
`;

const Tools = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: ${SPACING.THREE};
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: ${FONTS.SIZE.PAGE_HEADER};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
  letter-spacing: -0.03em;
`;

const PageSubtitle = styled.p`
  margin: 0.25rem 0 0;
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
  line-height: 1.4;
`;

const SearchField = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  height: 2.75rem;
  padding: 0 ${SPACING.FOUR};
  border-radius: ${DASHBOARD.SEARCH_RADIUS};
  border: 1px solid ${DASHBOARD.BORDER_SUBTLE};
  background: ${COLORS.TRANSPARENT};
  box-shadow: none;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: ${COLORS.PRIMARY};
  }

  &:focus-within {
    border-color: ${COLORS.SIDEBAR_BRAND};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
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

const IconButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  height: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  border-radius: ${LAYOUT.RADIUS.LG};
  background: ${ICON_BOX_TYPE.SECONDARY.background};
  color: ${ICON_BOX_TYPE.SECONDARY.color};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: ${ICON_THEME.ACTION_LINK_BACKGROUND_HOVER};
  }

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
  font-size: ${FONTS.SIZE.MICRO};
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
  background: ${COLORS.TRANSPARENT};
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
  /** Page heading (default: Teacher Dashboard) */
  title?: string;
  /** Optional line below the heading */
  subtitle?: string | null;
  /** Placeholder for the shell search field */
  searchPlaceholder?: string;
  /** When false, hides the profile shortcut (e.g. on `/profile` where it is redundant). Default true. */
  showProfileLink?: boolean;
}

export function TeacherDashboardHeader({
  teacherName,
  teacherImage,
  notificationCount = 0,
  title = "Teacher Dashboard",
  subtitle,
  searchPlaceholder = "Search students, classes, schedule…",
  showProfileLink = true,
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
        <PageTitle>{title}</PageTitle>
        {subtitle ? <PageSubtitle>{subtitle}</PageSubtitle> : null}
      </TitleBlock>

      <HeaderTrailing>
        <SearchWrap>
          <SearchField>
            <Search size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} aria-hidden color={ICON_THEME.INLINE_SUBTLE} />
            <SearchInput
              type="search"
              name="dashboard-search"
              placeholder={searchPlaceholder}
              aria-label="Search dashboard"
            />
          </SearchField>
        </SearchWrap>

        <Tools>
          <IconButton type="button" aria-label="Notifications">
            <Bell size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
            {notificationCount > 0 ? <Badge aria-hidden>{notificationCount > 9 ? "9+" : notificationCount}</Badge> : null}
          </IconButton>

          {showProfileLink ? (
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
              <ChevronDown size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.MEDIUM} aria-hidden color={ICON_THEME.INLINE_SUBTLE} />
            </ProfileLink>
          ) : null}
        </Tools>
      </HeaderTrailing>
    </Wrap>
  );
}
