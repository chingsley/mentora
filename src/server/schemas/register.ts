import { z } from "zod";
import { isValidInviteCodeShape } from "@/lib/inviteCode";

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(60, "First name is too long"),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(60, "Last name is too long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "TEACHER", "GUARDIAN"]),
    regionCode: z.string().min(2).max(8).optional(),
    bio: z.string().max(2000).optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const guardianRegisterSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(60, "First name is too long"),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(60, "Last name is too long"),
    email: z.string().email("Invalid email"),
    inviteCode: z
      .string()
      .min(1, "Invite code is required")
      .refine((v) => isValidInviteCodeShape(v), "Invite code is not valid"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type GuardianRegisterInput = z.infer<typeof guardianRegisterSchema>;
