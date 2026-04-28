"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { saveTeacherRegionAction, type ActionResult } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface TeacherRegionFormProps {
  options: { value: string; label: string }[];
  defaultRegionCode: string;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

export function TeacherRegionForm({ options, defaultRegionCode }: TeacherRegionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveTeacherRegionAction(fd);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <Form onSubmit={onSubmit}>
      <Select
        name="regionCode"
        label="Primary region"
        placeholder="Select your region"
        defaultValue={defaultRegionCode}
        required
        options={options}
        error={errs?.regionCode}
      />
      {result && !result.ok && !result.fieldErrors ? <ErrorText>{result.error}</ErrorText> : null}
      <div>
        <Button type="submit" isLoading={isPending}>
          Save region
        </Button>
      </div>
    </Form>
  );
}
