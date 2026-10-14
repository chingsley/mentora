"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { formatTeacherWorkExperiencePeriod } from "@/lib/formatTeacherWorkExperiencePeriod";

const SectionTitle = styled.h2`
  margin: 0 0 ${SPACING.FOUR};
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
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const Card = styled.li`
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
`;

const CardHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: ${SPACING.TWO} ${SPACING.FOUR};
`;

const Company = styled.h3`
  margin: 0;
  font-size: ${FONTS.SIZE.MD};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const Dates = styled.span`
  font-size: ${FONTS.SIZE.META};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const Role = styled.p`
  margin: ${SPACING.TWO} 0 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MUTED_FOREGROUND};
`;

import type { TeacherPublicProfileWorkExperience } from "@/types/teacherPublicProfileWorkExperience";

export type { TeacherPublicProfileWorkExperience };

export interface TeacherPublicProfileExperiencePanelProps {
  experiences: TeacherPublicProfileWorkExperience[];
}

export function TeacherPublicProfileExperiencePanel({
  experiences,
}: TeacherPublicProfileExperiencePanelProps) {
  return (
    <>
      <SectionTitle>Experience</SectionTitle>
      {experiences.length === 0 ? (
        <Muted>No work experience listed yet.</Muted>
      ) : (
        <List>
          {experiences.map((entry) => {
            const start = new Date(entry.startDate);
            const end = entry.endDate ? new Date(entry.endDate) : null;
            const period = formatTeacherWorkExperiencePeriod(start, end);

            return (
              <Card key={entry.id}>
                <CardHead>
                  <Company>{entry.company}</Company>
                  <Dates>{period}</Dates>
                </CardHead>
                <Role>{entry.role}</Role>
              </Card>
            );
          })}
        </List>
      )}
    </>
  );
}
