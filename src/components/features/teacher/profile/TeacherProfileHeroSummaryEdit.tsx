"use client";

import { MapPin, MessageCircle, Type } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { saveTeacherHeroSummaryAction, type ActionResult } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import type { SearchComboboxOption } from "@/components/ui/SearchCombobox";
import { COLORS } from "@/constants/colors.constants";
import { APP_INPUT_HEIGHT, FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_INPUTS } from "@/constants/layout.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { SPACING } from "@/constants/spacing.constants";
import { parseSpokenLanguages } from "@/lib/parseSpokenLanguages";
import {
  formatTeacherLocationLabel,
  getTeacherLocationCountryName,
  resolveTeacherLocationFields,
} from "@/lib/teacherProfileLocation";
import { useActionPending } from "@/hooks/useActionPending";
import { TeacherProfileLanguagePills } from "./TeacherProfileLanguagePills";
import {
  TeacherProfileHeroInlineIconSlot,
  TeacherProfileHeroInlineRow,
  TeacherProfileHeroMetaLabel,
  TeacherProfileLanguagesLocationFields,
} from "./TeacherProfileLanguagesLocationFields";
import {
  initialCityOption,
  initialCountryOption,
  parseLanguageTags,
} from "./teacherProfileLanguagesLocationUtils";

const Headline = styled.p`
  margin: 0;
  max-width: 36rem;
  font-size: ${FONTS.SIZE.MD};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.GRAY_TEXT_SECONDARY};
`;

const MetaRow = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.GRAY_TEXT_SECONDARY};
`;

const LanguagesMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
  width: 100%;
  min-width: 0;
`;

const MetaLabel = styled.span`
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.GRAY_TEXT_SECONDARY};
  flex-shrink: 0;
`;

const HeadlineInputWrap = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
`;

const HeadlineInput = styled.input<{ $hasError?: boolean }>`
  height: ${APP_INPUT_HEIGHT};
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0 ${FORM_FIELD.CONTROL_PADDING_INLINE};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.TEXT};
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${(p) => formFieldControlBorder(Boolean(p.$hasError))};
  box-shadow: ${BOX_SHADOW_INPUTS};
  outline: none;
  overflow-x: auto;
  white-space: nowrap;
  text-overflow: clip;

  &::placeholder {
    color: ${FORM_FIELD.PLACEHOLDER_COLOR};
    font-weight: ${FONTS.WEIGHT.NORMAL};
  }

  &:hover:not(:disabled) {
    border-color: ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.PRIMARY)};
  }

  &:focus {
    border-color: ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.SIDEBAR_BRAND)};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const HeadlineField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  width: 100%;
  min-width: 0;
`;

const Actions = styled.div<{ $alignStart?: boolean; }>`
  display: flex;
  flex-wrap: wrap;
  justify-content: ${({ $alignStart }) => ($alignStart ? "flex-start" : "flex-end")};
  gap: ${SPACING.TWO};
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const HEADLINE_FALLBACK = "Tutor on Mentora";

export interface TeacherProfileHeroSummaryEditProps {
  headline: string;
  spokenLanguages: string;
  locationCountryCode: string;
  locationCity: string;
  locationLabel: string;
}

export function TeacherProfileHeroSummaryEdit({
  headline,
  spokenLanguages,
  locationCountryCode,
  locationCity,
  locationLabel,
}: TeacherProfileHeroSummaryEditProps) {
  const router = useRouter();
  const [isSaving, startTransition] = useActionPending();
  const [editing, setEditing] = React.useState(false);
  const [result, setResult] = React.useState<ActionResult | null>(null);

  const initialLocation = React.useMemo(
    () =>
      resolveTeacherLocationFields({
        locationCountryCode,
        locationCity,
        locationLabel,
      }),
    [locationCountryCode, locationCity, locationLabel],
  );

  const [headlineLocal, setHeadlineLocal] = React.useState(headline);
  const [tags, setTags] = React.useState<string[]>(() => parseLanguageTags(spokenLanguages));
  const [tagDraft, setTagDraft] = React.useState("");
  const [country, setCountry] = React.useState<SearchComboboxOption | null>(() =>
    initialCountryOption(initialLocation.countryCode),
  );
  const [city, setCity] = React.useState<SearchComboboxOption | null>(() =>
    initialCityOption(initialLocation.city),
  );

  function resetLocalFromProps() {
    const resolved = resolveTeacherLocationFields({
      locationCountryCode,
      locationCity,
      locationLabel,
    });
    setHeadlineLocal(headline);
    setTags(parseLanguageTags(spokenLanguages));
    setTagDraft("");
    setCountry(initialCountryOption(resolved.countryCode));
    setCity(initialCityOption(resolved.city));
    setResult(null);
  }

  React.useEffect(() => {
    resetLocalFromProps();
  }, [headline, spokenLanguages, locationCountryCode, locationCity, locationLabel]);

  function onCountryChange(option: SearchComboboxOption | null) {
    setCountry(option);
    setCity(null);
  }

  function onSave() {
    const fd = new FormData();
    fd.set("headline", headlineLocal);
    fd.set("spokenLanguages", tags.join(", "));
    fd.set("locationCountryCode", country?.value ?? "");
    fd.set("locationCity", city?.value ?? "");
    startTransition(async () => {
      const res = await saveTeacherHeroSummaryAction(fd);
      setResult(res);
      if (res.ok) {
        router.refresh();
        setEditing(false);
      }
    });
  }

  function onCancelEdit() {
    resetLocalFromProps();
    setEditing(false);
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;
  const languages = parseSpokenLanguages(spokenLanguages);
  const locationDisplay = formatTeacherLocationLabel(
    initialLocation.city,
    getTeacherLocationCountryName(initialLocation.countryCode),
  );

  if (!editing) {
    return (
      <>
        <Headline>{headline.trim() || HEADLINE_FALLBACK}</Headline>

        {languages.length > 0 ? (
          <LanguagesMeta>
            <MessageCircle
              size={ICON_SIZE.SM}
              strokeWidth={ICON_STROKE.NORMAL}
              color={COLORS.GRAY_TEXT_TERTIARY}
              aria-hidden
            />
            <MetaLabel>Speaks:</MetaLabel>
            <TeacherProfileLanguagePills languages={languages} />
          </LanguagesMeta>
        ) : null}

        {locationDisplay ? (
          <MetaRow>
            <MapPin
              size={ICON_SIZE.SM}
              strokeWidth={ICON_STROKE.NORMAL}
              color={COLORS.GRAY_TEXT_TERTIARY}
              aria-hidden
            />
            <span>Based in: {locationDisplay}</span>
          </MetaRow>
        ) : null}

        <Actions $alignStart>
          <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </Actions>
      </>
    );
  }

  return (
    <>
      <HeadlineField>
        <TeacherProfileHeroInlineRow>
          <TeacherProfileHeroInlineIconSlot aria-hidden>
            <Type
              size={ICON_SIZE.SM}
              strokeWidth={ICON_STROKE.NORMAL}
              color={COLORS.GRAY_TEXT_TERTIARY}
            />
          </TeacherProfileHeroInlineIconSlot>
          <TeacherProfileHeroMetaLabel>Headline:</TeacherProfileHeroMetaLabel>
          <HeadlineInputWrap>
            <HeadlineInput
              id="teacher-profile-hero-headline"
              name="headline"
              aria-label="Headline"
              value={headlineLocal}
              maxLength={120}
              $hasError={Boolean(errs?.headline)}
              onChange={(e) => setHeadlineLocal(e.target.value)}
              placeholder="e.g. Creative educator crafting engaging learning experiences"
            />
          </HeadlineInputWrap>
        </TeacherProfileHeroInlineRow>
        {errs?.headline ? <ErrorText>{errs.headline}</ErrorText> : null}
      </HeadlineField>

      <TeacherProfileLanguagesLocationFields
        idPrefix="teacher-profile-hero"
        heroInline
        languageTags={tags}
        languageTagDraft={tagDraft}
        onLanguageTagsChange={setTags}
        onLanguageTagDraftChange={setTagDraft}
        country={country}
        city={city}
        onCountryChange={onCountryChange}
        onCityChange={setCity}
        fieldErrors={errs}
      />

      {result && !result.ok && !result.fieldErrors ? <ErrorText>{result.error}</ErrorText> : null}

      <Actions $alignStart>
        <Button type="button" variant="secondary" disabled={isSaving} onClick={onCancelEdit}>
          Cancel
        </Button>
        <Button type="button" variant="primary" isLoading={isSaving} onClick={onSave}>
          Save
        </Button>
      </Actions>
    </>
  );
}
