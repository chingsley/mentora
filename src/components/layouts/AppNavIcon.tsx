"use client";

import {
  CalendarDays,
  Flag,
  GraduationCap,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  UserCircle2,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import styled from "styled-components";
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
  reports: Flag,
  ward: Shield,
};

const Wrapper = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
`;

export interface AppNavIconProps {
  name: AppNavIconKey;
}

export function AppNavIcon({ name }: AppNavIconProps) {
  const Icon = ICONS[name];
  return (
    <Wrapper>
      <Icon size={20} strokeWidth={2} aria-hidden />
    </Wrapper>
  );
}
