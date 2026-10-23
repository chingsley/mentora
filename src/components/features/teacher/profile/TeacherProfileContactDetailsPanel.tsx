"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useActionPending } from "@/hooks/useActionPending";
import styled from "styled-components";
import { saveTeacherContactTabAction, type ActionResult } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import {
  FormFieldControlSlot,
  FormFieldLabelSlot,
  FormFieldMetaSlot,
  FormFieldRoot,
} from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_INPUTS, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  TEACHER_CONTACT_ADDRESS_MAX_LENGTH,
  TEACHER_CONTACT_ADDRESS_TEXTAREA_MIN_HEIGHT,
  TEACHER_CONTACT_EDIT_FIELD_GAP,
  TEACHER_CONTACT_EDIT_LABEL_MIN_HEIGHT,
  TEACHER_CONTACT_PHONE_MAX_LENGTH,
} from "@/constants/teacherProfile.constants";
import {
  ContactCard,
  TeacherProfileContactDetailsView,
} from "./TeacherProfileContactDetailsView";

const ViewContactCard = styled(ContactCard)`
  gap: ${SPACING.TWO};
  padding: ${SPACING.TWO};
`;

const ViewFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const EditFieldStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${TEACHER_CONTACT_EDIT_FIELD_GAP};
  width: 100%;
`;

const EditCard = styled(ContactCard)`
  gap: ${TEACHER_CONTACT_EDIT_FIELD_GAP};
  padding: ${SPACING.TWO};
  box-shadow: none;

  ${FormFieldRoot} {
    gap: ${TEACHER_CONTACT_EDIT_FIELD_GAP};
    grid-template-rows: auto auto auto;

    ${FormFieldLabelSlot} {
      min-height: ${TEACHER_CONTACT_EDIT_LABEL_MIN_HEIGHT};
      align-items: flex-start;
    }

    ${FormFieldControlSlot} {
      min-height: 0;
    }

    ${FormFieldMetaSlot}:empty {
      display: none;
    }
  }
`;

const EditActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${SPACING.TWO};
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const AddressTextarea = styled.textarea<{ $hasError: boolean }>`
  min-height: ${TEACHER_CONTACT_ADDRESS_TEXTAREA_MIN_HEIGHT};
  width: 100%;
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${(p) => formFieldControlBorder(p.$hasError)};
  box-shadow: ${BOX_SHADOW_INPUTS};
  padding: ${SPACING.TWO} ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.TEXT};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  outline: none;
  resize: vertical;
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};

  &::placeholder {
    color: ${FORM_FIELD.PLACEHOLDER_COLOR};
  }

  &:focus {
    border-color: ${COLORS.SIDEBAR_BRAND};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const AddressField = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${TEACHER_CONTACT_EDIT_FIELD_GAP};
  min-width: 0;
  width: 100%;
`;

const AddressLabel = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.TEXT};
`;

const AddressLabelNote = styled.span`
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface TeacherProfileContactDetailsPanelProps {
  email: string;
  contactPhone: string;
  contactAddress: string;
  onSaved?: () => void;
  saveLabel?: string;
  presentation?: "alwaysEdit" | "viewEdit";
}

export function TeacherProfileContactDetailsPanel({
  email,
  contactPhone,
  contactAddress,
  onSaved,
  saveLabel = "Save",
  presentation = "viewEdit",
}: TeacherProfileContactDetailsPanelProps) {
  const router = useRouter();
  const [isSaving, startTransition] = useActionPending();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [emailLocal, setEmailLocal] = React.useState(email);
  const [phoneLocal, setPhoneLocal] = React.useState(contactPhone);
  const [addressLocal, setAddressLocal] = React.useState(contactAddress);
  const [editing, setEditing] = React.useState(presentation === "alwaysEdit");

  React.useEffect(() => {
    setEmailLocal(email);
    setPhoneLocal(contactPhone);
    setAddressLocal(contactAddress);
  }, [email, contactPhone, contactAddress]);

  React.useEffect(() => {
    if (presentation === "alwaysEdit") {
      setEditing(true);
    }
  }, [presentation]);

  function onSave() {
    const fd = new FormData();
    fd.set("email", emailLocal);
    fd.set("contactPhone", phoneLocal);
    fd.set("contactAddress", addressLocal);
    startTransition(async () => {
      const res = await saveTeacherContactTabAction(fd);
      setResult(res);
      if (res.ok) {
        router.refresh();
        if (presentation === "viewEdit") {
          setEditing(false);
        }
        onSaved?.();
      }
    });
  }

  function onCancelEdit() {
    setEmailLocal(email);
    setPhoneLocal(contactPhone);
    setAddressLocal(contactAddress);
    setResult(null);
    setEditing(false);
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  if (presentation === "viewEdit" && !editing) {
    return (
      <ViewContactCard>
        <TeacherProfileContactDetailsView
          embedded
          email={email}
          phone={contactPhone}
          address={contactAddress}
        />
        <ViewFooter>
          <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </ViewFooter>
      </ViewContactCard>
    );
  }

  return (
    <EditCard>
      <EditFieldStack>
        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          value={emailLocal}
          onChange={(e) => setEmailLocal(e.target.value)}
          error={errs?.email}
        />
        <Input
          label="Phone number"
          labelNote="Optional"
          name="contactPhone"
          type="tel"
          autoComplete="tel"
          value={phoneLocal}
          maxLength={TEACHER_CONTACT_PHONE_MAX_LENGTH}
          onChange={(e) => setPhoneLocal(e.target.value)}
          error={errs?.contactPhone}
        />
        <AddressField htmlFor="teacher-profile-contact-address">
          <AddressLabel>
            Address <AddressLabelNote>(optional)</AddressLabelNote>
          </AddressLabel>
          <AddressTextarea
            id="teacher-profile-contact-address"
            name="contactAddress"
            rows={3}
            value={addressLocal}
            maxLength={TEACHER_CONTACT_ADDRESS_MAX_LENGTH}
            $hasError={Boolean(errs?.contactAddress)}
            onChange={(e) => setAddressLocal(e.target.value)}
            placeholder="Street, city, state, postal code"
          />
          {errs?.contactAddress ? <ErrorText>{errs.contactAddress}</ErrorText> : null}
        </AddressField>
      </EditFieldStack>
      <EditActions>
        {presentation === "viewEdit" ? (
          <Button type="button" variant="secondary" disabled={isSaving} onClick={onCancelEdit}>
            Cancel
          </Button>
        ) : null}
        <Button type="button" variant="primary" isLoading={isSaving} onClick={onSave}>
          {saveLabel}
        </Button>
      </EditActions>
      {result && !result.ok && !result.fieldErrors ? <ErrorText>{result.error}</ErrorText> : null}
    </EditCard>
  );
}
