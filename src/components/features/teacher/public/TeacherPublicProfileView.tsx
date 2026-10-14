"use client";

import * as React from "react";
import styled from "styled-components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TeacherPublicProfileAboutPanel } from "./TeacherPublicProfileAboutPanel";
import { TeacherPublicProfileExperiencePanel } from "./TeacherPublicProfileExperiencePanel";
import type { TeacherPublicProfileWorkExperience } from "@/types/teacherPublicProfileWorkExperience";
import { TeacherPublicProfileHeader } from "./TeacherPublicProfileHeader";
import {
  PublicProfileBleed,
  PublicProfileBodyRegion,
  PublicProfileChrome,
  PublicProfileColumn,
  PublicProfileHeroBand,
  PublicProfileTabRegion,
} from "./TeacherPublicProfileFrame";

const PanelSection = styled.section`
  padding-top: ${SPACING.EIGHT};
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.UI_LARGE};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${COLORS.HEADER};
`;

const Muted = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
`;

const ExperienceSubject = styled.h3`
  margin: 0;
  font-size: ${FONTS.SIZE.MD};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const ExperienceBody = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MUTED_FOREGROUND};
  white-space: pre-wrap;
`;

const EducationList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const EducationItem = styled.li`
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
`;

const TestimonialGrid = styled.ul`
  display: grid;
  gap: ${SPACING.THREE};
  list-style: none;
  margin: 0;
  padding: 0;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const TestimonialCard = styled.li`
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.FOUR};
`;

const TestimonialHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.TWO};
`;

const TestimonialName = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Stars = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.RATING_STAR};
`;

const StarsMuted = styled.span`
  color: ${COLORS.MUTED_FOREGROUND};
`;

const TestimonialBody = styled.p`
  margin: ${SPACING.TWO} 0 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const TestimonialFoot = styled.p`
  margin: ${SPACING.TWO} 0 0;
  font-size: ${FONTS.SIZE.META};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface TeacherPublicProfileTestimonial {
  id: string;
  studentName: string;
  rating: number;
  body: string;
  offeringTitle: string;
}

export interface TeacherPublicProfileSubject {
  id: string;
  name: string;
  courseDescription: string;
  gradeLevel: string;
}

export interface TeacherPublicProfileViewProps {
  name: string;
  imageUrl: string | null;
  initials: string;
  headline: string;
  bio: string;
  email: string;
  spokenLanguages: string;
  locationCountryCode: string;
  displayId: string;
  rating: number;
  ratingsCount: number;
  subjects: TeacherPublicProfileSubject[];
  skills: string[];
  reviewsCount: number;
  testimonials?: TeacherPublicProfileTestimonial[];
  workExperiences: TeacherPublicProfileWorkExperience[];
  defaultTab?: string;
  /** Nested under `/profile` → Profile View (tighter hero spacing). */
  profilePreview?: boolean;
  /** Edit location & languages (Profile View only). */
  locationPanel?: React.ReactNode;
  photoEditor?: React.ReactNode;
  bioEditor?: React.ReactNode;
  heroBandRef?: React.Ref<HTMLDivElement>;
}

export function TeacherPublicProfileView({
  name,
  imageUrl,
  initials,
  headline,
  bio,
  email,
  spokenLanguages,
  locationCountryCode,
  displayId,
  rating,
  ratingsCount,
  subjects,
  skills,
  reviewsCount,
  testimonials = [],
  workExperiences,
  defaultTab = "about",
  profilePreview = false,
  locationPanel,
  photoEditor,
  bioEditor,
  heroBandRef,
}: TeacherPublicProfileViewProps) {
  const [tab, setTab] = React.useState(defaultTab);
  const showLocationTab = Boolean(locationPanel);

  React.useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);
  const primarySubjectName = subjects[0]?.name ?? "";

  return (
    <PublicProfileBleed $profilePreview={profilePreview}>
      <Tabs value={tab} onValueChange={setTab} variant="underline" listAlignment="start">
        <PublicProfileChrome>
          <PublicProfileHeroBand ref={heroBandRef} $profilePreview={profilePreview}>
            <PublicProfileColumn>
              <TeacherPublicProfileHeader
                name={name}
                imageUrl={imageUrl}
                initials={initials}
                photoEditor={photoEditor}
                headline={headline}
                spokenLanguages={spokenLanguages}
                locationCountryCode={locationCountryCode}
                displayId={displayId}
                rating={rating}
                ratingsCount={ratingsCount}
                primarySubjectName={primarySubjectName}
              />
            </PublicProfileColumn>
          </PublicProfileHeroBand>

          <PublicProfileTabRegion>
            <PublicProfileColumn>
              <TabsList aria-label="Teacher profile sections">
                <TabsTrigger value="about">About</TabsTrigger>
                {showLocationTab ? (
                  <TabsTrigger value="location">Location & languages</TabsTrigger>
                ) : null}
                <TabsTrigger value="reviews">Reviews ({reviewsCount})</TabsTrigger>
                <TabsTrigger value="subjects">Subjects taught</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
              </TabsList>
            </PublicProfileColumn>
          </PublicProfileTabRegion>
        </PublicProfileChrome>

        <PublicProfileBodyRegion>
          <PublicProfileColumn>
            <TabsContent value="about">
              <TeacherPublicProfileAboutPanel
                bio={bio}
                email={email}
                skills={skills}
                bioEditor={bioEditor}
              />
            </TabsContent>

            {showLocationTab ? (
              <TabsContent value="location">
                <PanelSection>{locationPanel}</PanelSection>
              </TabsContent>
            ) : null}

            <TabsContent value="reviews">
              <PanelSection>
                <SectionTitle>Reviews</SectionTitle>
                {testimonials.length === 0 ? (
                  <Muted>No reviews yet.</Muted>
                ) : (
                  <TestimonialGrid>
                    {testimonials.map((t) => (
                      <TestimonialCard key={t.id}>
                        <TestimonialHead>
                          <TestimonialName>{t.studentName}</TestimonialName>
                          <Stars aria-label={`${t.rating} out of 5`}>
                            {"★".repeat(t.rating)}
                            <StarsMuted>{"★".repeat(5 - t.rating)}</StarsMuted>
                          </Stars>
                        </TestimonialHead>
                        <TestimonialBody>{t.body}</TestimonialBody>
                        <TestimonialFoot>{t.offeringTitle}</TestimonialFoot>
                      </TestimonialCard>
                    ))}
                  </TestimonialGrid>
                )}
              </PanelSection>
            </TabsContent>

            <TabsContent value="subjects">
              <PanelSection>
                <SectionTitle>Subjects taught</SectionTitle>
                {subjects.length === 0 ? (
                  <Muted>No subjects listed yet.</Muted>
                ) : (
                  <EducationList>
                    {subjects.map((subject) => (
                      <EducationItem key={subject.id}>
                        <ExperienceSubject>{subject.name}</ExperienceSubject>
                        <ExperienceBody>
                          {subject.gradeLevel.trim()
                            ? `Levels taught: ${subject.gradeLevel}`
                            : subject.courseDescription.trim() ||
                              `Structured ${subject.name} lessons on Mentora.`}
                        </ExperienceBody>
                      </EducationItem>
                    ))}
                  </EducationList>
                )}
              </PanelSection>
            </TabsContent>

            <TabsContent value="experience">
              <PanelSection>
                <TeacherPublicProfileExperiencePanel experiences={workExperiences} />
              </PanelSection>
            </TabsContent>
          </PublicProfileColumn>
        </PublicProfileBodyRegion>
      </Tabs>
    </PublicProfileBleed>
  );
}
