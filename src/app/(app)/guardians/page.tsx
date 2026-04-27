import type { Metadata } from "next";
import styled from "styled-components";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Muted, PageHeader, PageTitle, PageWrap } from "@/components/ui/primitives";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import { listStudentGuardians } from "@/server/guardians";
import { InviteForm } from "./InviteForm";

export const metadata: Metadata = { title: "Guardians" };

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  & > li + li {
    border-top: 1px solid ${COLORS.BORDER};
  }
`;

const LinkRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${SPACING.THREE} 0;
`;

const Email = styled.p`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const StatusText = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export default async function GuardiansPage() {
  const session = await requireRole("STUDENT");
  const links = await listStudentGuardians(session.user.id);

  return (
    <PageWrap>
      <PageHeader>
        <PageTitle>Guardians</PageTitle>
        <Muted>
          Invite a parent or guardian via email. They&apos;ll get a link to sign
          up and view your records in read-only mode.
        </Muted>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Invite a guardian</CardTitle>
          <CardDescription>
            They&apos;ll only see your attendance, grades, and active classes —
            no edit access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked guardians</CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <Muted>No guardians yet.</Muted>
          ) : (
            <LinkList>
              {links.map((l) => (
                <LinkRow key={l.id}>
                  <div>
                    <Email>{l.guardianEmail}</Email>
                    <StatusText>Status: {l.status.toLowerCase()}</StatusText>
                  </div>
                </LinkRow>
              ))}
            </LinkList>
          )}
        </CardContent>
      </Card>
    </PageWrap>
  );
}
