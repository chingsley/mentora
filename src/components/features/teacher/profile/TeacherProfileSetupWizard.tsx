"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppRouter } from "@/hooks/useAppRouter";
import styled from "styled-components";
import { TeacherProfileSetupNav } from "./TeacherProfileSetupNav";
import { TeacherProfileSetupProvider } from "./TeacherProfileSetupContext";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  firstIncompleteTeacherProfileSetupPhase,
  nextTeacherProfileSetupPhase,
  normalizeTeacherProfileSetupStepParam,
  type TeacherProfileSetupPhase,
} from "@/lib/teacherProfileSetup";
import { TeacherProfileBioSetupStep } from "./TeacherProfileBioSetupStep";
import { TeacherProfileLocationTab } from "./TeacherProfileLocationTab";
import { TeacherProfileCoursesTab } from "./TeacherProfileCoursesTab";
import { TeacherProfileScheduleTab } from "./TeacherProfileScheduleTab";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";
import {
  TEACHER_SETUP_QUERY_VALUE,
  TEACHER_SETUP_STEP_COPY,
} from "./teacherProfileSetup.constants";
import {
  clearSetupDismissed,
  markSetupDismissed,
} from "./teacherProfileSetupStorage";

const SetupPage = styled.div`
  display: flex;
  width: 100%;
  max-width: ${LAYOUT.MAX_WIDTH.TEACHER_PROFILE_SETUP};
  flex-direction: column;
  gap: ${SPACING.EIGHT};
  margin-inline: auto;
  padding-bottom: ${SPACING.SIX};

  ${LAYOUT.MEDIA.MD} {
    padding-bottom: ${SPACING.EIGHT};
  }

  ${LAYOUT.MEDIA.LG} {
    margin-top: calc(${SPACING.TWO} - ${LAYOUT.PAGE_INSET.BLOCK});
  }
`;

const StickyExitBar = styled.div`
  position: sticky;
  top: 0;
  z-index: ${LAYOUT.Z.STICKY};
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  padding-block: ${SPACING.THREE};
  background-color: ${LAYOUT.APP_SHELL.MAIN_BACKGROUND};
  border-bottom: 1px solid ${COLORS.TRANSPARENT};
  transition: border-color 0.2s ease;

  ${LAYOUT.MEDIA.REDUCED_MOTION} {
    transition: none;
  }
`;

const ExitLink = styled.button`
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: ${COLORS.HEADER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_45};
    outline-offset: 2px;
    border-radius: ${LAYOUT.RADIUS.XS};
  }
`;

const SetupHero = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  text-align: center;
  max-width: 36rem;
  margin-inline: auto;
`;

const SetupTitle = styled.h1`
  margin: 0;
  font-size: ${FONTS.SIZE.AUTH_HERO_TITLE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${COLORS.HEADER};

  ${LAYOUT.MEDIA.MD} {
    font-size: ${FONTS.SIZE["3XL"]};
  }
`;

const SetupLead = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.BASE};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const StepContent = styled.div`
  width: 100%;
  min-width: 0;
`;

export interface TeacherProfileSetupWizardProps extends TeacherProfileTabsProps {
  onClose: () => void;
}

function resolveSetupStep(
  urlTab: string | null,
  props: TeacherProfileTabsProps,
): TeacherProfileSetupPhase {
  const normalized = normalizeTeacherProfileSetupStepParam(urlTab);
  if (normalized) return normalized;
  return firstIncompleteTeacherProfileSetupPhase({
    image: props.imageUrl,
    bio: props.bio,
    spokenLanguages: props.spokenLanguages,
    locationCountryCode: props.locationCountryCode,
    locationCity: props.locationCity,
    subjectIds: props.initialSubjects.map((s) => s.subjectId),
    offeringsCount: props.scheduleOfferings.length,
  });
}

export function TeacherProfileSetupWizard({ onClose, ...props }: TeacherProfileSetupWizardProps) {
  const router = useAppRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlTab = params.get("tab");
  const step = resolveSetupStep(urlTab, props);
  const stepCopy = TEACHER_SETUP_STEP_COPY[step];

  const setStep = React.useCallback(
    (next: TeacherProfileSetupPhase) => {
      const search = new URLSearchParams(params.toString());
      search.set("setup", TEACHER_SETUP_QUERY_VALUE);
      search.set("tab", next);
      router.replace(`${pathname}?${search.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  function handleClose() {
    markSetupDismissed();
    onClose();
    router.push("/dashboard");
  }

  function finishSetup() {
    clearSetupDismissed();
    router.refresh();
    router.push("/dashboard");
    onClose();
  }

  function handleAdvance(current: TeacherProfileSetupPhase) {
    if (current === "schedule") {
      finishSetup();
      return;
    }
    setStep(nextTeacherProfileSetupPhase(current));
  }

  function handleSkipStep(current: TeacherProfileSetupPhase) {
    if (current === "schedule") {
      handleClose();
      return;
    }
    setStep(nextTeacherProfileSetupPhase(current));
  }

  return (
    <TeacherProfileSetupProvider onSkip={() => handleSkipStep(step)}>
      <SetupPage>
        <StickyExitBar>
          <ExitLink type="button" onClick={handleClose}>
            Exit setup
          </ExitLink>
        </StickyExitBar>

        <SetupHero>
          <SetupTitle>{stepCopy.title}</SetupTitle>
          <SetupLead>{stepCopy.subtitle}</SetupLead>
        </SetupHero>

        <TeacherProfileSetupNav
          items={props.checklist}
          currentStep={step}
          onNavigateStep={setStep}
        />

        <StepContent>
          {step === "bio" ? (
            <TeacherProfileBioSetupStep
              key={`setup-${props.bio}|${props.imageUrl ?? ""}`}
              initials={props.initials}
              imageUrl={props.imageUrl}
              bio={props.bio}
              onAdvance={() => handleAdvance("bio")}
              onBack={() => setStep("bio")}
              backDisabled
            />
          ) : null}

          {step === "location" ? (
            <TeacherProfileLocationTab
              key={`setup-${props.spokenLanguages}|${props.locationCountryCode}|${props.locationCity}`}
              spokenLanguages={props.spokenLanguages}
              locationCountryCode={props.locationCountryCode}
              locationCity={props.locationCity}
              locationLabel={props.locationLabel}
              onAdvance={() => handleAdvance("location")}
              onBack={() => setStep("bio")}
            />
          ) : null}

          {step === "courses" ? (
            <TeacherProfileCoursesTab
              initialSubjects={props.initialSubjects}
              taughtSubjects={props.taughtSubjects}
              taughtSubjectsWithStudents={props.taughtSubjectsWithStudents}
              globalCap={props.globalCap}
              rateRegions={props.rateRegions}
              rateCells={props.rateCells}
              teacherRegionCode={props.teacherRegionCode}
              onAdvance={() => handleAdvance("courses")}
              onBack={() => setStep("location")}
            />
          ) : null}

          {step === "schedule" ? (
            <TeacherProfileScheduleTab
              scheduleOfferings={props.scheduleOfferings}
              dialogSubjects={props.dialogSubjects}
              inviteableStudents={props.inviteableStudents}
              globalCap={props.globalCap}
              billingCurrency={props.billingCurrency}
              regionMinHourlyMajor={props.regionMinHourlyMajor}
              rateRegions={props.rateRegions}
              rateCells={props.rateCells}
              teacherRegionCode={props.teacherRegionCode}
              onAdvance={() => handleAdvance("schedule")}
              onBack={() => setStep("courses")}
            />
          ) : null}
        </StepContent>
      </SetupPage>
    </TeacherProfileSetupProvider>
  );
}
