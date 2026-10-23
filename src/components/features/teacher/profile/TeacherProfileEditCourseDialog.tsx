"use client";

import { Dialog } from "@/components/ui/Dialog";
import {
  TeacherProfileAddCourseForm,
  type TeacherProfileEditCourseValues,
} from "./TeacherProfileAddCourseForm";

export interface TeacherProfileEditCourseDialogProps {
  editCourse: TeacherProfileEditCourseValues | null;
  onClose: () => void;
  globalCap: number;
}

export function TeacherProfileEditCourseDialog({
  editCourse,
  onClose,
  globalCap,
}: TeacherProfileEditCourseDialogProps) {
  const open = editCourse !== null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editCourse ? `Edit ${editCourse.subjectName}` : "Edit course"}
      size="lg"
      placement="right"
    >
      {editCourse ? (
        <TeacherProfileAddCourseForm
          presentation="drawer"
          globalCap={globalCap}
          editCourse={editCourse}
          onClearEdit={onClose}
          onCancel={onClose}
        />
      ) : null}
    </Dialog>
  );
}
