"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { TriangleAlert } from "lucide-react";
import styled from "styled-components";
import { saveTeacherBioTabAction, type ActionResult } from "@/app/(app)/profile/actions";
import { ProfilePhotoForm, type ProfilePhotoFormHandle } from "@/components/features/teacher/ProfilePhotoForm";
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
import { TEACHER_BIO_FORM_ID } from "./teacherProfileFormIds";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import {
  TEACHER_BIO_MAX_LENGTH,
  TEACHER_BIO_TEXTAREA_MIN_HEIGHT,
} from "@/constants/teacherProfile.constants";
import { useTeacherProfileSetupMode } from "./TeacherProfileSetupContext";
import { getCitiesForCountry } from "@/lib/locationCities";
import { resolveTeacherLocationFields } from "@/lib/teacherProfileLocation";

const BIO_HINT_COLOR = COLORS.SIDEBAR_BRAND;

const PhotoGuidanceCallout = styled.div`
  display: flex;
  gap: ${SPACING.THREE};
  align-items: flex-start;
  width: 100%;
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.SURFACE_OFF_WHITE};
  text-align: left;
  align-self: stretch;
`;

const WarningIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  line-height: 0;
  color: ${COLORS.DESTRUCTIVE};
`;

const PhotoGuidanceCopy = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const PhotoGuidanceLead = styled.strong`
  display: block;
  margin-bottom: ${SPACING.ONE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

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
    font-weight: ${FONTS.WEIGHT.NORMAL};
  }

  &:focus {
    border-color: ${COLORS.SIDEBAR_BRAND};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const BioFieldFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CharCounter = styled.span`
  flex-shrink: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${BIO_HINT_COLOR};
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

const BIO_MAX = TEACHER_BIO_MAX_LENGTH;

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

export interface TeacherProfileBioTabProps {
  initials: string;
  imageUrl: string | null;
  bio: string;
  spokenLanguages: string;
  locationCountryCode: string;
  locationCity: string;
  locationLabel: string;
  onAdvance: () => void;
  onBack: () => void;
  backDisabled?: boolean;
}

export function TeacherProfileBioTab({
  initials,
  imageUrl,
  bio,
  spokenLanguages,
  locationCountryCode,
  locationCity,
  locationLabel,
  onAdvance,
  onBack,
  backDisabled = false,
}: TeacherProfileBioTabProps) {
  const router = useRouter();
  const setupMode = useTeacherProfileSetupMode();
  const photoRef = React.useRef<ProfilePhotoFormHandle>(null);
  const [isSaving, startTransition] = React.useTransition();
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

  const [bioLocal, setBioLocal] = React.useState(bio);
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
    fd.set("bio", bioLocal);
    fd.set("spokenLanguages", tags.join(", "));
    fd.set("locationCountryCode", country?.value ?? "");
    fd.set("locationCity", city?.value ?? "");
    startTransition(async () => {
      if (photoRef.current?.hasPendingUpload()) {
        const uploadRes = await photoRef.current.uploadIfPending();
        if (!uploadRes.ok) {
          setResult({ ok: false, error: uploadRes.error });
          return;
        }
      }

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
    <TeacherProfileForm id={TEACHER_BIO_FORM_ID} onSubmit={onSubmit}>
      <TeacherProfileFormSectionStack $setup={setupMode}>
        <TeacherProfileFormSection
          id="teacher-bio-photo-section"
          stepLabel="1 of 3"
          title="Profile photo"
          hint="Add a clear, recent headshot students will see on your profile."
          contentAlign="center"
        >
          <ProfilePhotoForm
            ref={photoRef}
            layout="studio"
            currentImage={imageUrl}
            fallbackInitials={initials}
            hint=""
          />
          <PhotoGuidanceCallout role="note">
            <WarningIcon aria-hidden>
              <TriangleAlert size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
            </WarningIcon>
            <PhotoGuidanceCopy>
              <PhotoGuidanceLead>Photo tip</PhotoGuidanceLead>
              Students use your photo to recognize you before class. Use a recent picture that matches
              how you look when you teach.
            </PhotoGuidanceCopy>
          </PhotoGuidanceCallout>
        </TeacherProfileFormSection>

        <TeacherProfileFormSection
          id="teacher-bio-about-section"
          stepLabel="2 of 3"
          title="About you"
          hint="A short note on your experience, teaching style, and what students can expect."
        >
          <Field htmlFor="teacher-profile-bio">
            <Textarea
              id="teacher-profile-bio"
              name="bio"
              rows={4}
              value={bioLocal}
              maxLength={BIO_MAX}
              onChange={(e) => setBioLocal(e.target.value)}
              placeholder="e.g. 8 years teaching maths; patient, exam-focused sessions."
            />
            <BioFieldFooter>
              <CharCounter aria-live="polite">
                {bioLocal.length} / {BIO_MAX}
              </CharCounter>
            </BioFieldFooter>
            {errs?.bio ? <ErrorText>{errs.bio}</ErrorText> : null}
          </Field>
        </TeacherProfileFormSection>

        <TeacherProfileFormSection
          id="teacher-bio-details-section"
          stepLabel="3 of 3"
          title="Location and languages"
          hint="Country, city, and languages appear on your public profile."
        >
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
        </TeacherProfileFormSection>
      </TeacherProfileFormSectionStack>

      {result && !result.ok && !result.fieldErrors ? <ErrorText>{result.error}</ErrorText> : null}

      <TeacherProfileTabFooter
        onBack={onBack}
        continueAsSubmit
        isLoading={isSaving}
        backDisabled={backDisabled}
      />
    </TeacherProfileForm>
  );
}
