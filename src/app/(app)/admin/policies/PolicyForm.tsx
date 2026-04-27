"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { updatePolicyAction, type PolicyActionResult } from "./actions";

const Form = styled.form`
  display: grid;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${SPACING.TWO};

  ${LAYOUT.MEDIA.SM} {
    grid-column: span 3;
  }
`;

const StatusWrap = styled.div`
  position: relative;
  height: 3.5rem;
  width: 100%;
  flex-shrink: 0;
`;

const StatusOverlay = styled.p`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const SuccessText = styled.span`
  max-width: 100%;
  border-radius: ${LAYOUT.RADIUS.MD};
  padding: 0.375rem ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.SUCCESS};
`;

const ErrorText = styled.span`
  max-width: 100%;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid rgba(220, 38, 38, 0.25);
  background-color: rgba(220, 38, 38, 0.05);
  padding: 0.375rem ${SPACING.THREE};
  text-align: right;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.SNUG};
  color: ${COLORS.DESTRUCTIVE};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export interface PolicyFormProps {
  initial: {
    globalClassCap: number;
    commissionPercent: number;
    attendanceThresholdPct: number;
  };
}

export function PolicyForm({ initial }: PolicyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<PolicyActionResult | null>(null);

  React.useEffect(() => {
    if (!result?.ok) return;
    const id = window.setTimeout(() => setResult(null), 4000);
    return () => window.clearTimeout(id);
  }, [result]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updatePolicyAction(fd);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <Form onSubmit={onSubmit}>
      <Input
        name="globalClassCap"
        type="number"
        min={1}
        max={1000}
        label="Global class cap"
        defaultValue={initial.globalClassCap}
        required
        error={errs?.globalClassCap}
        hint="Teachers cannot exceed this per period."
      />
      <Input
        name="commissionPercent"
        type="number"
        min={0}
        max={50}
        label="Commission (%)"
        defaultValue={initial.commissionPercent}
        required
        error={errs?.commissionPercent}
      />
      <Input
        name="attendanceThresholdPct"
        type="number"
        min={10}
        max={100}
        label="Attendance threshold (%)"
        defaultValue={initial.attendanceThresholdPct}
        required
        error={errs?.attendanceThresholdPct}
        hint="Required presence to mark attendance."
      />
      <Footer>
        <StatusWrap>
          {result?.ok ? (
            <StatusOverlay role="status" aria-live="polite">
              <SuccessText>Settings saved.</SuccessText>
            </StatusOverlay>
          ) : null}
          {result && !result.ok && !result.fieldErrors ? (
            <StatusOverlay role="alert" aria-live="assertive">
              <ErrorText title={result.error}>{result.error}</ErrorText>
            </StatusOverlay>
          ) : null}
        </StatusWrap>
        <Button type="submit" isLoading={isPending}>
          Save policy
        </Button>
      </Footer>
    </Form>
  );
}
