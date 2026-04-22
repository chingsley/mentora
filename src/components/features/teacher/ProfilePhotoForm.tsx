"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";

export interface ProfilePhotoFormProps {
  currentImage: string | null;
  fallbackInitials: string;
  hint?: string;
}

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border sm:h-32 sm:w-32">
        {display ? (
          <Image
            src={display}
            alt="Your profile photo"
            fill
            sizes="128px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
            {fallbackInitials}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handleFile}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={handlePick}>
            {currentImage ? "Replace photo" : "Choose photo"}
          </Button>
          {pendingFile ? (
            <Button type="button" onClick={handleUpload} isLoading={isUploading}>
              Upload
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
