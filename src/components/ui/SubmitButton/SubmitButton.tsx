"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/Button";

export type SubmitButtonProps = Omit<ButtonProps, "type">;

/**
 * Submit button wired to the nearest parent `<form>` pending state.
 * Use with `<form action={serverAction}>` so `pending` reflects the in-flight request,
 * or pass `isLoading` when the form uses `onSubmit` + `useActionPending`.
 */
export function SubmitButton({ children, disabled, isLoading, ...rest }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={isLoading ?? pending} disabled={disabled} {...rest}>
      {children}
    </Button>
  );
}
