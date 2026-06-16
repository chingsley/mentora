"use client";

import * as React from "react";
import styled from "styled-components";
import { submitContactFormAction, type ContactFormResult } from "@/app/(marketing)/contact/actions";
import { MarketingPageHero } from "@/components/features/marketing/MarketingPageHero";
import {
  MarketingCard,
  MarketingPageSection,
} from "@/components/features/marketing/marketingLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AppHyperLink } from "@/components/ui/Link";
import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { MARKETING_CONTACT } from "@/constants/marketingContent";
import { SPACING } from "@/constants/spacing.constants";

const GridLayout = styled.div`
  display: grid;
  gap: ${SPACING.EIGHT};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
`;

const TextareaField = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const TextareaLabel = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const StyledTextarea = styled.textarea<{ $hasError?: boolean }>`
  min-height: 8rem;
  width: 100%;
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${(p) => formFieldControlBorder(Boolean(p.$hasError))};
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.TEXT};
  outline: none;
  resize: vertical;

  &:focus {
    border-color: ${COLORS.PRIMARY};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const TextareaError = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};
`;

const SideCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const SideTitle = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const SideText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

const SuccessBanner = styled.p`
  margin: 0;
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.SM};
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

export function MarketingContactPage() {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [result, setResult] = React.useState<ContactFormResult | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitContactFormAction(fd);
      setResult(res);
      if (res.ok) formRef.current?.reset();
    });
  }

  const fieldErrors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <>
      <MarketingPageHero
        eyebrow="Support"
        title={MARKETING_CONTACT.title}
        lead={MARKETING_CONTACT.lead}
        large
      />

      <MarketingPageSection>
        <GridLayout>
          <MarketingCard>
          {result?.ok ? (
            <SuccessBanner>
              Thanks for reaching out. We&apos;ve received your message and will reply within two business
              days.
            </SuccessBanner>
          ) : (
            <Form ref={formRef} onSubmit={onSubmit}>
              <Input
                name="name"
                label={MARKETING_CONTACT.fields.name}
                required
                disabled={isPending}
                error={fieldErrors?.name}
              />
              <Input
                name="email"
                type="email"
                label={MARKETING_CONTACT.fields.email}
                required
                disabled={isPending}
                autoComplete="email"
                error={fieldErrors?.email}
              />
              <Input
                name="subject"
                label={MARKETING_CONTACT.fields.subject}
                required
                disabled={isPending}
                error={fieldErrors?.subject}
              />
              <TextareaField>
                <TextareaLabel>{MARKETING_CONTACT.fields.message}</TextareaLabel>
                <StyledTextarea
                  name="message"
                  required
                  disabled={isPending}
                  maxLength={5000}
                  $hasError={Boolean(fieldErrors?.message)}
                />
                {fieldErrors?.message ? <TextareaError>{fieldErrors.message}</TextareaError> : null}
              </TextareaField>
              {result && !result.ok && !result.fieldErrors ? (
                <ErrorText>{result.error}</ErrorText>
              ) : null}
              <Button type="submit" isLoading={isPending} disabled={isPending}>
                Send message
              </Button>
            </Form>
          )}
          </MarketingCard>

          <SideCopy>
          <SideTitle>Prefer email?</SideTitle>
          <SideText>
            Write to{" "}
            <AppHyperLink href={`mailto:${MARKETING_CONTACT.email}`}>{MARKETING_CONTACT.email}</AppHyperLink>{" "}
            and include your role (student, teacher, guardian, or school).
          </SideText>
          <SideText>
            For account help, log in and visit your profile settings. For guardian invites, use the invite
            code from your student.
          </SideText>
        </SideCopy>
        </GridLayout>
      </MarketingPageSection>
    </>
  );
}
