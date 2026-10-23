"use client";

import { Dialog } from "@/components/ui/Dialog";
import {
  TeacherProfileWorkExperienceForm,
  type TeacherProfileEditWorkExperienceValues,
} from "./TeacherProfileWorkExperienceForm";

export interface TeacherProfileWorkExperienceDialogProps {
  open: boolean;
  editEntry: TeacherProfileEditWorkExperienceValues | null;
  onClose: () => void;
}

export function TeacherProfileWorkExperienceDialog({
  open,
  editEntry,
  onClose,
}: TeacherProfileWorkExperienceDialogProps) {
  const isEdit = editEntry !== null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${editEntry.company}` : "Add experience"}
      size="lg"
      placement="right"
    >
      {open ? (
        <TeacherProfileWorkExperienceForm
          editEntry={editEntry}
          onClearEdit={onClose}
          onCancel={onClose}
        />
      ) : null}
    </Dialog>
  );
}
