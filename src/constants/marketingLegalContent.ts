export const MARKETING_PRIVACY = {
  title: "Privacy policy",
  lead: "How Mentora collects, uses, and protects your information.",
  sections: [
    {
      title: "Information we collect",
      body: "We collect account details you provide at registration (name, email, role), profile information you add, class and scheduling data, and usage information needed to operate the platform.",
    },
    {
      title: "How we use information",
      body: "We use your data to provide tutoring services, match students with teachers, process enrollments, display progress to authorized guardians, and improve the product. We do not sell personal information.",
    },
    {
      title: "Guardian access",
      body: "Guardians linked via invite codes receive read-only access to a student's classes, attendance, and grades. Guardians cannot modify enrollments or grades on behalf of a student.",
    },
    {
      title: "Data retention & security",
      body: "We retain account data while your account is active and as required for legal or operational purposes. Access controls and encryption are applied according to industry best practices.",
    },
    {
      title: "Contact",
      body: "Questions about this policy can be sent through the contact page or to hello@mentora.app.",
    },
  ],
} as const;

export const MARKETING_TERMS = {
  title: "Terms of service",
  lead: "The rules for using Mentora as a student, teacher, guardian, or administrator.",
  sections: [
    {
      title: "Acceptance",
      body: "By creating an account or using Mentora, you agree to these terms and to use the platform lawfully and respectfully.",
    },
    {
      title: "Accounts & roles",
      body: "You are responsible for safeguarding your credentials. Students enroll in classes; teachers publish accurate profiles and honor scheduled sessions; guardians use read-only access only.",
    },
    {
      title: "Payments",
      body: "Teachers set rates within regional minimums. Students pay for completed sessions according to published rates and applicable platform policies. Payment integrations may vary by region.",
    },
    {
      title: "Content & conduct",
      body: "You may not harass other users, share unlawful content, or attempt to circumvent capacity or enrollment rules. We may suspend accounts that violate these terms.",
    },
    {
      title: "Changes",
      body: "We may update these terms as the product evolves. Continued use after changes constitutes acceptance of the revised terms.",
    },
  ],
} as const;
