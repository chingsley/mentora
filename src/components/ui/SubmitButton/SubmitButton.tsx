"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/Button";

export type SubmitButtonProps = Omit<ButtonProps, "type" | "isLoading">;

/**
 * Submit button wired to the nearest parent `<form>` pending state.
 * Use with `<form action={serverAction}>` so `isLoading` reflects the in-flight request.
 */
export function SubmitButton({ children, disabled, ...rest }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} disabled={disabled} {...rest}>
      {children}
    </Button>
  );
}
