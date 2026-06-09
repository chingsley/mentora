import type { CalendarEntry } from "@/components/features/calendar/types";
import type { ClassDetail } from "@/components/features/class/ClassDetailsDialog";

export interface StudentClassRow {
  enrollmentId: string;
  entry: CalendarEntry;
  detail: ClassDetail;
  teacherName: string;
}
