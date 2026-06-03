"use client";

import { ArrowRight, Pencil, User } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { FORM_FIELD } from "@/constants/formField.constants";
import { ICON_SIZE, ICON_STROKE, ICON_THEME } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { SessionOccurrenceSnapshot } from "@/lib/sessionOccurrenceKey";
import { addStudentSessionCommentAction } from "@/app/(app)/classes/sessionActions";

const Empty = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const CommentSectionContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${SPACING.THREE};
  width: 100%;
`;

const CommentItem = styled.article`
  display: flex;
  align-items: flex-start;
  gap: ${SPACING.THREE};
`;

const AvatarWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${SPACING.TEN};
  height: ${SPACING.TEN};
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${ICON_THEME.AVATAR_PLACEHOLDER_BACKGROUND};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const StatusDot = styled.span`
  position: absolute;
  right: 0;
  bottom: 0;
  width: ${SPACING.TWO};
  height: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 2px solid ${COLORS.FOREGROUND};
  background-color: ${COLORS.SUCCESS};
`;

const CommentContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${SPACING.ONE};
  min-width: 0;
`;

const CommentAuthor = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const CommentTimestamp = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const CommentBodyRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${SPACING.TWO};
  margin-top: ${SPACING.ONE};
`;

const CommentBody = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.HEADER};
  white-space: pre-wrap;
`;

const EditCommentButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
  padding: 0;
  border: none;
  background: none;
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.ACTION_PRIMARY};
  cursor: pointer;

  &:hover {
    color: ${COLORS.ACTION_PRIMARY_HOVER};
  }

  &:focus-visible {
    outline: none;
    border-radius: ${LAYOUT.RADIUS.SM};
    box-shadow: 0 0 0 3px ${COLORS.ACTION_PRIMARY_RING_28};
  }
`;

const ReplyComposer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  width: 100%;
`;

const ReplyField = styled.div`
  position: relative;
  width: 100%;
`;

const ReplyTextarea = styled.textarea`
  display: block;
  width: 100%;
  min-height: calc(${SPACING.FOUR} * 2.5);
  border: none;
  border-bottom: ${FORM_FIELD.CONTROL_BORDER_WIDTH} solid ${COLORS.BORDER};
  border-radius: 0;
  background-color: ${COLORS.TRANSPARENT};
  padding: ${SPACING.THREE} calc(${SPACING.TEN} + ${SPACING.TWO}) ${SPACING.THREE} 0;
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.HEADER};
  resize: vertical;

  &::placeholder {
    color: ${COLORS.MUTED_FOREGROUND};
  }

  &:focus-visible {
    outline: none;
    border-bottom-color: ${COLORS.ACTION_PRIMARY};
  }
`;

const SendButton = styled.button`
  position: absolute;
  right: 0;
  bottom: ${SPACING.TWO};
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${SPACING.TEN};
  height: ${SPACING.TEN};
  border: none;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.ACTION_PRIMARY};
  color: ${COLORS.WHITE};
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${COLORS.ACTION_PRIMARY_HOVER};
  }

  &:disabled {
    cursor: not-allowed;
    background-color: ${COLORS.MUTED};
    color: ${COLORS.MUTED_FOREGROUND};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${COLORS.ACTION_PRIMARY_RING_28};
  }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};
`;

export const CommentsSubsections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

export const CommentSubsection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

export const CommentSubheading = styled.h4`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export const CommentSubsectionDivider = styled.hr`
  margin: 0;
  border: none;
  border-top: 1px solid ${COLORS.BORDER};
`;

function formatCommentTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface CommentThreadEntryProps {
  authorName: string;
  timestampIso: string | null;
  body: string;
  onEdit?: () => void;
}

function CommentThreadEntry({ authorName, timestampIso, body, onEdit }: CommentThreadEntryProps) {
  return (
    <CommentItem>
      <AvatarWrap>
        <Avatar aria-hidden>
          <User size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
        </Avatar>
        <StatusDot aria-hidden />
      </AvatarWrap>
      <CommentContent>
        <CommentAuthor>{authorName}</CommentAuthor>
        {timestampIso ? (
          <CommentTimestamp>{formatCommentTimestamp(timestampIso)}</CommentTimestamp>
        ) : null}
        <CommentBodyRow>
          <CommentBody>{body}</CommentBody>
          {onEdit ? (
            <EditCommentButton type="button" onClick={onEdit} aria-label="Edit comment">
              <Pencil size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.MEDIUM} aria-hidden />
              Edit
            </EditCommentButton>
          ) : null}
        </CommentBodyRow>
      </CommentContent>
    </CommentItem>
  );
}

export interface SessionTeacherCommentPanelProps {
  teacherNote: string | null;
  teacherDisplayName: string;
  teacherNoteUpdatedAtIso: string | null;
}

export function SessionTeacherCommentPanel({
  teacherNote,
  teacherDisplayName,
  teacherNoteUpdatedAtIso,
}: SessionTeacherCommentPanelProps) {
  const hasComment = Boolean(teacherNote?.trim());

  return (
    <CommentSectionContent>
      {hasComment ? (
        <CommentThreadEntry
          authorName={teacherDisplayName}
          timestampIso={teacherNoteUpdatedAtIso}
          body={teacherNote!}
        />
      ) : (
        <Empty>No teacher comment for this session yet.</Empty>
      )}
    </CommentSectionContent>
  );
}

export interface SessionStudentCommentPanelProps {
  snapshot: SessionOccurrenceSnapshot;
  enrollmentId: string;
  studentDisplayName?: string;
  canAddComment?: boolean;
}

export function SessionStudentCommentPanel({
  snapshot,
  enrollmentId,
  studentDisplayName = "You",
  canAddComment = false,
}: SessionStudentCommentPanelProps) {
  const router = useRouter();
  const [commentState, setCommentState] = React.useState({
    note: snapshot.studentNote,
    updatedAtIso: snapshot.studentNoteUpdatedAtIso,
  });
  const hasComment = Boolean(commentState.note?.trim());
  const [draft, setDraft] = React.useState(snapshot.studentNote ?? "");
  const [isEditing, setIsEditing] = React.useState(!hasComment);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    const note = snapshot.studentNote ?? "";
    setCommentState({
      note: snapshot.studentNote,
      updatedAtIso: snapshot.studentNoteUpdatedAtIso,
    });
    setDraft(note);
    setIsEditing(!note.trim());
  }, [snapshot.studentNote, snapshot.studentNoteUpdatedAtIso]);

  async function handleComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Enter a comment before sending.");
      return;
    }
    const fd = new FormData();
    fd.set("enrollmentId", enrollmentId);
    fd.set("sessionDate", snapshot.sessionDateIso);
    fd.set("note", trimmed);
    startTransition(async () => {
      const res = await addStudentSessionCommentAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCommentState({ note: trimmed, updatedAtIso: res.updatedAtIso });
      setIsEditing(false);
      router.refresh();
    });
  }

  function startEditing() {
    setDraft(commentState.note ?? "");
    setError(null);
    setIsEditing(true);
  }

  const showComposer = canAddComment && (!hasComment || isEditing);

  return (
    <CommentSectionContent>
      {hasComment && !isEditing ? (
        <CommentThreadEntry
          authorName={studentDisplayName}
          timestampIso={commentState.updatedAtIso}
          body={commentState.note!}
          onEdit={canAddComment ? startEditing : undefined}
        />
      ) : null}

      {showComposer ? (
        <ReplyComposer onSubmit={handleComment}>
          <ReplyField>
            <ReplyTextarea
              name="note"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={2000}
              placeholder="Reply"
              aria-label="Your comment"
            />
            <SendButton type="submit" disabled={pending || !draft.trim()} aria-label="Send comment">
              <ArrowRight size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.BOLD} />
            </SendButton>
          </ReplyField>
          {error ? <ErrorText>{error}</ErrorText> : null}
        </ReplyComposer>
      ) : !hasComment ? (
        <Empty>You haven&apos;t added a comment for this session yet.</Empty>
      ) : null}
    </CommentSectionContent>
  );
}
