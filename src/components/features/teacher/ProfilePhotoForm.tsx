"use client";

import Image from "next/image";
import { CloudUpload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { clearTeacherAvatarAction } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface ProfilePhotoFormProps {
  currentImage: string | null;
  fallbackInitials: string;
  hint?: string;
  /** Studio layout: avatar with corner upload control (profile bio tab) */
  layout?: "default" | "studio";
  children?: React.ReactNode;
}

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/jpg"]);

/** Same width as TeacherProfileBioTab FormGrid columns (form has container-type: inline-size). */
const FORM_GRID_HALF_TRACK_CQI = `calc((100cqi - ${SPACING.SIX}) * 0.5)`;

function revokeBlobUrl(url: string | null) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

function isAllowedImageFile(file: File): boolean {
  const t = file.type.trim().toLowerCase();
  if (ALLOWED_IMAGE_TYPES.has(t)) return true;
  if (!t && /\.(png|jpe?g|webp)$/i.test(file.name)) return true;
  return false;
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  max-width: 50%;
  align-items: center;
  justify-content: center;

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: flex-start;
    max-width: 50%;
     align-items: center;
  justify-content: center;
  }
`;

const StudioWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
  max-width: 50%;
  align-items: center;
  justify-content: center;
`;

const StudioPhotoRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.FIVE};
  width: 100%;

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: flex-start;
    gap: ${SPACING.SIX};
  }
`;

const StudioChildrenWrap = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;

  ${LAYOUT.MEDIA.SM} {
    /**
     * Same track as TeacherProfileBioTab FormGrid columns (form content inline size − gap) / 2.
     * Uses cqi so width matches the grid below.
     */
    flex: 0 0 ${FORM_GRID_HALF_TRACK_CQI};
    min-width: 0;
    max-width: ${FORM_GRID_HALF_TRACK_CQI};
  }
`;

const StudioAvatarColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    /**
     * Matches the left FormGrid column: avatar + actions centered in that track.
     */
    flex: 0 0 ${FORM_GRID_HALF_TRACK_CQI};
    min-width: 0;
    max-width: ${FORM_GRID_HALF_TRACK_CQI};
  }
`;

const AvatarWithUpload = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const AvatarUploadFab = styled.button`
  position: absolute;
  z-index: 1;
  left: calc(50% + (9.75rem / 2) * 0.70710678 - 1.125rem);
  top: calc(50% + (9.75rem / 2) * 0.70710678 - 1.125rem);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 2px solid ${COLORS.BUTTON_PRIMARY_BG};
  background: ${COLORS.WHITE};
  color: ${COLORS.BUTTON_PRIMARY_BG};
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${COLORS.BUTTON_PRIMARY_BG_HOVER};
    color: ${COLORS.BUTTON_PRIMARY_BG_HOVER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.HEADER_BORDER_25};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StudioAvatarActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.TWO};
  width: 100%;
`;

const Avatar = styled.div<{ $studio?: boolean; }>`
  position: relative;
  height: ${(p) => (p.$studio ? "9.75rem" : "7rem")};
  width: ${(p) => (p.$studio ? "9.75rem" : "7rem")};
  flex-shrink: 0;
  overflow: hidden;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.MUTED};
  outline: 1px solid ${COLORS.BORDER};
  outline-offset: -1px;

  ${LAYOUT.MEDIA.SM} {
    height: ${(p) => (p.$studio ? "9.75rem" : "8rem")};
    width: ${(p) => (p.$studio ? "9.75rem" : "8rem")};
  }
`;

/** Local blob/data previews — avoids Strict Mode + `next/image` edge cases with `blob:` URLs. */
const AvatarPreviewImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Fallback = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-size: ${FONTS.SIZE["2XL"]};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const HiddenInput = styled.input`
  display: none;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
`;

const Hint = styled.p`
  margin: 0;
  align-self: stretch;
  width: 100%;
  text-align: left;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ErrorSlot = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: calc(${FONTS.SIZE.SM} * 1.45 * 2);
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: 1.45;
  color: ${COLORS.DESTRUCTIVE};
`;

function isLocalPreviewSrc(src: string) {
  return src.startsWith("blob:") || src.startsWith("data:");
}

function usePickAndUpload(
  currentImage: string | null,
  router: ReturnType<typeof useRouter>,
) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isRemoving, setIsRemoving] = React.useState(false);

  const display = preview ?? currentImage;

  function ingestFile(file: File) {
    setError(null);
    if (!isAllowedImageFile(file)) {
      setError("Please select a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Selected file is too large (max 2 MB).");
      return;
    }
    setPreview((prev) => {
      revokeBlobUrl(prev);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
  }

  function handlePick() {
    inputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    ingestFile(file);
    e.target.value = "";
  }

  async function handleUpload() {
    if (!pendingFile) return;
    setIsUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      const res = await fetch("/api/uploads/avatar", { method: "POST", body: fd });
      const json = (await res.json()) as { ok: boolean; error?: string; };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Upload failed");
        return;
      }
      setPendingFile(null);
      setPreview((prev) => {
        revokeBlobUrl(prev);
        return null;
      });
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    if (pendingFile) {
      setPreview((prev) => {
        revokeBlobUrl(prev);
        return null;
      });
      setPendingFile(null);
      setError(null);
      return;
    }

    if (!currentImage) return;
    const confirmed = window.confirm("Remove your profile photo?");
    if (!confirmed) return;

    setIsRemoving(true);
    setError(null);
    try {
      const res = await clearTeacherAvatarAction();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Failed to remove photo.");
    } finally {
      setIsRemoving(false);
    }
  }

  return {
    inputRef,
    display,
    pendingFile,
    isUploading,
    error,
    isRemoving,
    handlePick,
    handleFile,
    handleUpload,
    handleRemove,
    ingestFile,
  };
}

export function ProfilePhotoForm({
  currentImage,
  fallbackInitials,
  hint = "PNG, JPEG, or WebP · up to 2 MB. A profile photo is required to complete your teacher profile.",
  layout = "default",
  children,
}: ProfilePhotoFormProps) {
  const router = useRouter();
  const {
    inputRef,
    display,
    pendingFile,
    isUploading,
    error,
    isRemoving,
    handlePick,
    handleFile,
    handleUpload,
    handleRemove,
  } = usePickAndUpload(currentImage, router);

  if (layout === "studio") {
    return (
      <StudioWrap>
        <StudioPhotoRow>
          <StudioAvatarColumn>
            <HiddenInput ref={inputRef} type="file" accept={ACCEPT} onChange={handleFile} />
            <AvatarWithUpload>
              <Avatar $studio>
                {display ? (
                  isLocalPreviewSrc(display) ? (
                    <AvatarPreviewImg src={display} alt="Your profile photo" />
                  ) : (
                    <Image
                      src={display}
                      alt="Your profile photo"
                      fill
                      sizes="128px"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  )
                ) : (
                  <Fallback>{fallbackInitials}</Fallback>
                )}
              </Avatar>
              {display ? (
                <AvatarUploadFab
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading || isRemoving}
                  aria-label="Remove profile photo"
                >
                  <X size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} aria-hidden />
                </AvatarUploadFab>
              ) : (
                <AvatarUploadFab
                  type="button"
                  onClick={handlePick}
                  disabled={isUploading || isRemoving}
                  aria-label="Upload new profile photo"
                >
                  <CloudUpload size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} aria-hidden />
                </AvatarUploadFab>
              )}
            </AvatarWithUpload>
            <StudioAvatarActions>
              <Button
                type="button"
                variant="secondary"
                onClick={handleUpload}
                disabled={isRemoving || !pendingFile}
                isLoading={isUploading}
              >
                Save Upload
              </Button>
            </StudioAvatarActions>
          </StudioAvatarColumn>
          {children ? <StudioChildrenWrap>{children}</StudioChildrenWrap> : null}
        </StudioPhotoRow>
        {hint ? <Hint>{hint}</Hint> : null}
        <ErrorSlot role="status" aria-live="polite">
          {error ? <ErrorText>{error}</ErrorText> : null}
        </ErrorSlot>
      </StudioWrap>
    );
  }

  return (
    <Wrap>
      <Avatar>
        {display ? (
          isLocalPreviewSrc(display) ? (
            <AvatarPreviewImg src={display} alt="Your profile photo" />
          ) : (
            <Image
              src={display}
              alt="Your profile photo"
              fill
              sizes="128px"
              style={{ objectFit: "cover" }}
              unoptimized
            />
          )
        ) : (
          <Fallback>{fallbackInitials}</Fallback>
        )}
      </Avatar>
      <Body>
        <HiddenInput ref={inputRef} type="file" accept={ACCEPT} onChange={handleFile} />
        <Actions>
          <Button type="button" variant="secondary" onClick={handlePick}>
            {currentImage ? "Replace photo" : "Choose photo"}
          </Button>
          {pendingFile ? (
            <Button type="button" onClick={handleUpload} isLoading={isUploading}>
              Upload
            </Button>
          ) : null}
        </Actions>
        <Hint>{hint}</Hint>
        <ErrorSlot role="status" aria-live="polite">
          {error ? <ErrorText>{error}</ErrorText> : null}
        </ErrorSlot>
      </Body>
    </Wrap>
  );
}
