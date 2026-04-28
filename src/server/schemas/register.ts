import { z } from "zod";
import { isValidInviteCodeShape } from "@/lib/inviteCode";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name is too long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "TEACHER", "GUARDIAN"]),
    bio: z.string().max(2000).optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const guardianRegisterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name is too long"),
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
