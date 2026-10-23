"use client";

import { MapPin, MessageCircle } from "lucide-react";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import {
  FormFieldControlSlot,
  FormFieldError,
  FormFieldLabel,
  FormFieldLabelSlot,
  FormFieldMetaSlot,
  FormFieldRoot,
  InlineFormFieldRow,
} from "@/components/ui/FormField";
import { SearchCombobox, type SearchComboboxOption } from "@/components/ui/SearchCombobox";
import { COUNTRIES } from "@/constants/countries.constants";
import { APP_INPUT_HEIGHT, FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_INPUTS, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TEACHER_PUBLIC_PROFILE } from "@/constants/teacherPublicProfile.constants";
import { cityOptionsForCountry } from "./teacherProfileLanguagesLocationUtils";

const COUNTRY_OPTIONS: SearchComboboxOption[] = COUNTRIES.map((country) => ({
  value: country.code,
  label: country.name,
}));

const TagWrap = styled.div<{ $heroInline?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
  align-items: center;
  min-height: ${APP_INPUT_HEIGHT};
  flex: 1;
  min-width: 0;
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${formFieldControlBorder(false)};
  box-shadow: ${BOX_SHADOW_INPUTS};
  padding: ${({ $heroInline }) =>
    $heroInline
      ? `0 ${FORM_FIELD.CONTROL_PADDING_INLINE}`
      : `${SPACING.TWO} ${FORM_FIELD.CONTROL_PADDING_INLINE}`};
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};

  &:focus-within {
    border-color: ${COLORS.SIDEBAR_BRAND};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.ACTION_PRIMARY_TINT_16};
  padding: ${SPACING.ONE} ${SPACING.TWO};
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
  padding: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.TEXT};
  outline: none;

  &::placeholder {
    color: ${FORM_FIELD.PLACEHOLDER_COLOR};
    font-weight: ${FONTS.WEIGHT.NORMAL};
  }
`;

export const TeacherProfileLanguagesLocationFieldsStack = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? SPACING.TWO : SPACING.FIVE)};
  width: 100%;
  min-width: 0;

  ${LAYOUT.MEDIA.SM} {
    gap: ${({ $compact }) => ($compact ? SPACING.TWO : SPACING.SIX)};
  }
`;

const LocationRow = styled(InlineFormFieldRow)`
  grid-template-columns: minmax(0, 1fr);

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const TeacherProfileHeroInlineRow = styled.div`
  display: grid;
  grid-template-columns:
    ${TEACHER_PUBLIC_PROFILE.HERO_INLINE_ICON_COLUMN}
    ${TEACHER_PUBLIC_PROFILE.HERO_INLINE_LABEL_WIDTH}
    minmax(0, 1fr);
  align-items: center;
  column-gap: ${SPACING.TWO};
  width: 100%;
  min-width: 0;
`;

export const TeacherProfileHeroInlineIconSlot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${TEACHER_PUBLIC_PROFILE.HERO_INLINE_ICON_COLUMN};
  flex-shrink: 0;
`;

const HeroInlineLocationFields = styled(LocationRow)`
  min-width: 0;
  width: 100%;
`;

export const TeacherProfileHeroMetaLabel = styled.span`
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.GRAY_TEXT_SECONDARY};
  white-space: nowrap;
`;

export interface TeacherProfileLanguagesLocationFieldsProps {
  idPrefix: string;
  compact?: boolean;
  /** Matches public hero view rows (Speaks / Based in); no field labels. */
  heroInline?: boolean;
  languageTags: string[];
  languageTagDraft: string;
  onLanguageTagsChange: (tags: string[]) => void;
  onLanguageTagDraftChange: (draft: string) => void;
  country: SearchComboboxOption | null;
  city: SearchComboboxOption | null;
  onCountryChange: (option: SearchComboboxOption | null) => void;
  onCityChange: (option: SearchComboboxOption | null) => void;
  fieldErrors?: {
    spokenLanguages?: string;
    locationCountryCode?: string;
    locationCity?: string;
  };
}

export function TeacherProfileLanguagesLocationFields({
  idPrefix,
  compact = false,
  heroInline = false,
  languageTags,
  languageTagDraft,
  onLanguageTagsChange,
  onLanguageTagDraftChange,
  country,
  city,
  onCountryChange,
  onCityChange,
  fieldErrors,
}: TeacherProfileLanguagesLocationFieldsProps) {
  const cityOptions = React.useMemo(
    () => cityOptionsForCountry(country?.value ?? ""),
    [country?.value],
  );

  function commitDraft() {
    const next = languageTagDraft.trim();
    if (!next) return;
    onLanguageTagsChange(
      languageTags.includes(next) ? languageTags : [...languageTags, next],
    );
    onLanguageTagDraftChange("");
  }

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    }
  }

  const languageTagsControl = (
    <TagWrap $heroInline={heroInline}>
      {languageTags.map((t) => (
        <Tag key={t}>
          {t}
          <TagRemove
            type="button"
            aria-label={`Remove ${t}`}
            onClick={() => onLanguageTagsChange(languageTags.filter((x) => x !== t))}
          >
            ×
          </TagRemove>
        </Tag>
      ))}
      <TagInput
        id={`${idPrefix}-languages`}
        aria-label="Add a language"
        placeholder={heroInline ? "Add language…" : "Type a language, press Enter"}
        value={languageTagDraft}
        onChange={(e) => onLanguageTagDraftChange(e.target.value)}
        onKeyDown={onTagKeyDown}
        onBlur={commitDraft}
      />
    </TagWrap>
  );

  if (heroInline) {
    return (
      <TeacherProfileLanguagesLocationFieldsStack $compact>
        <TeacherProfileHeroInlineRow>
          <TeacherProfileHeroInlineIconSlot aria-hidden>
            <MessageCircle
              size={ICON_SIZE.SM}
              strokeWidth={ICON_STROKE.NORMAL}
              color={COLORS.GRAY_TEXT_TERTIARY}
            />
          </TeacherProfileHeroInlineIconSlot>
          <TeacherProfileHeroMetaLabel>Speaks:</TeacherProfileHeroMetaLabel>
          {languageTagsControl}
        </TeacherProfileHeroInlineRow>
        {fieldErrors?.spokenLanguages ? (
          <FormFieldError>{fieldErrors.spokenLanguages}</FormFieldError>
        ) : null}
        <TeacherProfileHeroInlineRow>
          <TeacherProfileHeroInlineIconSlot aria-hidden>
            <MapPin
              size={ICON_SIZE.SM}
              strokeWidth={ICON_STROKE.NORMAL}
              color={COLORS.GRAY_TEXT_TERTIARY}
            />
          </TeacherProfileHeroInlineIconSlot>
          <TeacherProfileHeroMetaLabel>Based in:</TeacherProfileHeroMetaLabel>
          <HeroInlineLocationFields>
            <SearchCombobox
              id={`${idPrefix}-country`}
              label="Country"
              hideLabel
              value={country}
              onChange={onCountryChange}
              options={COUNTRY_OPTIONS}
              placeholder="Country"
              error={fieldErrors?.locationCountryCode}
            />
            <SearchCombobox
              id={`${idPrefix}-city`}
              label="City"
              hideLabel
              value={city}
              onChange={onCityChange}
              options={cityOptions}
              placeholder={country ? "City" : "Country first"}
              error={fieldErrors?.locationCity}
              disabled={!country}
              allowCustomValue
              emptyMessage={country ? "No matching cities" : "Select a country first"}
            />
          </HeroInlineLocationFields>
        </TeacherProfileHeroInlineRow>
      </TeacherProfileLanguagesLocationFieldsStack>
    );
  }

  return (
    <TeacherProfileLanguagesLocationFieldsStack $compact={compact}>
      <LocationRow>
        <SearchCombobox
          id={`${idPrefix}-country`}
          label="Country"
          value={country}
          onChange={onCountryChange}
          options={COUNTRY_OPTIONS}
          placeholder="Search countries…"
          error={fieldErrors?.locationCountryCode}
        />
        <SearchCombobox
          id={`${idPrefix}-city`}
          label="City"
          value={city}
          onChange={onCityChange}
          options={cityOptions}
          placeholder={country ? "Search cities…" : "Select a country first"}
          error={fieldErrors?.locationCity}
          disabled={!country}
          allowCustomValue
          emptyMessage={country ? "No matching cities" : "Select a country first"}
        />
      </LocationRow>
      <FormFieldRoot $hasLabel>
        <FormFieldLabelSlot>
          <FormFieldLabel htmlFor={`${idPrefix}-languages`}>Languages spoken</FormFieldLabel>
        </FormFieldLabelSlot>
        <FormFieldControlSlot>{languageTagsControl}</FormFieldControlSlot>
        <FormFieldMetaSlot>
          {fieldErrors?.spokenLanguages ? (
            <FormFieldError>{fieldErrors.spokenLanguages}</FormFieldError>
          ) : null}
        </FormFieldMetaSlot>
      </FormFieldRoot>
    </TeacherProfileLanguagesLocationFieldsStack>
  );
}
