"use client";

import { Briefcase, Plus } from "lucide-react";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_BOX_TYPE, ICON_SIZE, ICON_STROKE, ICON_THEME } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { formatTeacherWorkExperiencePeriod } from "@/lib/formatTeacherWorkExperiencePeriod";
import type { TeacherPublicProfileWorkExperience } from "@/types/teacherPublicProfileWorkExperience";
import { TeacherPublicProfileRowActions } from "./TeacherPublicProfileRowActions";

export type { TeacherPublicProfileWorkExperience };

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.THREE};
  margin-bottom: ${SPACING.FOUR};
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.UI_LARGE};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${COLORS.HEADER};
`;

const Muted = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: ${SPACING.TWO};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Row = styled.li`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  min-width: 0;
  padding: ${SPACING.THREE} ${SPACING.FOUR};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${LAYOUT.RADIUS.LG};
  background-color: ${COLORS.FOREGROUND};

  @media (hover: hover) {
    &:hover {
      background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
    }
  }
`;

const IconBox = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  height: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${ICON_BOX_TYPE.SECONDARY.background};
  border: ${ICON_BOX_TYPE.SECONDARY.border};
  color: ${ICON_BOX_TYPE.SECONDARY.color};
`;

const TextColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.HALF};
`;

const Company = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.span`
  font-size: ${FONTS.SIZE.META};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export interface TeacherPublicProfileExperiencePanelProps {
  experiences: TeacherPublicProfileWorkExperience[];
  onEditExperience?: (id: string) => void;
  onDeleteExperience?: (id: string) => void;
  onAddExperience?: () => void;
}

export function TeacherPublicProfileExperiencePanel({
  experiences,
  onEditExperience,
  onDeleteExperience,
  onAddExperience,
}: TeacherPublicProfileExperiencePanelProps) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const showActions = Boolean(onEditExperience || onDeleteExperience);

  return (
    <section>
      <SectionHeader>
        <SectionTitle>Experience</SectionTitle>
        {onAddExperience ? (
          <Button type="button" onClick={onAddExperience}>
            <Plus size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.MEDIUM} aria-hidden />
            Add experience
          </Button>
        ) : null}
      </SectionHeader>
      {experiences.length === 0 ? (
        <Muted>No work experience listed yet.</Muted>
      ) : (
        <List>
          {experiences.map((entry) => {
            const start = new Date(entry.startDate);
            const end = entry.endDate ? new Date(entry.endDate) : null;
            const period = formatTeacherWorkExperiencePeriod(start, end);

            return (
              <Row key={entry.id}>
                <IconBox aria-hidden>
                  <Briefcase size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.MEDIUM} />
                </IconBox>
                <TextColumn>
                  <Company>{entry.company}</Company>
                  <Meta>{entry.role} · {period}</Meta>
                </TextColumn>
                {showActions ? (
                  <TeacherPublicProfileRowActions
                    itemId={entry.id}
                    itemLabel={entry.company}
                    open={openMenuId === entry.id}
                    onOpenChange={(next) => setOpenMenuId(next ? entry.id : null)}
                    onEdit={onEditExperience}
                    onDelete={onDeleteExperience}
                  />
                ) : null}
              </Row>
            );
          })}
        </List>
      )}
    </section>
  );
}
