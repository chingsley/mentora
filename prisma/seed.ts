import { PrismaClient } from "@prisma/client";
import type { DayOfWeek, Region, Subject } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ---------------------------------------------------------------------------
// Seed configuration — adjust these constants to change the seed size.
// Invariants:
//   NUM_GUARDIANS * WARDS_PER_GUARDIAN <= NUM_STUDENTS
//   NUM_ASSIGNMENTS            <= NUM_STUDENTS
//   COURSES_PER_TEACHER        <= SUBJECT_POOL.length
// ---------------------------------------------------------------------------
const CONFIG = {
  NUM_TEACHERS: 10,
  COURSES_PER_TEACHER: 5,
  NUM_STUDENTS: 20,
  NUM_GUARDIANS: 10,
  WARDS_PER_GUARDIAN: 2,
  MIN_ENROLLMENTS_PER_STUDENT: 2,
  MAX_ENROLLMENTS_PER_STUDENT: 3,
  NUM_ASSIGNMENTS: 20,
  DEFAULT_PASSWORD: "Password123@",
  /** Seeded class & teacher rates in smallest currency units (e.g. CAD cents). */
  SEED_HOURLY_RATE_MINOR: 2000, // CAD 20.00 per hour
  TEACHER_CAP: 10,
} as const;

/** Portrait URLs for seeded teachers (`null` = initials only in UI). */
const TEACHER_SEED_PROFILE_IMAGES: Array<string | null> = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&h=256&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&auto=format",
  null,
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&auto=format",
  null,
  "https://images.unsplash.com/photo-1519085360759-af0119f7cbe7?w=256&h=256&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&auto=format",
  null,
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&fit=crop&auto=format",
];

function teacherSeedProfileImage(teacherIndex: number): string | null {
  return TEACHER_SEED_PROFILE_IMAGES[teacherIndex] ?? null;
}

interface WorkExperienceSeedRow {
  company: string;
  role: string;
  startYear: number;
  startMonth: number;
  endYear: number | null;
  endMonth: number | null;
}

const TEACHER_WORK_EXPERIENCE_SETS: ReadonlyArray<readonly WorkExperienceSeedRow[]> = [
  [
    { company: "Westbridge Academy", role: "Mathematics Teacher", startYear: 2014, startMonth: 9, endYear: 2017, endMonth: 6 },
    { company: "Horizon Learning Center", role: "Lead Tutor", startYear: 2017, startMonth: 8, endYear: 2020, endMonth: 7 },
    { company: "Summit Prep School", role: "Senior Instructor", startYear: 2020, startMonth: 9, endYear: 2023, endMonth: 5 },
    { company: "Mentora", role: "Online Educator", startYear: 2023, startMonth: 6, endYear: null, endMonth: null },
  ],
  [
    { company: "Lakeside Secondary School", role: "English Teacher", startYear: 2013, startMonth: 1, endYear: 2016, endMonth: 12 },
    { company: "Bright Minds Tutoring", role: "Curriculum Writer", startYear: 2017, startMonth: 3, endYear: 2019, endMonth: 8 },
    { company: "City College Prep", role: "Department Coordinator", startYear: 2019, startMonth: 9, endYear: 2022, endMonth: 6 },
    { company: "Mentora", role: "Independent Tutor", startYear: 2022, startMonth: 7, endYear: null, endMonth: null },
  ],
  [
    { company: "Northview High", role: "Physics Teacher", startYear: 2015, startMonth: 9, endYear: 2018, endMonth: 6 },
    { company: "STEM Futures Lab", role: "Instructional Coach", startYear: 2018, startMonth: 8, endYear: 2021, endMonth: 4 },
    { company: "Atlas Education Group", role: "Senior STEM Specialist", startYear: 2021, startMonth: 5, endYear: null, endMonth: null },
  ],
  [
    { company: "Riverside Academy", role: "Chemistry Teacher", startYear: 2012, startMonth: 9, endYear: 2015, endMonth: 6 },
    { company: "Nova Science Institute", role: "Lab Instructor", startYear: 2015, startMonth: 7, endYear: 2018, endMonth: 12 },
    { company: "Open Class Network", role: "Remote Educator", startYear: 2019, startMonth: 1, endYear: 2023, endMonth: 3 },
    { company: "Mentora", role: "Chemistry Tutor", startYear: 2023, startMonth: 4, endYear: null, endMonth: null },
  ],
  [
    { company: "CodeBridge Academy", role: "Programming Instructor", startYear: 2016, startMonth: 2, endYear: 2019, endMonth: 1 },
    { company: "TechStart Youth", role: "Mentor & Workshop Lead", startYear: 2019, startMonth: 2, endYear: 2022, endMonth: 5 },
    { company: "Mentora", role: "Computer Science Tutor", startYear: 2022, startMonth: 6, endYear: null, endMonth: null },
  ],
  [
    { company: "Harmony School of Music", role: "Music Teacher", startYear: 2011, startMonth: 9, endYear: 2014, endMonth: 6 },
    { company: "Community Arts Collective", role: "Ensemble Director", startYear: 2014, startMonth: 8, endYear: 2018, endMonth: 7 },
    { company: "PerformEd Studio", role: "Private Instructor", startYear: 2018, startMonth: 9, endYear: 2021, endMonth: 12 },
    { company: "Mentora", role: "Music Tutor", startYear: 2022, startMonth: 1, endYear: null, endMonth: null },
  ],
  [
    { company: "Oakwood High School", role: "Biology Teacher", startYear: 2013, startMonth: 9, endYear: 2016, endMonth: 6 },
    { company: "Greenfield Clinic Outreach", role: "Science Educator", startYear: 2016, startMonth: 7, endYear: 2019, endMonth: 8 },
    { company: "Mentora", role: "Biology Tutor", startYear: 2020, startMonth: 1, endYear: null, endMonth: null },
  ],
  [
    { company: "Heritage History Academy", role: "History Teacher", startYear: 2010, startMonth: 9, endYear: 2013, endMonth: 6 },
    { company: "Global Citizens Program", role: "Curriculum Designer", startYear: 2013, startMonth: 8, endYear: 2017, endMonth: 5 },
    { company: "Metro Evening College", role: "Adjunct Lecturer", startYear: 2017, startMonth: 9, endYear: 2022, endMonth: 4 },
    { company: "Mentora", role: "History Tutor", startYear: 2022, startMonth: 5, endYear: null, endMonth: null },
  ],
  [
    { company: "Capital Economics School", role: "Economics Teacher", startYear: 2014, startMonth: 1, endYear: 2017, endMonth: 12 },
    { company: "Future Finance Youth", role: "Workshop Facilitator", startYear: 2018, startMonth: 3, endYear: 2020, endMonth: 11 },
    { company: "Mentora", role: "Economics Tutor", startYear: 2021, startMonth: 1, endYear: null, endMonth: null },
  ],
  [
    { company: "Literary Arts High", role: "Literature Teacher", startYear: 2012, startMonth: 9, endYear: 2015, endMonth: 6 },
    { company: "Writers' Guild Education", role: "Reading Coach", startYear: 2015, startMonth: 7, endYear: 2019, endMonth: 6 },
    { company: "Page & Pen Academy", role: "Senior English Instructor", startYear: 2019, startMonth: 9, endYear: 2023, endMonth: 1 },
    { company: "Mentora", role: "Literature Tutor", startYear: 2023, startMonth: 2, endYear: null, endMonth: null },
  ],
];

function workExperienceMonthDate(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

function workExperienceSeedsForTeacher(teacherIndex: number): WorkExperienceSeedRow[] {
  const set =
    TEACHER_WORK_EXPERIENCE_SETS[teacherIndex % TEACHER_WORK_EXPERIENCE_SETS.length] ??
    TEACHER_WORK_EXPERIENCE_SETS[0]!;
  const count = 3 + (teacherIndex % 2);
  return [...set].slice(0, count);
}

async function seedTeacherWorkExperiences(teacherProfileId: string, teacherIndex: number): Promise<void> {
  await db.teacherWorkExperience.deleteMany({ where: { teacherProfileId } });
  const rows = workExperienceSeedsForTeacher(teacherIndex);
  await db.teacherWorkExperience.createMany({
    data: rows.map((row, sortOrder) => ({
      teacherProfileId,
      company: row.company,
      role: row.role,
      startDate: workExperienceMonthDate(row.startYear, row.startMonth),
      endDate:
        row.endYear != null && row.endMonth != null
          ? workExperienceMonthDate(row.endYear, row.endMonth)
          : null,
      sortOrder,
    })),
  });
}

function seedTeacherPublicProfileFields(
  teacherIndex: number,
  firstName: string,
  lastName: string,
) {
  if (teacherIndex === 0) {
    return {
      headline: "Creative educator crafting engaging learning experiences",
      bio:
        `Greetings, fellow learners! My name is ${firstName}, and I am a dedicated tutor with a passion for helping students build confidence and reach their goals. I bring structured lessons, clear feedback, and plenty of practice so every session feels purposeful.\n\nI have supported students across different levels and learning styles, and I adapt my approach to what works best for each person. Whether you are catching up, staying ahead, or preparing for an exam, I focus on steady progress you can feel week after week.`,
      spokenLanguages: "English, Spanish, Turkish",
      locationCountryCode: "GB",
      locationCity: "London",
      locationLabel: "United Kingdom",
    };
  }
  return {
    headline: `Experienced tutor — ${firstName} ${lastName}`,
    bio: `Hi, I'm ${firstName}. I've been teaching for several years and love helping students grow.`,
    spokenLanguages: "English",
    locationCountryCode: "CA",
    locationCity: "",
    locationLabel: "Canada",
  };
}

const DEMO_RULES = [
  "Arrive 5 minutes early with your notebook and a pen.",
  "Keep your microphone muted unless you're asking a question.",
  "No phones or unrelated tabs open during the session.",
  "Complete the homework sent after each class before the next meeting.",
].join("\n");

const DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const SUBJECT_POOL: Array<{ slug: string; name: string; }> = [
  { slug: "math", name: "Mathematics" },
  { slug: "english", name: "English" },
  { slug: "physics", name: "Physics" },
  { slug: "chemistry", name: "Chemistry" },
  { slug: "programming", name: "Programming" },
  { slug: "music", name: "Music" },
  { slug: "biology", name: "Biology" },
  { slug: "history", name: "History" },
  { slug: "economics", name: "Economics" },
  { slug: "literature", name: "Literature" },
];

const TEACHER_NAMES: ReadonlyArray<readonly [string, string]> = [
  ["Jane", "Okafor"],
  ["David", "Obi"],
  ["Amaka", "Chukwu"],
  ["Tomi", "Bello"],
  ["Chinedu", "Eze"],
  ["Yemisi", "Adewale"],
  ["Funke", "Akinwale"],
  ["Kola", "Ajayi"],
  ["Ngozi", "Onu"],
  ["Sola", "Olagoke"],
];

const STUDENT_NAMES: ReadonlyArray<readonly [string, string]> = [
  ["Adanna", "Eneja"],
  ["Chioma", "Okeke"],
  ["Ebuka", "Okafor"],
  ["Ifeoma", "Agbo"],
  ["Ikenna", "Eze"],
  ["Obinna", "Iwu"],
  ["Uche", "Nnamdi"],
  ["Zainab", "Bello"],
  ["Amina", "Yusuf"],
  ["Nneka", "Onu"],
  ["Kemi", "Lawal"],
  ["Tunde", "Bakare"],
  ["Emeka", "Umeh"],
  ["Sade", "Coker"],
  ["Bukola", "Ojo"],
  ["Chidi", "Ike"],
  ["Femi", "Olawale"],
  ["Halima", "Garba"],
  ["Rashida", "Ibrahim"],
  ["Tolu", "Ayoade"],
];

const GUARDIAN_NAMES: ReadonlyArray<readonly [string, string]> = [
  ["Mary", "Okoro"],
  ["Peter", "Adeleke"],
  ["Grace", "Okonkwo"],
  ["Samuel", "Achebe"],
  ["Ruth", "Balogun"],
  ["Daniel", "Ogu"],
  ["Esther", "Adebiyi"],
  ["Joseph", "Nwosu"],
  ["Hannah", "Nkem"],
  ["Emmanuel", "Abiodun"],
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickName(
  list: ReadonlyArray<readonly [string, string]>,
  i: number,
  fallbackPrefix: string,
): [string, string] {
  const entry = list[i];
  if (entry) return [entry[0], entry[1]];
  return [`${fallbackPrefix}${i + 1}`, "Test"];
}

/**
 * Deterministic, collision-free time slot for a given (teacher, course) pair.
 * Spreads each teacher's courses across different days and hours of the week.
 */
function slotFor(
  teacherIdx: number,
  courseIdx: number,
): { day: DayOfWeek; startMinutes: number; endMinutes: number; } {
  const day = DAYS[(teacherIdx + courseIdx * 2) % DAYS.length] ?? "MON";
  const startHour = 8 + (courseIdx % 5) * 2; // 8, 10, 12, 14, 16
  return {
    day,
    startMinutes: startHour * 60,
    endMinutes: (startHour + 2) * 60,
  };
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Seed steps
// ---------------------------------------------------------------------------

async function seedPolicy(): Promise<void> {
  await db.platformPolicy.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
}

async function seedRegions(): Promise<Region[]> {
  const regionData: Array<{ code: string; name: string; currency: string; minRate: number; }> = [
    { code: "CA", name: "Canada", currency: "CAD", minRate: 1800 }, // $18/hr floor
    { code: "US", name: "United States", currency: "USD", minRate: 2000 }, // $20/hr floor
    { code: "EU", name: "Europe", currency: "EUR", minRate: 1800 }, // €18/hr floor
    { code: "NG", name: "Nigeria", currency: "NGN", minRate: 500_000 }, // ₦5,000/hr floor
  ];

  const regions: Region[] = [];
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
    regions.push(region);
  }
  return regions;
}

async function seedSubjects(): Promise<Subject[]> {
  const subjects: Subject[] = [];
  for (const s of SUBJECT_POOL) {
    const subject = await db.subject.upsert({
      where: { slug: s.slug },
      create: s,
      update: { name: s.name },
    });
    subjects.push(subject);
  }
  return subjects;
}

async function seedAdmin(primaryRegion: Region): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@mentora.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? CONFIG.DEFAULT_PASSWORD;
  await db.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Mentora Admin",
      firstName: "Mentora",
      lastName: "Admin",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
      regionId: primaryRegion.id,
    },
    update: {},
  });
}

interface SeededTeacher {
  userId: string;
  teacherProfileId: string;
  email: string;
  name: string;
  subjects: Subject[]; // subjects this teacher offers courses in (order = course order)
  offeringIds: string[]; // order matches subjects
}

async function seedTeachers(primaryRegion: Region, subjects: Subject[]): Promise<SeededTeacher[]> {
  if (CONFIG.COURSES_PER_TEACHER > subjects.length) {
    throw new Error(
      `COURSES_PER_TEACHER (${CONFIG.COURSES_PER_TEACHER}) exceeds available subjects (${subjects.length}).`,
    );
  }

  const passwordHash = await bcrypt.hash(CONFIG.DEFAULT_PASSWORD, 10);
  const result: SeededTeacher[] = [];

  for (let i = 0; i < CONFIG.NUM_TEACHERS; i += 1) {
    const [firstName, lastName] = pickName(TEACHER_NAMES, i, "Teacher");
    const email = `user${i + 1}@teacher.com`;
    // Stable displayId that won't clash with runtime-generated IDs (uses date 2000-01-01).
    const displayId = `T-000101-${String(Math.floor(i / 26) + 1).padStart(2, "0")}${String.fromCharCode(65 + (i % 26))}`;
    const teacherName = `${firstName} ${lastName}`;
    const image = teacherSeedProfileImage(i);
    const publicProfile = seedTeacherPublicProfileFields(i, firstName, lastName);

    const user = await db.user.upsert({
      where: { email },
      create: {
        email,
        name: teacherName,
        firstName,
        lastName,
        image,
        passwordHash,
        role: "TEACHER",
        regionId: primaryRegion.id,
        teacherProfile: {
          create: {
            displayId,
            headline: publicProfile.headline,
            bio: publicProfile.bio,
            timeZone: "America/Toronto",
            spokenLanguages: publicProfile.spokenLanguages,
            locationCountryCode: publicProfile.locationCountryCode,
            locationCity: publicProfile.locationCity,
            locationLabel: publicProfile.locationLabel,
            avgRating: 4 + ((i % 10) / 10),
            ratingsCount: 5 + i,
            profileCompleted: true,
          },
        },
      },
      update: { name: teacherName, firstName, lastName, image },
      include: { teacherProfile: true },
    });

    const teacherProfile = user.teacherProfile;
    if (!teacherProfile) {
      throw new Error(`Teacher profile missing for ${email}`);
    }

    await db.teacherProfile.update({
      where: { id: teacherProfile.id },
      data: {
        headline: publicProfile.headline,
        bio: publicProfile.bio,
        spokenLanguages: publicProfile.spokenLanguages,
        locationCountryCode: publicProfile.locationCountryCode,
        locationCity: publicProfile.locationCity,
        locationLabel: publicProfile.locationLabel,
      },
    });

    await seedTeacherWorkExperiences(teacherProfile.id, i);

    // Pick COURSES_PER_TEACHER subjects, rotated per teacher so subjects overlap naturally.
    const teacherSubjects: Subject[] = [];
    for (let j = 0; j < CONFIG.COURSES_PER_TEACHER; j += 1) {
      const subj = subjects[(i + j) % subjects.length];
      if (subj) teacherSubjects.push(subj);
    }

    // Register each distinct subject as a TeacherSubject + TeacherRate.
    const seenSubjectIds = new Set<string>();
    for (const subj of teacherSubjects) {
      if (seenSubjectIds.has(subj.id)) continue;
      seenSubjectIds.add(subj.id);
      await db.teacherSubject.upsert({
        where: {
          teacherProfileId_subjectId: {
            teacherProfileId: teacherProfile.id,
            subjectId: subj.id,
          },
        },
        create: {
          teacherProfileId: teacherProfile.id,
          subjectId: subj.id,
          defaultCap: CONFIG.TEACHER_CAP,
          courseDescription: `Structured ${subj.name} lessons with clear goals, practice, and feedback for every student.`,
          gradeLevel: "Mixed levels",
        },
        update: {
          courseDescription: `Structured ${subj.name} lessons with clear goals, practice, and feedback for every student.`,
          gradeLevel: "Mixed levels",
        },
      });
      await db.teacherRate.upsert({
        where: {
          teacherProfileId_subjectId_regionId: {
            teacherProfileId: teacherProfile.id,
            subjectId: subj.id,
            regionId: primaryRegion.id,
          },
        },
        create: {
          teacherProfileId: teacherProfile.id,
          subjectId: subj.id,
          regionId: primaryRegion.id,
          hourlyRate: CONFIG.SEED_HOURLY_RATE_MINOR,
        },
        update: { hourlyRate: CONFIG.SEED_HOURLY_RATE_MINOR },
      });
    }

    // Create one class offering per course slot.
    const offeringIds: string[] = [];
    for (let j = 0; j < teacherSubjects.length; j += 1) {
      const subj = teacherSubjects[j]!;
      const slot = slotFor(i, j);
      const title = `${subj.name} — ${slot.day} ${minutesToTime(slot.startMinutes)}`;

      let offering = await db.classOffering.findFirst({
        where: { teacherProfileId: teacherProfile.id, title },
        select: { id: true },
      });
      if (!offering) {
        offering = await db.classOffering.create({
          data: {
            teacherProfileId: teacherProfile.id,
            subjectId: subj.id,
            title,
            dayOfWeek: slot.day,
            startMinutes: slot.startMinutes,
            endMinutes: slot.endMinutes,
            teacherCap: CONFIG.TEACHER_CAP,
            hourlyRate: CONFIG.SEED_HOURLY_RATE_MINOR,
            rules: DEMO_RULES,
          },
          select: { id: true },
        });
      } else {
        await db.classOffering.update({
          where: { id: offering.id },
          data: { hourlyRate: CONFIG.SEED_HOURLY_RATE_MINOR },
        });
      }
      offeringIds.push(offering.id);
    }

    result.push({
      userId: user.id,
      teacherProfileId: teacherProfile.id,
      email,
      name: teacherName,
      subjects: teacherSubjects,
      offeringIds,
    });
  }

  return result;
}

interface SeededStudent {
  userId: string;
  studentProfileId: string;
  email: string;
  name: string;
}

async function seedStudents(primaryRegion: Region): Promise<SeededStudent[]> {
  const passwordHash = await bcrypt.hash(CONFIG.DEFAULT_PASSWORD, 10);
  const result: SeededStudent[] = [];

  for (let i = 0; i < CONFIG.NUM_STUDENTS; i += 1) {
    const [firstName, lastName] = pickName(STUDENT_NAMES, i, "Student");
    const email = `user${i + 1}@student.com`;

    const user = await db.user.upsert({
      where: { email },
      create: {
        email,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        passwordHash,
        role: "STUDENT",
        regionId: primaryRegion.id,
        studentProfile: { create: {} },
      },
      update: {},
      include: { studentProfile: true },
    });

    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new Error(`Student profile missing for ${email}`);
    }

    result.push({
      userId: user.id,
      studentProfileId: studentProfile.id,
      email,
      name: `${firstName} ${lastName}`,
    });
  }

  return result;
}

async function seedGuardians(primaryRegion: Region, students: SeededStudent[]): Promise<void> {
  if (CONFIG.NUM_GUARDIANS * CONFIG.WARDS_PER_GUARDIAN > students.length) {
    throw new Error(
      `NUM_GUARDIANS * WARDS_PER_GUARDIAN (${CONFIG.NUM_GUARDIANS * CONFIG.WARDS_PER_GUARDIAN}) exceeds NUM_STUDENTS (${students.length}).`,
    );
  }

  const passwordHash = await bcrypt.hash(CONFIG.DEFAULT_PASSWORD, 10);

  for (let i = 0; i < CONFIG.NUM_GUARDIANS; i += 1) {
    const [firstName, lastName] = pickName(GUARDIAN_NAMES, i, "Guardian");
    const email = `user${i + 1}@guardian.com`;

    const user = await db.user.upsert({
      where: { email },
      create: {
        email,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        passwordHash,
        role: "GUARDIAN",
        regionId: primaryRegion.id,
        guardianProfile: { create: {} },
      },
      update: {},
      include: { guardianProfile: true },
    });

    const guardianProfile = user.guardianProfile;
    if (!guardianProfile) {
      throw new Error(`Guardian profile missing for ${email}`);
    }

    // Assign a contiguous, non-overlapping block of students to each guardian.
    for (let w = 0; w < CONFIG.WARDS_PER_GUARDIAN; w += 1) {
      const student = students[i * CONFIG.WARDS_PER_GUARDIAN + w];
      if (!student) break;
      await db.guardianLink.upsert({
        where: {
          studentProfileId_guardianEmail: {
            studentProfileId: student.studentProfileId,
            guardianEmail: email,
          },
        },
        create: {
          studentProfileId: student.studentProfileId,
          guardianProfileId: guardianProfile.id,
          guardianEmail: email,
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
        update: {
          guardianProfileId: guardianProfile.id,
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });
    }
  }
}

interface StudentEnrollment {
  studentProfileId: string;
  offeringId: string;
  teacherProfileId: string;
  subjectId: string;
  enrollmentId: string;
}

async function seedEnrollments(
  teachers: SeededTeacher[],
  students: SeededStudent[],
): Promise<Map<string, StudentEnrollment[]>> {
  const range =
    CONFIG.MAX_ENROLLMENTS_PER_STUDENT - CONFIG.MIN_ENROLLMENTS_PER_STUDENT + 1;
  const enrollmentsByStudent = new Map<string, StudentEnrollment[]>();

  for (let s = 0; s < students.length; s += 1) {
    const student = students[s]!;
    const count = CONFIG.MIN_ENROLLMENTS_PER_STUDENT + (s % Math.max(range, 1));
    const picked: StudentEnrollment[] = [];
    const usedOfferings = new Set<string>();

    // Pick `count` offerings from across different teachers where possible.
    for (let k = 0; k < count; k += 1) {
      const teacherIdx = (s + k * 3) % teachers.length;
      const teacher = teachers[teacherIdx]!;
      const courseIdx = (s + k) % teacher.offeringIds.length;
      const offeringId = teacher.offeringIds[courseIdx]!;
      if (usedOfferings.has(offeringId)) continue;
      usedOfferings.add(offeringId);

      const enrollment = await db.enrollment.upsert({
        where: {
          studentProfileId_offeringId: {
            studentProfileId: student.studentProfileId,
            offeringId,
          },
        },
        create: {
          studentProfileId: student.studentProfileId,
          offeringId,
          status: "ACTIVE",
        },
        update: { status: "ACTIVE" },
        select: { id: true, offering: { select: { subjectId: true, teacherProfileId: true } } },
      });

      // Record a matching interest so the student's profile reflects the enrolment.
      await db.studentInterest.upsert({
        where: {
          studentProfileId_subjectId: {
            studentProfileId: student.studentProfileId,
            subjectId: enrollment.offering.subjectId,
          },
        },
        create: {
          studentProfileId: student.studentProfileId,
          subjectId: enrollment.offering.subjectId,
        },
        update: {},
      });

      picked.push({
        studentProfileId: student.studentProfileId,
        offeringId,
        teacherProfileId: enrollment.offering.teacherProfileId,
        subjectId: enrollment.offering.subjectId,
        enrollmentId: enrollment.id,
      });
    }

    enrollmentsByStudent.set(student.studentProfileId, picked);
  }

  return enrollmentsByStudent;
}

async function seedAssignments(
  teachers: SeededTeacher[],
  students: SeededStudent[],
  enrollmentsByStudent: Map<string, StudentEnrollment[]>,
): Promise<void> {
  const teacherUserByProfileId = new Map(teachers.map((t) => [t.teacherProfileId, t.userId]));
  const dueDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3); // 3 days ago (already past)
  const gradedAt = new Date();
  const count = Math.min(CONFIG.NUM_ASSIGNMENTS, students.length);

  for (let i = 0; i < count; i += 1) {
    const student = students[i]!;
    const enrollments = enrollmentsByStudent.get(student.studentProfileId) ?? [];
    const enrollment = enrollments[0];
    if (!enrollment) continue;

    const title = `Practice Set ${i + 1}`;
    const graderUserId = teacherUserByProfileId.get(enrollment.teacherProfileId) ?? null;

    let assignment = await db.assignment.findFirst({
      where: { offeringId: enrollment.offeringId, title },
      select: { id: true },
    });
    if (!assignment) {
      assignment = await db.assignment.create({
        data: {
          offeringId: enrollment.offeringId,
          teacherProfileId: enrollment.teacherProfileId,
          title,
          description:
            "Complete the attached worksheet and submit before the due date. Show all working.",
          dueAt: dueDate,
        },
        select: { id: true },
      });
    }

    const grade = 60 + ((i * 7) % 36); // 60..95 deterministic
    await db.assignmentSubmission.upsert({
      where: {
        assignmentId_studentProfileId: {
          assignmentId: assignment.id,
          studentProfileId: student.studentProfileId,
        },
      },
      create: {
        assignmentId: assignment.id,
        studentProfileId: student.studentProfileId,
        filePath: `seed/submissions/${assignment.id}/${student.studentProfileId}.pdf`,
        fileMime: "application/pdf",
        fileSize: 1024,
        grade,
        feedback:
          grade >= 85
            ? "Excellent work — keep it up!"
            : grade >= 70
              ? "Solid effort. Review the marked questions for a stronger finish."
              : "Please revisit the core concepts and resubmit once you've practiced more.",
        gradedAt,
        gradedByUserId: graderUserId,
      },
      update: {
        grade,
        gradedAt,
        gradedByUserId: graderUserId,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Removable demo: teacher5 "test meeting" past session with 10 students
// Delete this block (and the call in main) when no longer needed.
// ---------------------------------------------------------------------------

const TEACHER5_PAST_CLASS_DEMO = {
  teacherEmail: "user5@teacher.com",
  offeringTitle: "test meeting",
  dayOfWeek: "WED" as DayOfWeek,
  startMinutes: 7 * 60 + 30,
  endMinutes: 11 * 60 + 30,
  /** Calendar date for the past occurrence (local date). */
  sessionCalendarDate: "2026-06-03",
  studentEmails: Array.from(
    { length: 10 },
    (_, i) => `user${i + 1}@student.com`,
  ),
} as const;

function demoSessionDate(calendarDateIso: string, startMinutes: number): Date {
  const d = new Date(`${calendarDateIso}T00:00:00`);
  d.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
  d.setSeconds(0, 0);
  return d;
}

async function seedTeacher5PastClassAttendanceDemo(): Promise<void> {
  const cfg = TEACHER5_PAST_CLASS_DEMO;
  const sessionDate = demoSessionDate(cfg.sessionCalendarDate, cfg.startMinutes);

  const teacher = await db.user.findUnique({
    where: { email: cfg.teacherEmail },
    include: {
      teacherProfile: {
        include: { subjects: { take: 1, select: { subjectId: true } } },
      },
    },
  });
  if (!teacher?.teacherProfile) {
    console.warn(`[demo] Skip: ${cfg.teacherEmail} not found`);
    return;
  }

  const subjectId = teacher.teacherProfile.subjects[0]?.subjectId;
  if (!subjectId) {
    console.warn("[demo] Skip: teacher5 has no subjects");
    return;
  }

  let offering = await db.classOffering.findFirst({
    where: {
      teacherProfileId: teacher.teacherProfile.id,
      title: cfg.offeringTitle,
    },
  });

  if (!offering) {
    offering = await db.classOffering.create({
      data: {
        teacherProfileId: teacher.teacherProfile.id,
        subjectId,
        title: cfg.offeringTitle,
        dayOfWeek: cfg.dayOfWeek,
        startMinutes: cfg.startMinutes,
        endMinutes: cfg.endMinutes,
        teacherCap: CONFIG.TEACHER_CAP,
        hourlyRate: CONFIG.SEED_HOURLY_RATE_MINOR,
        periodType: "OPEN",
        rules: DEMO_RULES,
      },
    });
  } else {
    offering = await db.classOffering.update({
      where: { id: offering.id },
      data: {
        dayOfWeek: cfg.dayOfWeek,
        startMinutes: cfg.startMinutes,
        endMinutes: cfg.endMinutes,
        teacherCap: CONFIG.TEACHER_CAP,
        hourlyRate: CONFIG.SEED_HOURLY_RATE_MINOR,
        periodType: "OPEN",
        active: true,
      },
    });
  }

  const students = await db.user.findMany({
    where: { email: { in: [...cfg.studentEmails] }, role: "STUDENT" },
    include: { studentProfile: true },
    orderBy: { email: "asc" },
  });

  const targetProfileIds = students
    .map((s) => s.studentProfile?.id)
    .filter((id): id is string => Boolean(id));

  if (targetProfileIds.length === 0) {
    console.warn("[demo] Skip: no target students found");
    return;
  }

  await db.enrollment.updateMany({
    where: {
      offeringId: offering.id,
      studentProfileId: { notIn: targetProfileIds },
    },
    data: { status: "DROPPED" },
  });

  const enrollments: Array<{ id: string; studentProfileId: string; }> = [];
  for (const email of cfg.studentEmails) {
    const student = students.find((s) => s.email === email);
    const profileId = student?.studentProfile?.id;
    if (!profileId) continue;

    const enrollment = await db.enrollment.upsert({
      where: {
        studentProfileId_offeringId: {
          studentProfileId: profileId,
          offeringId: offering.id,
        },
      },
      create: {
        studentProfileId: profileId,
        offeringId: offering.id,
        status: "ACTIVE",
      },
      update: { status: "ACTIVE" },
      select: { id: true, studentProfileId: true },
    });
    enrollments.push(enrollment);

    await db.studentInterest.upsert({
      where: {
        studentProfileId_subjectId: {
          studentProfileId: profileId,
          subjectId,
        },
      },
      create: { studentProfileId: profileId, subjectId },
      update: {},
    });
  }

  await db.sessionOccurrence.upsert({
    where: {
      offeringId_sessionDate: {
        offeringId: offering.id,
        sessionDate,
      },
    },
    create: {
      offeringId: offering.id,
      sessionDate,
      outcome: "HELD",
    },
    update: { outcome: "HELD" },
  });

  await db.attendance.deleteMany({
    where: {
      sessionDate,
      enrollment: { offeringId: offering.id },
    },
  });

  const demoStatuses: Array<{
    status: "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
    source: "AUTO_JOIN" | "TEACHER";
    joined: boolean;
  }> = [
      { status: "PRESENT", source: "AUTO_JOIN", joined: true },
      { status: "LATE", source: "AUTO_JOIN", joined: true },
      { status: "PRESENT", source: "AUTO_JOIN", joined: true },
      { status: "ABSENT", source: "AUTO_JOIN", joined: false },
      { status: "EXCUSED", source: "TEACHER", joined: false },
      { status: "PRESENT", source: "AUTO_JOIN", joined: true },
      { status: "ABSENT", source: "AUTO_JOIN", joined: false },
      { status: "LATE", source: "AUTO_JOIN", joined: true },
      { status: "EXCUSED", source: "TEACHER", joined: false },
      { status: "PRESENT", source: "AUTO_JOIN", joined: true },
    ];

  for (let i = 0; i < enrollments.length; i += 1) {
    const enrollment = enrollments[i]!;
    const spec = demoStatuses[i] ?? { status: "ABSENT", source: "AUTO_JOIN", joined: false };
    const joinedAt = spec.joined
      ? new Date(sessionDate.getTime() + (i + 1) * 60_000)
      : null;

    await db.attendance.create({
      data: {
        enrollmentId: enrollment.id,
        sessionDate,
        status: spec.status,
        source: spec.source,
        joinedAt,
        teacherNote: spec.source === "TEACHER" ? "Seed demo attendance" : null,
      },
    });
  }

  console.log(
    `[demo] ${cfg.offeringTitle}: ${enrollments.length} enrolled, past session ${cfg.sessionCalendarDate} ${minutesToTime(cfg.startMinutes)}–${minutesToTime(cfg.endMinutes)}`,
  );
}

// ---------------------------------------------------------------------------
// teacher1 dashboard chart demo — past sessions + attendance for Weekly trends
// ---------------------------------------------------------------------------

const DAY_OFFSET: Record<DayOfWeek, number> = {
  MON: 0,
  TUE: 1,
  WED: 2,
  THU: 3,
  FRI: 4,
  SAT: 5,
  SUN: 6,
};

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function sessionDateOnWeek(
  weekStartMonday: Date,
  dayOfWeek: DayOfWeek,
  startMinutes: number,
): Date {
  const d = new Date(weekStartMonday);
  d.setDate(d.getDate() + DAY_OFFSET[dayOfWeek]);
  d.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
  d.setSeconds(0, 0);
  return d;
}

const TEACHER1_CHART_DEMO = {
  teacherEmail: "user1@teacher.com",
  /** Indices into teacher1's seeded offerings (MON/TUE/WED/THU/FRI spread). */
  offeringIndices: [0, 1, 2, 3, 4],
  studentEmails: Array.from({ length: 8 }, (_, i) => `user${i + 1}@student.com`),
  /** Held sessions per offering per week (index 0 = oldest of past 8 weeks). */
  sessionsPerOfferingByWeek: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
  ],
  /** Target attendance rate (0–100) per week for marked student-sessions. */
  attendanceRateByWeek: [0, 0, 0, 45, 58, 68, 79, 86],
} as const;

function attendanceStatusForRate(
  weekIdx: number,
  studentIdx: number,
  rates: readonly number[],
): "PRESENT" | "LATE" | "ABSENT" {
  const rate = rates[weekIdx] ?? 0;
  if (rate <= 0) return "ABSENT";
  const slot = (studentIdx * 17 + weekIdx * 11) % 100;
  if (slot < rate - 8) return "PRESENT";
  if (slot < rate) return "LATE";
  return "ABSENT";
}

async function seedTeacher1DashboardChartDemo(): Promise<void> {
  const cfg = TEACHER1_CHART_DEMO;
  const now = new Date();
  const anchor = startOfWeekMonday(now);
  const enrolledAt = new Date(anchor);
  enrolledAt.setDate(enrolledAt.getDate() - 70);

  const teacher = await db.user.findUnique({
    where: { email: cfg.teacherEmail },
    include: {
      teacherProfile: {
        include: {
          offerings: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              dayOfWeek: true,
              startMinutes: true,
              endMinutes: true,
              subjectId: true,
            },
          },
        },
      },
    },
  });

  if (!teacher?.teacherProfile) {
    console.warn(`[chart-demo] Skip: ${cfg.teacherEmail} not found`);
    return;
  }

  const offerings = cfg.offeringIndices
    .map((idx) => teacher.teacherProfile!.offerings[idx])
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  if (offerings.length === 0) {
    console.warn("[chart-demo] Skip: teacher1 has no offerings");
    return;
  }

  const students = await db.user.findMany({
    where: { email: { in: [...cfg.studentEmails] }, role: "STUDENT" },
    include: { studentProfile: true },
    orderBy: { email: "asc" },
  });

  const enrollments: Array<{ id: string; studentProfileId: string; offeringId: string; }> = [];
  for (const email of cfg.studentEmails) {
    const student = students.find((s) => s.email === email);
    const profileId = student?.studentProfile?.id;
    if (!profileId) continue;

    for (const offering of offerings) {
      const enrollment = await db.enrollment.upsert({
        where: {
          studentProfileId_offeringId: {
            studentProfileId: profileId,
            offeringId: offering.id,
          },
        },
        create: {
          studentProfileId: profileId,
          offeringId: offering.id,
          status: "ACTIVE",
          enrolledAt,
        },
        update: { status: "ACTIVE", enrolledAt },
        select: { id: true, studentProfileId: true },
      });
      enrollments.push({ ...enrollment, offeringId: offering.id });

      await db.studentInterest.upsert({
        where: {
          studentProfileId_subjectId: {
            studentProfileId: profileId,
            subjectId: offering.subjectId,
          },
        },
        create: { studentProfileId: profileId, subjectId: offering.subjectId },
        update: {},
      });
    }
  }

  let sessionCount = 0;
  let attendanceCount = 0;

  for (let weekIdx = 0; weekIdx < cfg.sessionsPerOfferingByWeek.length; weekIdx += 1) {
    const weekStart = new Date(anchor);
    weekStart.setDate(anchor.getDate() - (cfg.sessionsPerOfferingByWeek.length - 1 - weekIdx) * 7);
    const weekPlan = cfg.sessionsPerOfferingByWeek[weekIdx]!;

    for (let offeringIdx = 0; offeringIdx < offerings.length; offeringIdx += 1) {
      if ((weekPlan[offeringIdx] ?? 0) < 1) continue;

      const offering = offerings[offeringIdx]!;
      const sessionDate = sessionDateOnWeek(
        weekStart,
        offering.dayOfWeek,
        offering.startMinutes,
      );
      const sessionEnd = sessionDateOnWeek(
        weekStart,
        offering.dayOfWeek,
        offering.endMinutes,
      );
      if (sessionEnd.getTime() >= now.getTime()) continue;

      await db.sessionOccurrence.upsert({
        where: {
          offeringId_sessionDate: {
            offeringId: offering.id,
            sessionDate,
          },
        },
        create: {
          offeringId: offering.id,
          sessionDate,
          outcome: "HELD",
        },
        update: { outcome: "HELD" },
      });
      sessionCount += 1;

      await db.attendance.deleteMany({
        where: {
          sessionDate,
          enrollment: { offeringId: offering.id },
        },
      });

      const offeringEnrollments = enrollments.filter((e) => e.offeringId === offering.id);

      for (let studentIdx = 0; studentIdx < offeringEnrollments.length; studentIdx += 1) {
        const enrollment = offeringEnrollments[studentIdx]!;
        const status = attendanceStatusForRate(
          weekIdx,
          studentIdx,
          cfg.attendanceRateByWeek,
        );
        const joined = status === "PRESENT" || status === "LATE";

        await db.attendance.create({
          data: {
            enrollmentId: enrollment.id,
            sessionDate,
            status,
            source: "AUTO_JOIN",
            joinedAt: joined
              ? new Date(sessionDate.getTime() + (studentIdx + 1) * 60_000)
              : null,
          },
        });
        attendanceCount += 1;
      }
    }
  }

  console.log(
    `[chart-demo] teacher1: ${sessionCount} held sessions, ${attendanceCount} attendance rows across ${offerings.length} courses`,
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("Seeding platform policy...");
  await seedPolicy();

  console.log("Seeding regions...");
  const regions = await seedRegions();
  const ca = regions.find((r) => r.code === "CA");
  if (!ca) throw new Error("Canada region missing after seedRegions");

  console.log("Seeding subjects...");
  const subjects = await seedSubjects();

  console.log("Seeding admin user...");
  await seedAdmin(ca);

  console.log(`Seeding ${CONFIG.NUM_TEACHERS} teachers × ${CONFIG.COURSES_PER_TEACHER} courses...`);
  const teachers = await seedTeachers(ca, subjects);

  console.log(`Seeding ${CONFIG.NUM_STUDENTS} students...`);
  const students = await seedStudents(ca);

  console.log(
    `Seeding ${CONFIG.NUM_GUARDIANS} guardians × ${CONFIG.WARDS_PER_GUARDIAN} wards each...`,
  );
  await seedGuardians(ca, students);

  console.log(
    `Seeding enrollments (${CONFIG.MIN_ENROLLMENTS_PER_STUDENT}-${CONFIG.MAX_ENROLLMENTS_PER_STUDENT} per student)...`,
  );
  const enrollmentsByStudent = await seedEnrollments(teachers, students);

  console.log(`Seeding ${CONFIG.NUM_ASSIGNMENTS} assignments (one per student) + grades...`);
  await seedAssignments(teachers, students, enrollmentsByStudent);

  console.log("Seeding teacher5 past class attendance demo...");
  await seedTeacher5PastClassAttendanceDemo();

  console.log("Seeding teacher1 dashboard chart demo...");
  await seedTeacher1DashboardChartDemo();

  console.log("Seed complete.");
  console.log(
    `  Login with: admin@mentora.local, user1..${CONFIG.NUM_TEACHERS}@teacher.com, user1..${CONFIG.NUM_STUDENTS}@student.com, user1..${CONFIG.NUM_GUARDIANS}@guardian.com`,
  );
  console.log(`  Default password: ${CONFIG.DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
