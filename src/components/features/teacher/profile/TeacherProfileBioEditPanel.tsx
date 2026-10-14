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
import { BOX_SHADOW_INPUTS } from "@/constants/layout.constants";
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

export interface TeacherProfileBioEditPanelProps {
  bio: string;
  onSaved?: () => void;
  saveLabel?: string;
}

export function TeacherProfileBioEditPanel({
  bio,
  onSaved,
  saveLabel = "Save",
}: TeacherProfileBioEditPanelProps) {
  const router = useRouter();
  const [isSaving, startTransition] = useActionPending();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [bioLocal, setBioLocal] = React.useState(bio);

  React.useEffect(() => {
    setBioLocal(bio);
  }, [bio]);

  function onSave() {
    const fd = new FormData();
    fd.set("bio", bioLocal);
    startTransition(async () => {
      const res = await saveTeacherBioTabAction(fd);
      setResult(res);
      if (res.ok) {
        router.refresh();
        onSaved?.();
      }
    });
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

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
        <Button type="button" variant="primary" isLoading={isSaving} onClick={onSave}>
          {saveLabel}
        </Button>
      </BioFieldFooter>
      {errs?.bio ? <ErrorText>{errs.bio}</ErrorText> : null}
      {result && !result.ok && !result.fieldErrors ? <ErrorText>{result.error}</ErrorText> : null}
    </Field>
  );
}
