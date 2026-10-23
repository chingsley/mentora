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
import { TeacherPublicProfileSubjectsPanel } from "./TeacherPublicProfileSubjectsPanel";
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

const SectionTitleOnly = styled(SectionTitle)`
  margin-bottom: ${SPACING.FOUR};
`;

const Muted = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
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
  tenureLabel: string;
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
  locationCity?: string;
  locationLabel?: string;
  displayId: string;
  rating: number;
  ratingsCount: number;
  subjects: TeacherPublicProfileSubject[];
  phone?: string | null;
  address?: string | null;
  reviewsCount: number;
  testimonials?: TeacherPublicProfileTestimonial[];
  workExperiences: TeacherPublicProfileWorkExperience[];
  defaultTab?: string;
  /** Nested under `/profile` → Profile View (tighter hero spacing). */
  profilePreview?: boolean;
  /** Class schedule editor (Profile View only). */
  schedulePanel?: React.ReactNode;
  photoEditor?: React.ReactNode;
  heroSummaryEditor?: React.ReactNode;
  bioEditor?: React.ReactNode;
  contactEditor?: React.ReactNode;
  heroBandRef?: React.Ref<HTMLDivElement>;
  /** Extend grey chrome through `<Main>` top padding (no outer profile tabs). */
  flushChromeToMainTop?: boolean;
  profilePreviewSetupAction?: React.ReactNode;
  onEditSubject?: (subjectId: string) => void;
  onDeleteSubject?: (subjectId: string) => void;
  onAddSubject?: () => void;
  onEditExperience?: (id: string) => void;
  onDeleteExperience?: (id: string) => void;
  onAddExperience?: () => void;
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
  locationCity = "",
  locationLabel = "",
  displayId,
  rating,
  ratingsCount,
  subjects,
  phone = null,
  address = null,
  reviewsCount,
  testimonials = [],
  workExperiences,
  defaultTab = "about",
  profilePreview = false,
  schedulePanel,
  photoEditor,
  heroSummaryEditor,
  bioEditor,
  contactEditor,
  heroBandRef,
  flushChromeToMainTop = false,
  profilePreviewSetupAction,
  onEditSubject,
  onDeleteSubject,
  onAddSubject,
  onEditExperience,
  onDeleteExperience,
  onAddExperience,
}: TeacherPublicProfileViewProps) {
  const [tab, setTab] = React.useState(defaultTab);
  const showScheduleTab = Boolean(schedulePanel);

  React.useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);
  const primarySubjectName = subjects[0]?.name ?? "";

  return (
    <PublicProfileBleed $flushToMainTop={flushChromeToMainTop}>
      <Tabs value={tab} onValueChange={setTab} variant="underline" listAlignment="start">
        <PublicProfileChrome $flushToMainTop={flushChromeToMainTop}>
          <PublicProfileHeroBand ref={heroBandRef} $profilePreview={profilePreview}>
            <PublicProfileColumn>
              <TeacherPublicProfileHeader
                name={name}
                imageUrl={imageUrl}
                initials={initials}
                photoEditor={photoEditor}
                heroSummaryEditor={heroSummaryEditor}
                headline={headline}
                spokenLanguages={spokenLanguages}
                locationCountryCode={locationCountryCode}
                locationCity={locationCity}
                locationLabel={locationLabel}
                displayId={displayId}
                rating={rating}
                ratingsCount={ratingsCount}
                primarySubjectName={primarySubjectName}
                afterLanguages={profilePreviewSetupAction}
              />
            </PublicProfileColumn>
          </PublicProfileHeroBand>

          <PublicProfileTabRegion>
            <PublicProfileColumn>
              <TabsList aria-label="Teacher profile sections">
                <TabsTrigger value="about">About/Bio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviewsCount})</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                {showScheduleTab ? <TabsTrigger value="schedule">Scheduling</TabsTrigger> : null}
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
                phone={phone}
                address={address}
                bioEditor={bioEditor}
                contactEditor={contactEditor}
              />
            </TabsContent>

            <TabsContent value="reviews">
              <PanelSection>
                <SectionTitle>Reviews</SectionTitle>
                {testimonials.length === 0 ? (
                  <Muted>
                    {profilePreview
                      ? "Reviews are submitted by students after they attend your classes."
                      : "No reviews yet."}
                  </Muted>
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
                <TeacherPublicProfileSubjectsPanel
                  subjects={subjects}
                  onEditSubject={profilePreview ? onEditSubject : undefined}
                  onDeleteSubject={profilePreview ? onDeleteSubject : undefined}
                  onAddSubject={profilePreview ? onAddSubject : undefined}
                />
              </PanelSection>
            </TabsContent>

            {showScheduleTab ? (
              <TabsContent value="schedule">
                <PanelSection>
                  {profilePreview ? (
                    <SectionTitleOnly>Class schedule</SectionTitleOnly>
                  ) : null}
                  {schedulePanel}
                </PanelSection>
              </TabsContent>
            ) : null}

            <TabsContent value="experience">
              <PanelSection>
                <TeacherPublicProfileExperiencePanel
                  experiences={workExperiences}
                  onEditExperience={profilePreview ? onEditExperience : undefined}
                  onDeleteExperience={profilePreview ? onDeleteExperience : undefined}
                  onAddExperience={profilePreview ? onAddExperience : undefined}
                />
              </PanelSection>
            </TabsContent>
          </PublicProfileColumn>
        </PublicProfileBodyRegion>
      </Tabs>
    </PublicProfileBleed>
  );
}
