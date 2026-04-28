import "server-only";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { splitFullName } from "@/lib/displayName";
import { generateTeacherDisplayId } from "@/lib/teacherId";
import { registerSchema, type RegisterInput } from "./schemas/register";

export { registerSchema };
export type { RegisterInput };

export class EmailTakenError extends Error {
  constructor() {
    super("An account with this email already exists");
  }
}

export async function registerUser(input: RegisterInput) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) throw new EmailTakenError();

  const passwordHash = await hashPassword(input.password);
  const fullName = input.name.trim().replace(/\s+/g, " ");
  const { firstName, lastName } = splitFullName(input.name);

  const displayId =
    input.role === "TEACHER" ? await generateTeacherDisplayId() : null;

  const user = await db.user.create({
    data: {
      name: fullName,
      firstName,
      lastName,
      email: input.email,
      passwordHash,
      role: input.role as Role,
      teacherProfile:
        input.role === "TEACHER" && displayId
          ? {
              create: {
                displayId,
                headline: "",
                bio: "",
              },
            }
          : undefined,
      studentProfile:
        input.role === "STUDENT"
          ? {
              create: {
                bio: input.bio ?? null,
              },
            }
          : undefined,
      guardianProfile:
        input.role === "GUARDIAN"
          ? {
              create: {},
            }
          : undefined,
    },
  });

  return { id: user.id, email: user.email, role: user.role };
}

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      teacherProfile: true,
      studentProfile: true,
      guardianProfile: true,
      region: true,
    },
  });
}
