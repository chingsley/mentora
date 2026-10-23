"use client";

import { Dialog } from "@/components/ui/Dialog";
import { TeacherProfileAddCourseForm } from "./TeacherProfileAddCourseForm";

export interface TeacherProfileAddCourseDialogProps {
  open: boolean;
  onClose: () => void;
  globalCap: number;
}

export function TeacherProfileAddCourseDialog({
  open,
  onClose,
  globalCap,
}: TeacherProfileAddCourseDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Add course" size="lg" placement="right">
      {open ? (
        <TeacherProfileAddCourseForm
          presentation="drawer"
          globalCap={globalCap}
          onClearEdit={onClose}
          onCancel={onClose}
        />
      ) : null}
    </Dialog>
  );
}
