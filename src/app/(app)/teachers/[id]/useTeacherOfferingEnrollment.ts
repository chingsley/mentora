"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { dropAction } from "@/app/(app)/classes/actions";
import { enrollAction } from "./actions";

export function useTeacherOfferingEnrollment() {
  const router = useRouter();
  const [selectedOfferingId, setSelectedOfferingId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [message, setMessage] = React.useState<
    { tone: "success" | "error"; text: string } | null
  >(null);

  const closeDialog = React.useCallback(() => {
    setSelectedOfferingId(null);
    setMessage(null);
  }, []);

  const openOffering = React.useCallback((offeringId: string) => {
    setSelectedOfferingId(offeringId);
    setMessage(null);
  }, []);

  const handleEnrol = React.useCallback((offeringId: string) => {
    const fd = new FormData();
    fd.append("offeringId", offeringId);
    startTransition(async () => {
      const res = await enrollAction(fd);
      if (res.ok) {
        const success = res.results.filter((r) => r.enrolled).length > 0;
        if (success) {
          setMessage({
            tone: "success",
            text: "You're enrolled! This class now appears in your timetable.",
          });
          router.refresh();
        } else {
          const first = res.results.find((r) => !r.enrolled);
          setMessage({
            tone: "error",
            text: first?.reason ?? "Could not enroll in this class.",
          });
        }
      } else {
        setMessage({ tone: "error", text: res.error });
      }
    });
  }, [router]);

  const handleDrop = React.useCallback((enrollmentId: string) => {
    const fd = new FormData();
    fd.append("enrollmentId", enrollmentId);
    startTransition(async () => {
      await dropAction(fd);
      setMessage({
        tone: "success",
        text: "You've been removed from this class.",
      });
      router.refresh();
    });
  }, [router]);

  return {
    selectedOfferingId,
    openOffering,
    closeDialog,
    isPending,
    message,
    handleEnrol,
    handleDrop,
  };
}
