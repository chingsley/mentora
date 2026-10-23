import "server-only";

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isValidSubjectName, normalizeSubjectName, subjectSlugFromName } from "@/lib/subjectName";

export async function resolveOrCreateSubjectByName(
  rawName: string,
  tx?: Prisma.TransactionClient,
): Promise<{ id: string; name: string }> {
  const client = tx ?? db;
  const name = normalizeSubjectName(rawName);
  if (!isValidSubjectName(name)) {
    throw new Error("Enter a course name between 2 and 120 characters.");
  }

  const existing = await client.subject.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (existing) return existing;

  const baseSlug = subjectSlugFromName(name);
  let slug = baseSlug;
  let suffix = 0;
  while (await client.subject.findUnique({ where: { slug }, select: { id: true } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return client.subject.create({
    data: { name, slug },
    select: { id: true, name: true },
  });
}
