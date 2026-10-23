"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface TeacherProfileContactDetailsViewProps {
  email: string;
  phone?: string | null;
  address?: string | null;
  /** Omit outer card when nesting inside another bordered surface. */
  embedded?: boolean;
}

export const ContactCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  box-shadow: ${LAYOUT.SHADOW.SM};
`;

const ContactField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  padding: ${SPACING.THREE} 0;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.BORDER_SUBTLE_LIGHT};
  }
`;

const FieldLabel = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  letter-spacing: ${FONTS.LETTER_SPACING.FIELD_LABEL};
  text-transform: uppercase;
  color: ${COLORS.GRAY_TEXT_TERTIARY};
`;

const ContactLink = styled.a`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.ACTION_PRIMARY};
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-word;

  &:hover {
    color: ${COLORS.ACTION_PRIMARY_HOVER};
  }
`;

const ContactText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.GRAY_TEXT_SECONDARY};
  white-space: pre-wrap;
  word-break: break-word;
`;

const ContactEmpty = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export function TeacherProfileContactDetailsView({
  email,
  phone,
  address,
  embedded = false,
}: TeacherProfileContactDetailsViewProps) {
  const phoneValue = phone?.trim() ?? "";
  const addressValue = address?.trim() ?? "";

  const fields = (
    <>
      <ContactField>
        <FieldLabel>Email address</FieldLabel>
        <ContactLink href={`mailto:${email}`}>{email}</ContactLink>
      </ContactField>
      <ContactField>
        <FieldLabel>Phone number</FieldLabel>
        {phoneValue ? (
          <ContactLink href={`tel:${phoneValue}`}>{phoneValue}</ContactLink>
        ) : (
          <ContactEmpty>Not provided</ContactEmpty>
        )}
      </ContactField>
      <ContactField>
        <FieldLabel>Address</FieldLabel>
        {addressValue ? (
          <ContactText>{addressValue}</ContactText>
        ) : (
          <ContactEmpty>Not provided</ContactEmpty>
        )}
      </ContactField>
    </>
  );

  if (embedded) {
    return fields;
  }

  return <ContactCard>{fields}</ContactCard>;
}
