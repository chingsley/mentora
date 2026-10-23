"use client";

import { BookOpen, Plus } from "lucide-react";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_BOX_TYPE, ICON_SIZE, ICON_STROKE, ICON_THEME } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TeacherPublicProfileRowActions } from "./TeacherPublicProfileRowActions";

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

const Empty = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
`;

const ListRoot = styled.ul`
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

const SubjectName = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
`;

const SubjectMeta = styled.span`
  font-size: ${FONTS.SIZE.META};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

export interface TeacherPublicProfileSubjectsPanelProps {
  subjects: { id: string; name: string; tenureLabel: string }[];
  onEditSubject?: (subjectId: string) => void;
  onDeleteSubject?: (subjectId: string) => void;
  onAddSubject?: () => void;
}

export function TeacherPublicProfileSubjectsPanel({
  subjects,
  onEditSubject,
  onDeleteSubject,
  onAddSubject,
}: TeacherPublicProfileSubjectsPanelProps) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const showActions = Boolean(onEditSubject || onDeleteSubject);

  return (
    <section>
      <SectionHeader>
        <SectionTitle>Subjects taught</SectionTitle>
        {onAddSubject ? (
          <Button type="button" onClick={onAddSubject}>
            <Plus size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.MEDIUM} aria-hidden />
            Add subject
          </Button>
        ) : null}
      </SectionHeader>
      {subjects.length === 0 ? (
        <Empty>No subjects listed yet.</Empty>
      ) : (
        <ListRoot>
          {subjects.map((subject) => (
            <Row key={subject.id}>
              <IconBox aria-hidden>
                <BookOpen size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.MEDIUM} />
              </IconBox>
              <TextColumn>
                <SubjectName>{subject.name}</SubjectName>
                <SubjectMeta>{subject.tenureLabel}</SubjectMeta>
              </TextColumn>
              {showActions ? (
                <TeacherPublicProfileRowActions
                  itemId={subject.id}
                  itemLabel={subject.name}
                  open={openMenuId === subject.id}
                  onOpenChange={(next) => setOpenMenuId(next ? subject.id : null)}
                  onEdit={onEditSubject}
                  onDelete={onDeleteSubject}
                />
              ) : null}
            </Row>
          ))}
        </ListRoot>
      )}
    </section>
  );
}
