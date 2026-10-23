"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useActionPending } from "@/hooks/useActionPending";
import styled from "styled-components";
import { saveTeacherLocationTabAction, type ActionResult } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import { TeacherProfileTabFooter } from "./TeacherProfileTabFooter";
import {
  TeacherProfileFormSection,
  TeacherProfileFormSectionStack,
} from "./TeacherProfileFormSection";
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
import { COUNTRIES, getCountryByCode } from "@/constants/countries.constants";
import { COLORS } from "@/constants/colors.constants";
import { APP_INPUT_HEIGHT, FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_INPUTS, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TeacherProfileForm } from "./TeacherProfileFormSurface";
import { TEACHER_LOCATION_FORM_ID } from "./teacherProfileFormIds";
import { useTeacherProfileSetupMode } from "./TeacherProfileSetupContext";
import { getCitiesForCountry } from "@/lib/locationCities";
import { resolveTeacherLocationFields } from "@/lib/teacherProfileLocation";

const EmbeddedSectionTitle = styled.h2`
  margin: 0 0 ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.UI_LARGE};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${COLORS.HEADER};
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
  background-color: ${COLORS.FOREGROUND};

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

const DetailsFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
  width: 100%;
  min-width: 0;

  ${LAYOUT.MEDIA.SM} {
    gap: ${SPACING.SIX};
  }
`;

const LocationRow = styled(InlineFormFieldRow)`
  grid-template-columns: minmax(0, 1fr);

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const EmbeddedSaveFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: ${SPACING.SIX};
`;

const COUNTRY_OPTIONS: SearchComboboxOption[] = COUNTRIES.map((country) => ({
  value: country.code,
  label: country.name,
}));

function cityOptionsForCountry(countryCode: string): SearchComboboxOption[] {
  return getCitiesForCountry(countryCode).map((city) => ({
    value: city,
    label: city,
  }));
}

function initialCountryOption(countryCode: string): SearchComboboxOption | null {
  if (!countryCode) return null;
  const country = getCountryByCode(countryCode);
  return country ? { value: country.code, label: country.name } : null;
}

function initialCityOption(city: string): SearchComboboxOption | null {
  const trimmed = city.trim();
  return trimmed ? { value: trimmed, label: trimmed } : null;
}

function parseLanguageTags(raw: string): string[] {
  return raw
    .split(/[,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export interface TeacherProfileLocationTabProps {
  spokenLanguages: string;
  locationCountryCode: string;
  locationCity: string;
  locationLabel: string;
  onAdvance?: () => void;
  onBack?: () => void;
  backDisabled?: boolean;
  /** Rendered inside Profile View public tabs (no back / advance navigation). */
  embedded?: boolean;
}

export function TeacherProfileLocationTab({
  spokenLanguages,
  locationCountryCode,
  locationCity,
  locationLabel,
  onAdvance,
  onBack,
  backDisabled = false,
  embedded = false,
}: TeacherProfileLocationTabProps) {
  const router = useRouter();
  const setupMode = useTeacherProfileSetupMode();
  const [isSaving, startTransition] = useActionPending();
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

  const [tags, setTags] = React.useState<string[]>(() => parseLanguageTags(spokenLanguages));
  const [tagDraft, setTagDraft] = React.useState("");
  const [country, setCountry] = React.useState<SearchComboboxOption | null>(() =>
    initialCountryOption(initialLocation.countryCode),
  );
  const [city, setCity] = React.useState<SearchComboboxOption | null>(() =>
    initialCityOption(initialLocation.city),
  );

  const cityOptions = React.useMemo(
    () => cityOptionsForCountry(country?.value ?? ""),
    [country?.value],
  );

  function onCountryChange(option: SearchComboboxOption | null) {
    setCountry(option);
    setCity(null);
  }

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
    fd.set("spokenLanguages", tags.join(", "));
    fd.set("locationCountryCode", country?.value ?? "");
    fd.set("locationCity", city?.value ?? "");
    startTransition(async () => {
      const res = await saveTeacherLocationTabAction(fd);
      setResult(res);
      if (res.ok) {
        router.refresh();
        onAdvance?.();
      }
    });
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  const fields = (
    <DetailsFields>
            <LocationRow>
              <SearchCombobox
                id="teacher-profile-country"
                label="Country"
                value={country}
                onChange={onCountryChange}
                options={COUNTRY_OPTIONS}
                placeholder="Search countries…"
                error={errs?.locationCountryCode}
              />
              <SearchCombobox
                id="teacher-profile-city"
                label="City"
                value={city}
                onChange={setCity}
                options={cityOptions}
                placeholder={country ? "Search cities…" : "Select a country first"}
                error={errs?.locationCity}
                disabled={!country}
                allowCustomValue
                emptyMessage={country ? "No matching cities" : "Select a country first"}
              />
            </LocationRow>
            <FormFieldRoot $hasLabel>
              <FormFieldLabelSlot>
                <FormFieldLabel htmlFor="teacher-profile-languages">Languages spoken</FormFieldLabel>
              </FormFieldLabelSlot>
              <FormFieldControlSlot>
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
                    id="teacher-profile-languages"
                    aria-label="Add a language"
                    placeholder="Type a language, press Enter"
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={onTagKeyDown}
                    onBlur={commitDraft}
                  />
                </TagWrap>
              </FormFieldControlSlot>
              <FormFieldMetaSlot>
                {errs?.spokenLanguages ? (
                  <FormFieldError>{errs.spokenLanguages}</FormFieldError>
                ) : null}
              </FormFieldMetaSlot>
            </FormFieldRoot>
    </DetailsFields>
  );

  return (
    <TeacherProfileForm id={TEACHER_LOCATION_FORM_ID} onSubmit={onSubmit}>
      {embedded ? (
        <>
          <EmbeddedSectionTitle>Location & languages</EmbeddedSectionTitle>
          {fields}
        </>
      ) : (
        <TeacherProfileFormSectionStack $setup={setupMode}>
          <TeacherProfileFormSection
            id="teacher-location-section"
            stepLabel={setupMode ? "1 of 1" : undefined}
            title="Location and languages"
            hint="Country, city, and languages appear on your public profile."
          >
            {fields}
          </TeacherProfileFormSection>
        </TeacherProfileFormSectionStack>
      )}

      {result && !result.ok && !result.fieldErrors ? <ErrorText>{result.error}</ErrorText> : null}

      {embedded ? (
        <EmbeddedSaveFooter>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Save
          </Button>
        </EmbeddedSaveFooter>
      ) : (
        <TeacherProfileTabFooter
          onBack={onBack!}
          continueAsSubmit
          isLoading={isSaving}
          backDisabled={backDisabled}
        />
      )}
    </TeacherProfileForm>
  );
}
