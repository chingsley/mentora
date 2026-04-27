"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface ProfilePhotoFormProps {
  currentImage: string | null;
  fallbackInitials: string;
  hint?: string;
}

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const Avatar = styled.div`
  position: relative;
  height: 7rem;
  width: 7rem;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.MUTED};
  outline: 1px solid ${COLORS.BORDER};
  outline-offset: -1px;

  ${LAYOUT.MEDIA.SM} {
    height: 8rem;
    width: 8rem;
  }
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
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

export function ProfilePhotoForm({
  currentImage,
  fallbackInitials,
  hint = "PNG, JPEG, or WebP · up to 2 MB. A profile photo is required to complete your teacher profile.",
}: ProfilePhotoFormProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const display = preview ?? currentImage;

  function handlePick() {
    inputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Please select a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image is too large (max 2 MB).");
      return;
    }
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setPendingFile(file);
  }

  async function handleUpload() {
    if (!pendingFile) return;
    setIsUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      const res = await fetch("/api/uploads/avatar", { method: "POST", body: fd });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Upload failed");
        return;
      }
      setPendingFile(null);
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Wrap>
      <Avatar>
        {display ? (
          <Image
            src={display}
            alt="Your profile photo"
            fill
            sizes="128px"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        ) : (
          <Fallback>{fallbackInitials}</Fallback>
        )}
      </Avatar>
      <Body>
        <HiddenInput
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFile}
        />
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
        {error ? <ErrorText>{error}</ErrorText> : null}
      </Body>
    </Wrap>
  );
}
