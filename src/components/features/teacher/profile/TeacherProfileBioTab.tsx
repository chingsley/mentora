"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { TriangleAlert } from "lucide-react";
import styled from "styled-components";
import { saveTeacherBioTabAction, type ActionResult } from "@/app/(app)/profile/actions";
import { ProfilePhotoForm } from "@/components/features/teacher/ProfilePhotoForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors.constants";
import { APP_INPUT_HEIGHT, FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_INPUTS, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  TeacherProfileFormSurface,
  TEACHER_PROFILE_FORM_SURFACE_PADDING,
  TEACHER_PROFILE_FORM_SURFACE_PADDING_BOTTOM,
} from "./TeacherProfileFormSurface";
import { TEACHER_BIO_FORM_ID } from "./teacherProfileFormIds";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";

/** Padding inset for the merged profile card (used for negative-margin separators). */
const BIO_MERGED_CARD_PADDING = TEACHER_PROFILE_FORM_SURFACE_PADDING;

/** Shared tokens for the merged photo + bio card (screenshot-style sections). */
const BIO_MERGED_CARD = {
  padding: TEACHER_PROFILE_FORM_SURFACE_PADDING,
  /** Extra space below the last block (e.g. form grid) before the card bottom edge */
  paddingBottom: TEACHER_PROFILE_FORM_SURFACE_PADDING_BOTTOM,
  radius: LAYOUT.RADIUS.LG,
  border: `1px solid ${COLORS.BORDER}`,
  /** Stronger than `COLORS.BORDER` (input chrome) for in-card section rules */
  separatorColor: COLORS.HEADER_BORDER_15,
  asideHintColor: COLORS.SIDEBAR_BRAND,
} as const;

const SectionAsideTitle = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const PhotoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  width: 100%;
`;

const PhotoGuidanceText = styled.p`
  display: flex;
  gap: ${SPACING.TWO};
  margin-bottom: 1rem;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const WarningIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-self: baseline;
  line-height: 0;
  color: ${COLORS.DESTRUCTIVE};
`;

/** Matches Tabs inactive tab label color (Tabs TabButton default state). */
const PhotoGuidanceSpan = styled.span`
  color: ${COLORS.MUTED_FOREGROUND};
`;

/** Bio composer beside the studio avatar: row on ≥SM, stacks on narrow viewports. */
const BioComposerRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${SPACING.THREE};
  width: 100%;
`;

const AboutBioSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  width: 100%;
  align-items: flex-start;
`;

const SectionSeparator = styled.div`
  height: 1px;
  // margin: ${SPACING.SIX} calc(-1 * ${BIO_MERGED_CARD_PADDING});
  margin: 0 0 1.5rem 0;
  background: ${BIO_MERGED_CARD.separatorColor};
`;


const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  min-width: 8rem;
`;

/** Matches `Tabs` underline variant selected tab (`TabButton` active). */
const FieldLabel = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  line-height: 1.4;
`;

const Textarea = styled.textarea`
  min-height: 12rem;
  width: 100%;
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${formFieldControlBorder(false)};
  box-shadow: ${BOX_SHADOW_INPUTS};
  padding: ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.TEXT};
  line-height: 1.5;
  outline: none;
  resize: vertical;
  background-color: inherit;

  &::placeholder {
    color: ${COLORS.MUTED_FOREGROUND};
    font-weight: ${FONTS.WEIGHT.NORMAL};
  }

  &:focus {
    border-color: ${COLORS.SIDEBAR_BRAND};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const Counter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: -1.875rem;
  padding-right: ${SPACING.THREE};
  pointer-events: none;
  font-size: ${FONTS.SIZE.XS};
  color: ${BIO_MERGED_CARD.asideHintColor};
`;

const TagWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
  align-items: center;
  min-height: ${APP_INPUT_HEIGHT};
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${formFieldControlBorder(false)};
  box-shadow: ${BOX_SHADOW_INPUTS};
  padding: ${SPACING.TWO};

  &:focus-within {
    border-color: ${COLORS.SIDEBAR_BRAND};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.ACTION_PRIMARY_TINT_16};
  padding: 0.125rem 0.5rem;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.ACTION_PRIMARY};
`;

const TagRemove = styled.button`
  display: inline-flex;
  border: none;
  background: transparent;
  padding: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: 1;
  color: ${COLORS.MUTED_FOREGROUND};
  cursor: pointer;

  &:hover {
    color: ${COLORS.DESTRUCTIVE};
  }
`;

const TagInput = styled.input`
  min-width: 8rem;
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.25rem;
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.TEXT};
  outline: none;

  &::placeholder {
    color: ${COLORS.MUTED_FOREGROUND};
    font-weight: ${FONTS.WEIGHT.NORMAL};
  }
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  width: 100%;
  min-width: 0;
  align-items: stretch;
`;

const FormGrid = styled.div`
  display: grid;
  width: 100%;
  min-width: 0;
  grid-template-columns: 1fr;
  row-gap: ${SPACING.FIVE};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: ${SPACING.SIX};
    row-gap: ${SPACING.SIX};
    align-items: start;
  }

  & > * {
    min-width: 0;
  }
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

/** Footer with Back (left) + Save & Continue (right). Stacks below `SM`. */
const FormFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  width: 100%;
  margin-top: ${SPACING.SIX};

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const BIO_MAX = 2000;

function parseLanguageTags(raw: string): string[] {
  return raw
    .split(/[,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export interface TeacherProfileBioTabProps {
  initials: string;
  imageUrl: string | null;
  bio: string;
  spokenLanguages: string;
  locationLabel: string;
  onAdvance: () => void;
  onBack: () => void;
}

export function TeacherProfileBioTab({
  initials,
  imageUrl,
  bio,
  spokenLanguages,
  locationLabel,
  onAdvance,
  onBack,
}: TeacherProfileBioTabProps) {
  const router = useRouter();
  const [isSaving, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  const [bioLocal, setBioLocal] = React.useState(bio);
  const [tags, setTags] = React.useState<string[]>(() => parseLanguageTags(spokenLanguages));
  const [tagDraft, setTagDraft] = React.useState("");

  function commitDraft() {
    const next = tagDraft.trim();
    if (!next) return;
    setTags((prev) => (prev.includes(next) ? prev : [...prev, next]));
    setTagDraft("");
  }

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("bio", bioLocal);
    fd.set("spokenLanguages", tags.join(", "));
    startTransition(async () => {
      const res = await saveTeacherBioTabAction(fd);
      setResult(res);
      if (res.ok) {
        router.refresh();
        onAdvance();
      }
    });
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <TeacherProfileFormSurface id={TEACHER_BIO_FORM_ID} onSubmit={onSubmit}>
      <PhotoSection aria-labelledby="teacher-bio-photo-heading">
        <SectionAsideTitle id="teacher-bio-photo-heading">Profile Photo &amp; Bio</SectionAsideTitle>
        <BioComposerRow>
          <ProfilePhotoForm
            layout="studio"
            currentImage={imageUrl}
            fallbackInitials={initials}
            hint=""
          />
          <Field>
            <FieldLabel>Share your experience, teaching style, and what students can expect.</FieldLabel>
            <Textarea
              name="bio"
              value={bioLocal}
              maxLength={BIO_MAX}
              onChange={(e) => setBioLocal(e.target.value)}
              placeholder="Write here"
            />
            <Counter>
              {bioLocal.length} / {BIO_MAX}
            </Counter>
            {errs?.bio ? <ErrorText>{errs.bio}</ErrorText> : null}
          </Field>
        </BioComposerRow>
        <PhotoGuidanceText>
          <WarningIcon aria-hidden>
            <TriangleAlert size={ICON_SIZE.LG} strokeWidth={ICON_STROKE.MEDIUM} />
          </WarningIcon>
          <PhotoGuidanceSpan>
            Important: Add a clear, recent photo. Students use this to recognize you before class. Students may leave your class if your appearance does not match your profile photo.
          </PhotoGuidanceSpan>
        </PhotoGuidanceText>
      </PhotoSection>

      <SectionSeparator aria-hidden />

      <AboutBioSection aria-labelledby="teacher-bio-about-heading">
        <Stack>
          <FormGrid>
            <Field>
              <FieldLabel>Languages spoken</FieldLabel>
              <TagWrap>
                {tags.map((t) => (
                  <Tag key={t}>
                    {t}
                    <TagRemove
                      type="button"
                      aria-label={`Remove ${t}`}
                      onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                    >
                      ×
                    </TagRemove>
                  </Tag>
                ))}
                <TagInput
                  aria-label="Add a language"
                  placeholder="Type a language, press Enter"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={onTagKeyDown}
                  onBlur={commitDraft}
                />
              </TagWrap>
              {errs?.spokenLanguages ? <ErrorText>{errs.spokenLanguages}</ErrorText> : null}
            </Field>
            <Input
              name="locationLabel"
              label="Location (display)"
              placeholder="e.g. Brazil, Lagos, Remote"
              defaultValue={locationLabel}
              error={errs?.locationLabel}
            />
          </FormGrid>
        </Stack>
      </AboutBioSection>
      {result && !result.ok && !result.fieldErrors ? <ErrorText>{result.error}</ErrorText> : null}

      <FormFooter>
        <Button type="button" variant="secondary" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button type="submit" variant="primary" isLoading={isSaving}>
          Save &amp; Continue
        </Button>
      </FormFooter>
    </TeacherProfileFormSurface>
  );
}
