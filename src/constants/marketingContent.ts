import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Search,
  Shield,
  Users,
  Video,
} from "lucide-react";

export const MARKETING_NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

export const MARKETING_HOME = {
  eyebrow: "Online tutoring platform",
  title: "Learn any subject, from great teachers, on your schedule.",
  lead:
    "Mentora connects students with vetted tutors. Search by subject, pick a time that works for you, and join your virtual classroom in one click.",
  featuresTitle: "Everything in one place",
  featuresLead: "From discovery to live class to grades — no juggling spreadsheets or separate tools.",
  rolesTitle: "Built for every role",
  rolesLead: "Whether you teach, learn, or support a learner at home, Mentora has a path for you.",
  stepsTitle: "How Mentora works",
  stepsLead: "Get from sign-up to your first class in three straightforward steps.",
} as const;

export const MARKETING_HOME_STATS = [
  { value: "All-in-one", label: "Search, schedule, teach, and grade" },
  { value: "Role-ready", label: "Students, teachers, and guardians" },
  { value: "Live classes", label: "Virtual rooms built into the platform" },
] as const;

export const MARKETING_HOME_ROLES = [
  {
    id: "student",
    title: "Students",
    description: "Discover teachers, enroll in classes, submit assignments, and track grades.",
    href: "/register?role=STUDENT",
    cta: "Start learning",
  },
  {
    id: "teacher",
    title: "Teachers",
    description: "Publish your profile, set availability, run classes, and track earnings.",
    href: "/register?role=TEACHER",
    cta: "Start teaching",
  },
  {
    id: "guardian",
    title: "Guardians",
    description: "Link to your student with an invite and follow progress in read-only mode.",
    href: "/register?role=GUARDIAN",
    cta: "Join as guardian",
  },
] as const;

export const MARKETING_HOME_STEPS = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up as a student, teacher, or guardian in minutes with a role tailored to you.",
  },
  {
    step: "02",
    title: "Match and enroll",
    description: "Students browse teachers and enroll in classes that fit their schedule and interests.",
  },
  {
    step: "03",
    title: "Learn together",
    description: "Join live sessions, complete assignments, and track progress over time.",
  },
] as const;

export interface MarketingFeatureItem {
  icon: LucideIcon;
  label: string;
}

export const MARKETING_HOME_FEATURES: readonly MarketingFeatureItem[] = [
  {
    icon: Search,
    label: "Smart search and recommendations based on your interests.",
  },
  {
    icon: Calendar,
    label: "Flexible scheduling with automatic capacity control.",
  },
  {
    icon: GraduationCap,
    label: "Virtual classrooms, assignments, and grades in one place.",
  },
  {
    icon: Users,
    label: "Guardian accounts with read-only progress visibility.",
  },
] as const;

export interface MarketingFeatureSection {
  id: string;
  title: string;
  description: string;
  items: readonly { icon: LucideIcon; title: string; description: string }[];
}

export const MARKETING_FEATURE_SECTIONS: readonly MarketingFeatureSection[] = [
  {
    id: "students",
    title: "For students",
    description: "Find the right teacher, enroll in classes, and keep learning on your schedule.",
    items: [
      {
        icon: Search,
        title: "Teacher discovery",
        description:
          "Search by subject, region, availability, price, and ratings. Get recommendations based on your interests.",
      },
      {
        icon: Calendar,
        title: "Flexible scheduling",
        description:
          "Browse teacher calendars, enroll when seats are available, and manage your class roster in one place.",
      },
      {
        icon: Video,
        title: "Virtual classroom",
        description:
          "Join live sessions from your dashboard. Start class with one click when your teacher opens the room.",
      },
      {
        icon: BookOpen,
        title: "Assignments & grades",
        description:
          "Submit homework, view feedback, and track grades alongside your class schedule.",
      },
      {
        icon: BarChart3,
        title: "Billing summary",
        description: "See completed sessions and subject-level billing in your student account.",
      },
    ],
  },
  {
    id: "teachers",
    title: "For teachers",
    description: "Build your profile, set availability, and run classes without juggling spreadsheets.",
    items: [
      {
        icon: GraduationCap,
        title: "Profile & courses",
        description:
          "Showcase your bio, subjects, rates, and syllabus. Complete a guided setup to go live faster.",
      },
      {
        icon: Calendar,
        title: "Availability & capacity",
        description:
          "Offer weekly, bi-weekly, or monthly slots with automatic conflict detection and enrollment caps.",
      },
      {
        icon: ClipboardCheck,
        title: "Attendance & schedule",
        description:
          "Take attendance from today's schedule, review historical rates, and manage multiple class offerings.",
      },
      {
        icon: BookOpen,
        title: "Assignments & grading",
        description: "Create assignments, review submissions, and publish grades to your students.",
      },
      {
        icon: BarChart3,
        title: "Earnings overview",
        description: "Track completed sessions and earnings by subject with regional rate floors built in.",
      },
    ],
  },
  {
    id: "guardians",
    title: "For guardians",
    description: "Stay informed without managing enrollments or grades yourself.",
    items: [
      {
        icon: Shield,
        title: "Invite-based access",
        description: "Link to a student with a secure invite code — no duplicate accounts or password sharing.",
      },
      {
        icon: Users,
        title: "Ward dashboard",
        description: "View each ward's classes, teachers, timetable, and attendance history in read-only mode.",
      },
      {
        icon: BookOpen,
        title: "Progress visibility",
        description: "See grades and assignment outcomes so you can support learning at home.",
      },
      {
        icon: Video,
        title: "Class awareness",
        description: "Know when classes are scheduled and receive reminders alongside your student.",
      },
    ],
  },
] as const;

export const MARKETING_ABOUT = {
  title: "Built for learners, teachers, and families",
  lead:
    "Mentora is a tutoring platform that brings discovery, scheduling, live classes, and progress tracking into one place — so everyone spends less time coordinating and more time learning.",
  missionTitle: "Our mission",
  mission:
    "Make quality tutoring accessible by connecting the right teacher with the right student at the right time, with transparency for guardians and fair tools for educators.",
  values: [
    {
      title: "Trust & safety",
      description: "Teachers build verified profiles. Guardians get read-only visibility — never control over grades or enrollments.",
    },
    {
      title: "Clarity for everyone",
      description: "Students see what's next. Teachers see who's enrolled. Guardians see progress without extra admin work.",
    },
    {
      title: "Fair economics",
      description: "Regional rate floors protect teachers. Capacity rules prevent overbooking. Billing summaries keep students informed.",
    },
  ],
  steps: [
    { step: "1", title: "Create your account", description: "Sign up as a student, teacher, or guardian in minutes." },
    { step: "2", title: "Match & enroll", description: "Students discover teachers and enroll in classes that fit their schedule." },
    { step: "3", title: "Learn together", description: "Join virtual classrooms, complete assignments, and track progress over time." },
  ],
} as const;

export const MARKETING_PRICING = {
  title: "Simple, transparent pricing",
  lead:
    "Students pay the teacher's rate plus a small service fee. Teachers keep every dollar of their listed rate. No hidden costs, no surprises.",
  plans: [
    {
      id: "students",
      name: "Students",
      price: "From $15/hr",
      description:
        "Search teachers by subject and enroll at their published rate. A small service fee is added at checkout so you always see the full cost before you pay.",
      highlights: [
        "No monthly subscription — pay per session",
        "Typical total: $25–$60/hr depending on subject",
        "Service fee shown before you pay",
        "Billing history by subject",
        "Free to browse and message teachers",
      ],
      ctaHref: "/register?role=STUDENT",
      ctaLabel: "Get started",
    },
    {
      id: "teachers",
      name: "Teachers",
      price: "Keep 100% of your rate",
      description:
        "Set your hourly rate above your region's minimum. We add the service fee on the student side, so you take home exactly what you charge.",
      highlights: [
        "Your listed rate is your take-home pay",
        "No platform deduction from your earnings",
        "Set rates per subject above regional minimums",
        "Guided profile setup & scheduling tools",
        "Earnings dashboard with per-subject breakdown",
      ],
      ctaHref: "/register?role=TEACHER",
      ctaLabel: "Start teaching",
    },
    {
      id: "guardians",
      name: "Guardians",
      price: "Free",
      description:
        "Link to your student's account with an invite code and monitor their progress at no extra cost.",
      highlights: [
        "Read-only ward dashboard",
        "Grades, attendance & schedule visibility",
        "Class reminders alongside your student",
        "No billing or payment management needed",
      ],
      ctaHref: "/register?role=GUARDIAN",
      ctaLabel: "Join as guardian",
    },
  ],
  note:
    "Service fees are set by platform policy and are subject to change. Contact us for enterprise or school pricing — we offer custom terms for institutions.",
} as const;

export const MARKETING_CONTACT = {
  title: "Contact us",
  lead: "Questions about Mentora, partnerships, or getting your school online? Send us a message and we'll respond within two business days.",
  email: "hello@mentora.app",
  fields: {
    name: "Full name",
    email: "Email",
    subject: "Subject",
    message: "Message",
  },
} as const;

export const MARKETING_FOOTER = {
  tagline: "Tutoring that fits your schedule.",
  columns: [
    {
      title: "Product",
      links: [
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/about", label: "About" },
      ],
    },
    {
      title: "Account",
      links: [
        { href: "/login", label: "Log in" },
        { href: "/register", label: "Sign up" },
        { href: "/register?role=TEACHER", label: "Become a teacher" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/contact", label: "Contact" },
      ],
    },
  ],
} as const;
