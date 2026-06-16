"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TeacherProfileSetupWizard } from "./TeacherProfileSetupWizard";
import { TeacherProfileTabsClient } from "./TeacherProfileTabsClient";
import { TeacherProfileWelcomeScreen } from "./TeacherProfileWelcomeScreen";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";
import {
  TEACHER_SETUP_QUERY_VALUE,
  TEACHER_WELCOME_QUERY_VALUE,
  teacherProfileSetupHref,
  teacherProfileWelcomeHref,
} from "./teacherProfileSetup.constants";
import {
  markSetupDismissed,
  markWelcomeSeen,
  readSetupDismissed,
  readWelcomeSeen,
} from "./teacherProfileSetupStorage";

const SetupShell = styled.div`
  display: flex;
  width: 100%;
  max-width: ${LAYOUT.MAX_WIDTH.TEACHER_PROFILE_SETUP};
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.EIGHT};
  margin-inline: auto;
  padding-block: ${SPACING.TEN};
  text-align: center;

  ${LAYOUT.MEDIA.LG} {
    margin-top: calc(${SPACING.FOUR} - ${LAYOUT.PAGE_INSET.BLOCK});
  }
`;

const SetupIntroCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  max-width: 32rem;
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
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
`;

const ResumeButton = styled(Button)`
  min-width: 12rem;
`;

export interface TeacherProfilePageClientProps extends TeacherProfileTabsProps {
  initialTab?: string | null;
  initialSetup?: boolean;
  initialWelcome?: boolean;
}

function TeacherProfilePageClientInner({
  initialTab,
  initialSetup = false,
  initialWelcome = false,
  ...props
}: TeacherProfilePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const welcomeParam = params.get("welcome") === TEACHER_WELCOME_QUERY_VALUE;
  const setupParam = params.get("setup") === TEACHER_SETUP_QUERY_VALUE;
  const [welcomeSeen, setWelcomeSeen] = React.useState(readWelcomeSeen);
  const dismissed = readSetupDismissed();

  const inSetupFlow =
    !props.profileCompleted &&
    welcomeSeen &&
    (initialSetup || setupParam || (pathname === "/profile" && !dismissed));

  React.useEffect(() => {
    setWelcomeSeen(readWelcomeSeen());
  }, [welcomeParam, setupParam]);

  React.useEffect(() => {
    if (props.profileCompleted || welcomeSeen) return;
    if (setupParam && !welcomeParam) {
      router.replace(teacherProfileWelcomeHref(), { scroll: false });
    }
  }, [props.profileCompleted, router, setupParam, welcomeParam, welcomeSeen]);

  React.useEffect(() => {
    if (props.profileCompleted || !welcomeParam || !welcomeSeen) return;
    router.replace(dismissed ? "/dashboard" : teacherProfileSetupHref(), { scroll: false });
  }, [dismissed, props.profileCompleted, router, welcomeParam, welcomeSeen]);

  React.useEffect(() => {
    if (props.profileCompleted || !inSetupFlow || setupParam || pathname !== "/profile") {
      return;
    }

    const tab = params.get("tab");
    router.replace(teacherProfileSetupHref(tab ?? undefined), { scroll: false });
  }, [inSetupFlow, params, pathname, props.profileCompleted, router, setupParam]);

  function handleSetupProfile() {
    markWelcomeSeen();
    setWelcomeSeen(true);
    router.push(teacherProfileSetupHref());
  }

  function handleSetupLater() {
    markWelcomeSeen();
    markSetupDismissed();
    setWelcomeSeen(true);
    router.push("/dashboard");
  }

  const showWelcome =
    !props.profileCompleted && !welcomeSeen && (welcomeParam || initialWelcome);

  if (props.profileCompleted) {
    return <TeacherProfileTabsClient maintenanceMode initialTab={initialTab} {...props} />;
  }

  if (showWelcome) {
    return (
      <TeacherProfileWelcomeScreen
        fullName={props.fullName}
        onSetupProfile={handleSetupProfile}
        onSetupLater={handleSetupLater}
      />
    );
  }

  if (inSetupFlow) {
    return (
      <TeacherProfileSetupWizard
        onClose={() => {
          /* dismiss + dashboard navigation handled in wizard */
        }}
        {...props}
      />
    );
  }

  return (
    <SetupShell>
      <SetupIntroCopy>
        <SetupTitle>Finish your profile</SetupTitle>
        <SetupLead>
          A quick setup walkthrough — photo, courses, schedule, and payout — so students can find and
          book you.
        </SetupLead>
      </SetupIntroCopy>
      <ResumeButton type="button" onClick={() => router.push(teacherProfileSetupHref())}>
        Continue setup
      </ResumeButton>
    </SetupShell>
  );
}

export function TeacherProfilePageClient(props: TeacherProfilePageClientProps) {
  return (
    <Suspense fallback={null}>
      <TeacherProfilePageClientInner {...props} />
    </Suspense>
  );
}
