"use client";

import * as React from "react";
import {
  OfferingDialog,
  type OfferingDialogSubject,
  type OfferingDialogValue,
} from "@/components/features/teacher/OfferingDialog";
import type { OfferingInviteableStudent } from "@/components/features/teacher/OfferingStudentInviteField";
import { MarketingSecondaryCtaButton } from "@/components/ui/Link";
import { dayOfWeekFromDate } from "@/lib/offeringRecurrence";

const DEFAULT_START_MINUTES = 9 * 60;
const DEFAULT_END_MINUTES = 10 * 60;

function defaultNewOfferingDialogValue(now = new Date()): OfferingDialogValue {
  return {
    dayOfWeek: dayOfWeekFromDate(now),
    startMinutes: DEFAULT_START_MINUTES,
    endMinutes: DEFAULT_END_MINUTES,
  };
}

export interface TeacherAddClassActionProps {
  subjects: OfferingDialogSubject[];
  inviteableStudents: OfferingInviteableStudent[];
  globalCap: number;
  billingCurrency: string;
  regionMinHourlyMajor: number | null;
}

export function TeacherAddClassAction({
  subjects,
  inviteableStudents,
  globalCap,
  billingCurrency,
  regionMinHourlyMajor,
}: TeacherAddClassActionProps) {
  const [open, setOpen] = React.useState(false);
  const [initial, setInitial] = React.useState<OfferingDialogValue | null>(null);

  function handleOpen() {
    setInitial(defaultNewOfferingDialogValue());
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setInitial(null);
  }

  return (
    <>
      <MarketingSecondaryCtaButton type="button" onClick={handleOpen}>
        Add class
      </MarketingSecondaryCtaButton>
      <OfferingDialog
        open={open}
        onClose={handleClose}
        subjects={subjects}
        inviteableStudents={inviteableStudents}
        globalCap={globalCap}
        billingCurrency={billingCurrency}
        regionMinHourlyMajor={regionMinHourlyMajor}
        initial={initial}
      />
    </>
  );
}
