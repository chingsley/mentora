import type { Role } from "@prisma/client";

export function appShellProfileRole(role: Role): string {
  switch (role) {
    case "STUDENT":
      return "Student";
    case "TEACHER":
      return "Teacher";
    case "GUARDIAN":
      return "Guardian";
    case "ADMIN":
      return "Admin";
    default:
      return role;
  }
}

export function appShellSearchPlaceholder(role: Role): string {
  switch (role) {
    case "STUDENT":
      return "Search classes, teachers, assignments…";
    case "TEACHER":
      return "Search students, classes, schedule…";
    case "GUARDIAN":
      return "Search wards, classes, grades…";
    case "ADMIN":
      return "Search users, reports, policies…";
    default:
      return "Search…";
  }
}
