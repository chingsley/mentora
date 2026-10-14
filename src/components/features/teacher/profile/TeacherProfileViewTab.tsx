"use client";

import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { TeacherPublicProfileView } from "@/components/features/teacher/public/TeacherPublicProfileView";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherPublicProfileWorkExperience } from "@/types/teacherPublicProfileWorkExperience";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";
import { TeacherProfileLocationTab } from "./TeacherProfileLocationTab";
import { TeacherProfileBioEditPanel } from "./TeacherProfileBioEditPanel";
import { TeacherProfilePhotoHeroEdit } from "./TeacherProfilePhotoHeroEdit";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const SetupActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
  margin-bottom: ${SPACING.FOUR};
`;

export type TeacherProfileViewTabProps = Pick<
  TeacherProfileTabsProps,
  | "fullName"
  | "initials"
  | "imageUrl"
  | "headline"
  | "bio"
  | "rating"
  | "ratingsCount"
  | "spokenLanguages"
  | "locationCountryCode"
  | "locationCity"
  | "locationLabel"
  | "taughtSubjects"
  | "initialSubjects"
  | "checklist"
  | "email"
  | "displayId"
> & {
  workExperiences: TeacherPublicProfileWorkExperience[];
  profileSection?: string | null;
  onNavigateTab: (tab: string, profileSection?: string) => void;
};

export function TeacherProfileViewTab({
  fullName,
  initials,
  imageUrl,
  headline,
  bio,
  rating,
  ratingsCount,
  spokenLanguages,
  locationCountryCode,
  locationCity,
  locationLabel,
  taughtSubjects,
  initialSubjects,
  checklist,
  email,
  displayId,
  workExperiences,
  profileSection,
  onNavigateTab,
}: TeacherProfileViewTabProps) {
  const heroBandRef = React.useRef<HTMLDivElement>(null);
  const firstIncomplete = checklist.find((c) => !c.done && c.editTab);

  const subjects = taughtSubjects.map((taught) => {
    const detail = initialSubjects.find((s) => s.subjectId === taught.id);
    return {
      id: taught.id,
      name: taught.name,
      courseDescription: detail?.courseDescription ?? "",
      gradeLevel: detail?.gradeLevel ?? "",
    };
  });

  const skills = taughtSubjects.map((s) => s.name);

  const defaultPublicTab =
    profileSection === "location"
      ? "location"
      : profileSection === "about"
        ? "about"
        : "about";

  React.useEffect(() => {
    if (profileSection === "photo" && heroBandRef.current) {
      heroBandRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [profileSection]);

  const locationPanel = (
    <TeacherProfileLocationTab
      key={`${spokenLanguages}|${locationCountryCode}|${locationCity}`}
      spokenLanguages={spokenLanguages}
      locationCountryCode={locationCountryCode}
      locationCity={locationCity}
      locationLabel={locationLabel}
      embedded
    />
  );

  const photoEditor = (
    <TeacherProfilePhotoHeroEdit
      key={imageUrl ?? "no-photo"}
      imageUrl={imageUrl}
      initials={initials}
    />
  );

  const bioEditor = <TeacherProfileBioEditPanel key={bio} bio={bio} />;

  return (
    <Wrap>
      {firstIncomplete ? (
        <SetupActions>
          <Button
            type="button"
            onClick={() =>
              onNavigateTab(firstIncomplete.editTab!, firstIncomplete.profileSection)
            }
          >
            Continue setup: {firstIncomplete.label}
          </Button>
        </SetupActions>
      ) : null}

      <TeacherPublicProfileView
        name={fullName}
        imageUrl={imageUrl}
        initials={initials}
        headline={headline}
        bio={bio}
        email={email}
        spokenLanguages={spokenLanguages}
        locationCountryCode={locationCountryCode}
        displayId={displayId}
        rating={rating}
        ratingsCount={ratingsCount}
        subjects={subjects}
        skills={skills}
        reviewsCount={ratingsCount}
        profilePreview
        defaultTab={defaultPublicTab}
        locationPanel={locationPanel}
        photoEditor={photoEditor}
        bioEditor={bioEditor}
        heroBandRef={heroBandRef}
        workExperiences={workExperiences}
      />
    </Wrap>
  );
}
