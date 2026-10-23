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
import { FormFieldLabel } from "@/components/ui/FormField";
import type { SearchComboboxOption } from "@/components/ui/SearchCombobox";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TeacherProfileForm } from "./TeacherProfileFormSurface";
import { TEACHER_LOCATION_FORM_ID } from "./teacherProfileFormIds";
import { useTeacherProfileSetupMode } from "./TeacherProfileSetupContext";
import { resolveTeacherLocationFields } from "@/lib/teacherProfileLocation";
import { TeacherProfileLanguagePills } from "./TeacherProfileLanguagePills";
import { TeacherProfileLanguagesLocationFields } from "./TeacherProfileLanguagesLocationFields";
import {
  initialCityOption,
  initialCountryOption,
  parseLanguageTags,
} from "./teacherProfileLanguagesLocationUtils";

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const EmbeddedSaveFooter = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${SPACING.TWO};
  width: 100%;
  margin-top: ${({ $compact }) => ($compact ? SPACING.TWO : SPACING.SIX)};
`;

const ViewCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
`;

const ViewFieldGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
  width: 100%;
  min-width: 0;

  ${LAYOUT.MEDIA.SM} {
    gap: ${SPACING.SIX};
  }
`;

const ViewLocationRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${SPACING.FIVE};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${SPACING.SIX};
  }
`;

const ViewField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  min-width: 0;
`;

const ViewValue = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.TEXT};
`;

const ViewValueMuted = styled(ViewValue)`
  color: ${COLORS.GRAY_TEXT_SECONDARY};
`;

const ViewFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const VIEW_EMPTY = "Not set";
const VIEW_NO_LANGUAGES = "No languages listed yet.";

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
  /** Profile About-style tabs: card in view mode, form when editing. */
  presentation?: "alwaysEdit" | "viewEdit";
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
  presentation = "alwaysEdit",
}: TeacherProfileLocationTabProps) {
  const router = useRouter();
  const setupMode = useTeacherProfileSetupMode();
  const [isSaving, startTransition] = useActionPending();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [editing, setEditing] = React.useState(presentation === "alwaysEdit");

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

  function resetLocalFromProps() {
    const resolved = resolveTeacherLocationFields({
      locationCountryCode,
      locationCity,
      locationLabel,
    });
    setTags(parseLanguageTags(spokenLanguages));
    setTagDraft("");
    setCountry(initialCountryOption(resolved.countryCode));
    setCity(initialCityOption(resolved.city));
    setResult(null);
  }

  React.useEffect(() => {
    resetLocalFromProps();
  }, [spokenLanguages, locationCountryCode, locationCity, locationLabel]);

  React.useEffect(() => {
    if (presentation === "alwaysEdit") {
      setEditing(true);
    }
  }, [presentation]);

  function onCountryChange(option: SearchComboboxOption | null) {
    setCountry(option);
    setCity(null);
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
        if (presentation === "viewEdit") {
          setEditing(false);
        }
        onAdvance?.();
      }
    });
  }

  function onCancelEdit() {
    resetLocalFromProps();
    setEditing(false);
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  const viewCountryLabel =
    initialCountryOption(initialLocation.countryCode)?.label ?? VIEW_EMPTY;
  const viewCityLabel = initialLocation.city.trim() || VIEW_EMPTY;
  const viewLanguageTags = parseLanguageTags(spokenLanguages);

  if (presentation === "viewEdit" && !editing) {
    return (
      <ViewCard>
        <ViewFieldGrid>
          <ViewLocationRow>
            <ViewField>
              <FormFieldLabel as="span">Country</FormFieldLabel>
              <ViewValue>{viewCountryLabel}</ViewValue>
            </ViewField>
            <ViewField>
              <FormFieldLabel as="span">City</FormFieldLabel>
              <ViewValue>{viewCityLabel}</ViewValue>
            </ViewField>
          </ViewLocationRow>
          <ViewField>
            <FormFieldLabel as="span">Languages spoken</FormFieldLabel>
            {viewLanguageTags.length > 0 ? (
              <TeacherProfileLanguagePills languages={viewLanguageTags} />
            ) : (
              <ViewValueMuted>{VIEW_NO_LANGUAGES}</ViewValueMuted>
            )}
          </ViewField>
        </ViewFieldGrid>
        <ViewFooter>
          <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </ViewFooter>
      </ViewCard>
    );
  }

  const compactEmbeddedFields = embedded;

  const fields = (
    <TeacherProfileLanguagesLocationFields
      idPrefix="teacher-profile"
      compact={compactEmbeddedFields}
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
  );

  return (
    <TeacherProfileForm
      id={TEACHER_LOCATION_FORM_ID}
      onSubmit={onSubmit}
      contentInset={embedded ? "compactTop" : "default"}
    >
      {embedded ? (
        fields
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
        <EmbeddedSaveFooter $compact={compactEmbeddedFields}>
          {presentation === "viewEdit" ? (
            <>
              <Button type="button" variant="secondary" disabled={isSaving} onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Save
              </Button>
            </>
          ) : (
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save
            </Button>
          )}
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
