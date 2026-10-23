"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useActionPending } from "@/hooks/useActionPending";
import styled from "styled-components";
import { saveTeacherWorkExperienceAction, type ActionResult } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TEACHER_WORK_EXPERIENCE } from "@/constants/teacherWorkExperience.constants";
import { monthInputFromDate } from "@/lib/teacherWorkExperienceMonth";

export interface TeacherProfileEditWorkExperienceValues {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
}

export interface TeacherProfileWorkExperienceFormProps {
  editEntry?: TeacherProfileEditWorkExperienceValues | null;
  onClearEdit?: () => void;
  onCancel?: () => void;
}

const FormGrid = styled.form`
  display: grid;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Span2 = styled.div`
  ${LAYOUT.MEDIA.SM} {
    grid-column: span 2 / span 2;
  }
`;

const FormError = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};

  ${LAYOUT.MEDIA.SM} {
    grid-column: span 2 / span 2;
  }
`;

const CurrentRoleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${SPACING.TWO};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.HEADER};
  cursor: pointer;

  ${LAYOUT.MEDIA.SM} {
    grid-column: span 2 / span 2;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${SPACING.TWO};

  ${LAYOUT.MEDIA.SM} {
    grid-column: span 2 / span 2;
  }
`;

function fieldError(
  fieldErrors: Record<string, string> | undefined,
  key: string,
): string | undefined {
  const msg = fieldErrors?.[key];
  return msg && msg.length > 0 ? msg : undefined;
}

function valuesFromEdit(entry: TeacherProfileEditWorkExperienceValues) {
  const start = new Date(entry.startDate);
  const end = entry.endDate ? new Date(entry.endDate) : null;
  return {
    company: entry.company,
    role: entry.role,
    startMonth: monthInputFromDate(start),
    endMonth: end ? monthInputFromDate(end) : "",
    isCurrent: end === null,
  };
}

export function TeacherProfileWorkExperienceForm({
  editEntry = null,
  onClearEdit,
  onCancel,
}: TeacherProfileWorkExperienceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useActionPending();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const isEditing = editEntry !== null;

  const [company, setCompany] = React.useState("");
  const [role, setRole] = React.useState("");
  const [startMonth, setStartMonth] = React.useState("");
  const [endMonth, setEndMonth] = React.useState("");
  const [isCurrent, setIsCurrent] = React.useState(false);

  React.useEffect(() => {
    if (editEntry) {
      const v = valuesFromEdit(editEntry);
      setCompany(v.company);
      setRole(v.role);
      setStartMonth(v.startMonth);
      setEndMonth(v.endMonth);
      setIsCurrent(v.isCurrent);
      setResult(null);
      return;
    }
    setCompany("");
    setRole("");
    setStartMonth("");
    setEndMonth("");
    setIsCurrent(false);
    setResult(null);
  }, [editEntry]);

  const canSubmit =
    company.trim().length > 0 && role.trim().length > 0 && startMonth.length > 0;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    const fd = new FormData();
    if (isEditing && editEntry) fd.append("id", editEntry.id);
    fd.append("company", company);
    fd.append("role", role);
    fd.append("startMonth", startMonth);
    fd.append("endMonth", isCurrent ? "" : endMonth);
    fd.append("isCurrent", isCurrent ? "true" : "false");

    startTransition(async () => {
      const res = await saveTeacherWorkExperienceAction(fd);
      if (res.ok) {
        onClearEdit?.();
        router.refresh();
        return;
      }
      setResult(res);
    });
  }

  const fieldErrors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <FormGrid onSubmit={onSubmit} aria-label={isEditing ? "Edit experience" : "Add experience"}>
      <Span2>
        <Input
          label="Organization"
          name="company"
          value={company}
          maxLength={TEACHER_WORK_EXPERIENCE.COMPANY_MAX}
          placeholder="e.g. Summit Prep School"
          error={fieldError(fieldErrors, "company")}
          disabled={isPending}
          onChange={(e) => setCompany(e.target.value)}
        />
      </Span2>
      <Span2>
        <Input
          label="Role or title"
          name="role"
          value={role}
          maxLength={TEACHER_WORK_EXPERIENCE.ROLE_MAX}
          placeholder="e.g. Senior Instructor"
          error={fieldError(fieldErrors, "role")}
          disabled={isPending}
          onChange={(e) => setRole(e.target.value)}
        />
      </Span2>
      <Input
        type="month"
        label="Start month"
        name="startMonth"
        value={startMonth}
        error={fieldError(fieldErrors, "startMonth")}
        disabled={isPending}
        onChange={(e) => setStartMonth(e.target.value)}
      />
      <Input
        type="month"
        label="End month"
        name="endMonth"
        value={endMonth}
        error={fieldError(fieldErrors, "endMonth")}
        disabled={isPending || isCurrent}
        onChange={(e) => setEndMonth(e.target.value)}
      />
      <CurrentRoleLabel>
        <input
          type="checkbox"
          checked={isCurrent}
          disabled={isPending}
          onChange={(e) => setIsCurrent(e.target.checked)}
        />
        I currently work here
      </CurrentRoleLabel>
      {result && !result.ok ? <FormError>{result.error}</FormError> : null}
      <Footer>
        <Button type="button" variant="secondary" disabled={isPending} onClick={() => onCancel?.()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending} disabled={!canSubmit || isPending}>
          {isEditing ? "Save experience" : "Add experience"}
        </Button>
      </Footer>
    </FormGrid>
  );
}
