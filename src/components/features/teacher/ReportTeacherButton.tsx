"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { ReportTeacherDialog } from "./ReportTeacherDialog";

export interface ReportTeacherButtonProps {
  teacherProfileId: string;
  teacherName: string;
}

export function ReportTeacherButton({ teacherProfileId, teacherName }: ReportTeacherButtonProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Report teacher
      </Button>
      <ReportTeacherDialog
        open={open}
        onClose={() => setOpen(false)}
        teacherProfileId={teacherProfileId}
        teacherName={teacherName}
      />
    </>
  );
}
