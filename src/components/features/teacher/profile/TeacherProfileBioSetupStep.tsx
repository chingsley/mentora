"use client";

import styled from "styled-components";
import { SPACING } from "@/constants/spacing.constants";
import { TeacherProfileBioEditPanel } from "./TeacherProfileBioEditPanel";
import { TeacherProfilePhotoHeroEdit } from "./TeacherProfilePhotoHeroEdit";
import { TeacherProfileTabFooter } from "./TeacherProfileTabFooter";

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.EIGHT};
  width: 100%;
  max-width: 36rem;
  margin-inline: auto;
`;

const PhotoBlock = styled.div`
  display: flex;
  justify-content: center;
`;

export interface TeacherProfileBioSetupStepProps {
  initials: string;
  imageUrl: string | null;
  bio: string;
  onAdvance: () => void;
  onBack: () => void;
  backDisabled?: boolean;
}

export function TeacherProfileBioSetupStep({
  initials,
  imageUrl,
  bio,
  onAdvance,
  onBack,
  backDisabled = false,
}: TeacherProfileBioSetupStepProps) {
  return (
    <Stack>
      <PhotoBlock>
        <TeacherProfilePhotoHeroEdit imageUrl={imageUrl} initials={initials} />
      </PhotoBlock>
      <TeacherProfileBioEditPanel bio={bio} saveLabel="Save & continue" onSaved={onAdvance} />
      <TeacherProfileTabFooter onBack={onBack} backOnly backDisabled={backDisabled} />
    </Stack>
  );
}
