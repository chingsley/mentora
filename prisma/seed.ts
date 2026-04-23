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
  DEFAULT_PASSWORD: "ChangeMe123!",
  HOURLY_RATE_KOBO: 500_000, // NGN 5,000 per hour (smallest unit)
  TEACHER_CAP: 10,
} as const;

const DEMO_RULES = [
  "Arrive 5 minutes early with your notebook and a pen.",
  "Keep your microphone muted unless you're asking a question.",
  "No phones or unrelated tabs open during the session.",
  "Complete the homework sent after each class before the next meeting.",
].join("\n");

const DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const SUBJECT_POOL: Array<{ slug: string; name: string }> = [
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
  ["Ada", "Nwankwo"],
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
): { day: DayOfWeek; startMinutes: number; endMinutes: number } {
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
  const regionData: Array<{ code: string; name: string; currency: string; minRate: number }> = [
    { code: "NG", name: "Nigeria", currency: "NGN", minRate: 350_000 },
    { code: "US", name: "United States", currency: "USD", minRate: 1500 },
    { code: "EU", name: "Europe", currency: "EUR", minRate: 1500 },
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

async function seedAdmin(ng: Region): Promise<void> {
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
      regionId: ng.id,
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

async function seedTeachers(ng: Region, subjects: Subject[]): Promise<SeededTeacher[]> {
  if (CONFIG.COURSES_PER_TEACHER > subjects.length) {
    throw new Error(
      `COURSES_PER_TEACHER (${CONFIG.COURSES_PER_TEACHER}) exceeds available subjects (${subjects.length}).`,
    );
  }

  const passwordHash = await bcrypt.hash(CONFIG.DEFAULT_PASSWORD, 10);
  const result: SeededTeacher[] = [];

  for (let i = 0; i < CONFIG.NUM_TEACHERS; i += 1) {
    const [firstName, lastName] = pickName(TEACHER_NAMES, i, "Teacher");
    const email = `teacher${i + 1}@mentora.local`;
    // Stable displayId that won't clash with runtime-generated IDs (uses date 2000-01-01).
    const displayId = `T-000101-${String(Math.floor(i / 26) + 1).padStart(2, "0")}${String.fromCharCode(65 + (i % 26))}`;

    const user = await db.user.upsert({
      where: { email },
      create: {
        email,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        passwordHash,
        role: "TEACHER",
        regionId: ng.id,
        teacherProfile: {
          create: {
            displayId,
            headline: `Experienced tutor — ${firstName} ${lastName}`,
            bio: `Hi, I'm ${firstName}. I've been teaching for several years and love helping students grow.`,
            avgRating: 4 + ((i % 10) / 10),
            ratingsCount: 5 + i,
            profileCompleted: true,
          },
        },
      },
      update: {},
      include: { teacherProfile: true },
    });

    const teacherProfile = user.teacherProfile;
    if (!teacherProfile) {
      throw new Error(`Teacher profile missing for ${email}`);
    }

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
        create: { teacherProfileId: teacherProfile.id, subjectId: subj.id },
        update: {},
      });
      await db.teacherRate.upsert({
        where: {
          teacherProfileId_subjectId_regionId: {
            teacherProfileId: teacherProfile.id,
            subjectId: subj.id,
            regionId: ng.id,
          },
        },
        create: {
          teacherProfileId: teacherProfile.id,
          subjectId: subj.id,
          regionId: ng.id,
          hourlyRate: CONFIG.HOURLY_RATE_KOBO,
        },
        update: { hourlyRate: CONFIG.HOURLY_RATE_KOBO },
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
            rules: DEMO_RULES,
          },
          select: { id: true },
        });
      }
      offeringIds.push(offering.id);
    }

    result.push({
      userId: user.id,
      teacherProfileId: teacherProfile.id,
      email,
      name: `${firstName} ${lastName}`,
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

async function seedStudents(ng: Region): Promise<SeededStudent[]> {
  const passwordHash = await bcrypt.hash(CONFIG.DEFAULT_PASSWORD, 10);
  const result: SeededStudent[] = [];

  for (let i = 0; i < CONFIG.NUM_STUDENTS; i += 1) {
    const [firstName, lastName] = pickName(STUDENT_NAMES, i, "Student");
    const email = `student${i + 1}@mentora.local`;

    const user = await db.user.upsert({
      where: { email },
      create: {
        email,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        passwordHash,
        role: "STUDENT",
        regionId: ng.id,
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

async function seedGuardians(ng: Region, students: SeededStudent[]): Promise<void> {
  if (CONFIG.NUM_GUARDIANS * CONFIG.WARDS_PER_GUARDIAN > students.length) {
    throw new Error(
      `NUM_GUARDIANS * WARDS_PER_GUARDIAN (${CONFIG.NUM_GUARDIANS * CONFIG.WARDS_PER_GUARDIAN}) exceeds NUM_STUDENTS (${students.length}).`,
    );
  }

  const passwordHash = await bcrypt.hash(CONFIG.DEFAULT_PASSWORD, 10);

  for (let i = 0; i < CONFIG.NUM_GUARDIANS; i += 1) {
    const [firstName, lastName] = pickName(GUARDIAN_NAMES, i, "Guardian");
    const email = `guardian${i + 1}@mentora.local`;

    const user = await db.user.upsert({
      where: { email },
      create: {
        email,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        passwordHash,
        role: "GUARDIAN",
        regionId: ng.id,
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
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("Seeding platform policy...");
  await seedPolicy();

  console.log("Seeding regions...");
  const regions = await seedRegions();
  const ng = regions.find((r) => r.code === "NG");
  if (!ng) throw new Error("Nigeria region missing after seedRegions");

  console.log("Seeding subjects...");
  const subjects = await seedSubjects();

  console.log("Seeding admin user...");
  await seedAdmin(ng);

  console.log(`Seeding ${CONFIG.NUM_TEACHERS} teachers × ${CONFIG.COURSES_PER_TEACHER} courses...`);
  const teachers = await seedTeachers(ng, subjects);

  console.log(`Seeding ${CONFIG.NUM_STUDENTS} students...`);
  const students = await seedStudents(ng);

  console.log(
    `Seeding ${CONFIG.NUM_GUARDIANS} guardians × ${CONFIG.WARDS_PER_GUARDIAN} wards each...`,
  );
  await seedGuardians(ng, students);

  console.log(
    `Seeding enrollments (${CONFIG.MIN_ENROLLMENTS_PER_STUDENT}-${CONFIG.MAX_ENROLLMENTS_PER_STUDENT} per student)...`,
  );
  const enrollmentsByStudent = await seedEnrollments(teachers, students);

  console.log(`Seeding ${CONFIG.NUM_ASSIGNMENTS} assignments (one per student) + grades...`);
  await seedAssignments(teachers, students, enrollmentsByStudent);

  console.log("Seed complete.");
  console.log(
    `  Login with: admin@mentora.local, teacher1..${CONFIG.NUM_TEACHERS}@mentora.local, student1..${CONFIG.NUM_STUDENTS}@mentora.local, guardian1..${CONFIG.NUM_GUARDIANS}@mentora.local`,
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
