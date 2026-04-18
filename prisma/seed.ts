import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@mentora.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  console.log("Seeding platform policy...");
  await db.platformPolicy.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });

  console.log("Seeding regions...");
  const regionData: Array<{ code: string; name: string; currency: string; minRate: number }> = [
    { code: "NG", name: "Nigeria", currency: "NGN", minRate: 350_000 },
    { code: "US", name: "United States", currency: "USD", minRate: 1500 },
    { code: "EU", name: "Europe", currency: "EUR", minRate: 1500 },
  ];
  for (const r of regionData) {
    const region = await db.region.upsert({
      where: { code: r.code },
      create: { code: r.code, name: r.name, currency: r.currency },
      update: { name: r.name, currency: r.currency },
    });
    await db.regionMinRate.upsert({
      where: { regionId: region.id },
      create: { regionId: region.id, hourlyRate: r.minRate },
      update: { hourlyRate: r.minRate },
    });
  }

  console.log("Seeding subjects...");
  const subjectData = [
    { slug: "math", name: "Mathematics" },
    { slug: "english", name: "English" },
    { slug: "physics", name: "Physics" },
    { slug: "chemistry", name: "Chemistry" },
    { slug: "programming", name: "Programming" },
    { slug: "music", name: "Music" },
  ];
  for (const s of subjectData) {
    await db.subject.upsert({
      where: { slug: s.slug },
      create: s,
      update: { name: s.name },
    });
  }

  console.log(`Seeding admin user (${adminEmail})...`);
  const nigeria = await db.region.findUnique({ where: { code: "NG" } });
  await db.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Mentora Admin",
      firstName: "Mentora",
      lastName: "Admin",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
      regionId: nigeria?.id,
    },
    update: {},
  });

  console.log("Seeding demo teacher...");
  const demoTeacherEmail = "teacher@mentora.local";
  const math = await db.subject.findUnique({ where: { slug: "math" } });
  const physics = await db.subject.findUnique({ where: { slug: "physics" } });

  const teacherUser = await db.user.upsert({
    where: { email: demoTeacherEmail },
    create: {
      email: demoTeacherEmail,
      name: "Jane Okafor",
      firstName: "Jane",
      lastName: "Okafor",
      passwordHash: await bcrypt.hash("ChangeMe123!", 10),
      role: "TEACHER",
      regionId: nigeria?.id,
      teacherProfile: {
        create: {
          displayId: "T-260422-01A",
          headline: "Senior Mathematics & Physics tutor (10+ yrs)",
          bio: "I help students master algebra, calculus, and mechanics.",
          avgRating: 4.8,
          ratingsCount: 42,
          profileCompleted: true,
        },
      },
    },
    update: {},
    include: { teacherProfile: true },
  });

  if (teacherUser.teacherProfile && math && physics && nigeria) {
    const teacherProfileId = teacherUser.teacherProfile.id;
    for (const subjectId of [math.id, physics.id]) {
      await db.teacherSubject.upsert({
        where: { teacherProfileId_subjectId: { teacherProfileId, subjectId } },
        create: { teacherProfileId, subjectId },
        update: {},
      });
      await db.teacherRate.upsert({
        where: {
          teacherProfileId_subjectId_regionId: {
            teacherProfileId,
            subjectId,
            regionId: nigeria.id,
          },
        },
        create: {
          teacherProfileId,
          subjectId,
          regionId: nigeria.id,
          hourlyRate: 500_000, // NGN 5,000
        },
        update: { hourlyRate: 500_000 },
      });
    }

    const existingOfferings = await db.classOffering.findMany({
      where: { teacherProfileId },
      select: { id: true },
    });
    if (existingOfferings.length === 0) {
      await db.classOffering.createMany({
        data: [
          {
            teacherProfileId,
            subjectId: math.id,
            title: "Algebra I — Monday morning",
            dayOfWeek: "MON",
            startMinutes: 8 * 60,
            endMinutes: 10 * 60,
            teacherCap: 10,
          },
          {
            teacherProfileId,
            subjectId: math.id,
            title: "Algebra I — Monday noon",
            dayOfWeek: "MON",
            startMinutes: 12 * 60,
            endMinutes: 14 * 60,
            teacherCap: 8,
          },
          {
            teacherProfileId,
            subjectId: physics.id,
            title: "Mechanics — Wednesday",
            dayOfWeek: "WED",
            startMinutes: 10 * 60 + 42,
            endMinutes: 12 * 60 + 42,
            teacherCap: 12,
          },
        ],
      });
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
