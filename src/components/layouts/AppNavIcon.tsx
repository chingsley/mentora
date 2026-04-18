import {
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Search,
  Settings,
  UserCircle2,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { AppNavIconKey } from "./appNavConfig";

const ICONS: Record<AppNavIconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  teachers: Search,
  classes: GraduationCap,
  schedule: CalendarDays,
  guardians: UsersRound,
  policies: Settings,
  users: Users,
  profile: UserCircle2,
};

export interface AppNavIconProps {
  name: AppNavIconKey;
  className?: string;
}

export function AppNavIcon({ name, className }: AppNavIconProps) {
  const Icon = ICONS[name];
  return (
    <Icon
      className={className ? `h-5 w-5 shrink-0 ${className}` : "h-5 w-5 shrink-0"}
      strokeWidth={2}
      aria-hidden
    />
  );
}
