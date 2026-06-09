"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { dropAction } from "@/app/(app)/classes/actions";
import { enrollAction } from "./actions";

export function useTeacherOfferingEnrollment() {
  const router = useRouter();
  const [selectedOfferingId, setSelectedOfferingId] = React.useState<string | null>(null);
  const [, startTransition] = React.useTransition();
  const [pendingOfferingId, setPendingOfferingId] = React.useState<string | null>(null);
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
    setPendingOfferingId(offeringId);
    const fd = new FormData();
    fd.append("offeringId", offeringId);
    startTransition(async () => {
      try {
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
      } finally {
        setPendingOfferingId(null);
      }
    });
  }, [router]);

  const handleDrop = React.useCallback((enrollmentId: string, offeringId: string) => {
    setPendingOfferingId(offeringId);
    const fd = new FormData();
    fd.append("enrollmentId", enrollmentId);
    startTransition(async () => {
      try {
        await dropAction(fd);
        setMessage({
          tone: "success",
          text: "You've been removed from this class.",
        });
        router.refresh();
      } finally {
        setPendingOfferingId(null);
      }
    });
  }, [router]);

  return {
    selectedOfferingId,
    openOffering,
    closeDialog,
    pendingOfferingId,
    message,
    handleEnrol,
    handleDrop,
  };
}
