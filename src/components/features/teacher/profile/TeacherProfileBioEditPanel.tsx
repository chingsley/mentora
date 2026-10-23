"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useActionPending } from "@/hooks/useActionPending";
import styled from "styled-components";
import { saveTeacherBioTabAction, type ActionResult } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_INPUTS, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  TEACHER_BIO_MAX_LENGTH,
  TEACHER_BIO_TEXTAREA_MIN_HEIGHT,
} from "@/constants/teacherProfile.constants";

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  min-width: 0;
  width: 100%;
`;

const BioCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
`;

const BioViewText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.GRAY_TEXT_SECONDARY};
  white-space: pre-wrap;
`;

const ViewFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Textarea = styled.textarea`
  min-height: ${TEACHER_BIO_TEXTAREA_MIN_HEIGHT};
  width: 100%;
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${formFieldControlBorder(false)};
  box-shadow: ${BOX_SHADOW_INPUTS};
  padding: ${SPACING.THREE} ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.TEXT};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  outline: none;
  resize: vertical;
  background-color: ${COLORS.FOREGROUND};

  &::placeholder {
    color: ${FORM_FIELD.PLACEHOLDER_COLOR};
  }

  &:focus {
    border-color: ${COLORS.SIDEBAR_BRAND};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const BioFieldFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.TWO};
`;

const EditActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${SPACING.TWO};
`;

const CharCounter = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.SIDEBAR_BRAND};
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const BIO_MAX = TEACHER_BIO_MAX_LENGTH;

const EMPTY_BIO_COPY = "You haven't written a bio yet. Tell students about your teaching style and experience.";

export interface TeacherProfileBioEditPanelProps {
  bio: string;
  onSaved?: () => void;
  saveLabel?: string;
  /** About tab: card in view mode, textarea when editing. Setup flow: always textarea. */
  presentation?: "alwaysEdit" | "viewEdit";
}

export function TeacherProfileBioEditPanel({
  bio,
  onSaved,
  saveLabel = "Save",
  presentation = "alwaysEdit",
}: TeacherProfileBioEditPanelProps) {
  const router = useRouter();
  const [isSaving, startTransition] = useActionPending();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [bioLocal, setBioLocal] = React.useState(bio);
  const [editing, setEditing] = React.useState(presentation === "alwaysEdit");

  React.useEffect(() => {
    setBioLocal(bio);
  }, [bio]);

  React.useEffect(() => {
    if (presentation === "alwaysEdit") {
      setEditing(true);
    }
  }, [presentation]);

  function onSave() {
    const fd = new FormData();
    fd.set("bio", bioLocal);
    startTransition(async () => {
      const res = await saveTeacherBioTabAction(fd);
      setResult(res);
      if (res.ok) {
        router.refresh();
        if (presentation === "viewEdit") {
          setEditing(false);
        }
        onSaved?.();
      }
    });
  }

  function onCancelEdit() {
    setBioLocal(bio);
    setResult(null);
    setEditing(false);
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;
  const viewText = bio.trim() || EMPTY_BIO_COPY;

  if (presentation === "viewEdit" && !editing) {
    return (
      <BioCard>
        <BioViewText>{viewText}</BioViewText>
        <ViewFooter>
          <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </ViewFooter>
      </BioCard>
    );
  }

  return (
    <Field htmlFor="teacher-profile-bio-inline">
      <Textarea
        id="teacher-profile-bio-inline"
        name="bio"
        rows={6}
        value={bioLocal}
        maxLength={BIO_MAX}
        onChange={(e) => setBioLocal(e.target.value)}
        placeholder="e.g. 8 years teaching maths; patient, exam-focused sessions."
      />
      <BioFieldFooter>
        <CharCounter aria-live="polite">
          {bioLocal.length} / {BIO_MAX}
        </CharCounter>
        {presentation === "viewEdit" ? (
          <EditActions>
            <Button type="button" variant="secondary" disabled={isSaving} onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button type="button" variant="primary" isLoading={isSaving} onClick={onSave}>
              {saveLabel}
            </Button>
          </EditActions>
        ) : (
          <Button type="button" variant="primary" isLoading={isSaving} onClick={onSave}>
            {saveLabel}
          </Button>
        )}
      </BioFieldFooter>
      {errs?.bio ? <ErrorText>{errs.bio}</ErrorText> : null}
      {result && !result.ok && !result.fieldErrors ? <ErrorText>{result.error}</ErrorText> : null}
    </Field>
  );
}
