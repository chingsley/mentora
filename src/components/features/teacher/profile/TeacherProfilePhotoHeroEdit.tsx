"use client";

import { ProfilePhotoForm } from "@/components/features/teacher/ProfilePhotoForm";

export interface TeacherProfilePhotoHeroEditProps {
  imageUrl: string | null;
  initials: string;
}

export function TeacherProfilePhotoHeroEdit({ imageUrl, initials }: TeacherProfilePhotoHeroEditProps) {
  return (
    <ProfilePhotoForm
      layout="publicHero"
      uploadOnPick
      currentImage={imageUrl}
      fallbackInitials={initials}
      hint=""
    />
  );
}
