"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";

const Scroll = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  text-align: left;
  font-size: ${FONTS.SIZE.SM};
  border-collapse: collapse;
`;

const HeadRow = styled.tr`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Th = styled.th`
  padding: ${SPACING.TWO} ${SPACING.FOUR} ${SPACING.TWO} 0;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
`;

const Tbody = styled.tbody`
  tr + tr {
    border-top: 1px solid ${COLORS.BORDER};
  }
`;

const Td = styled.td`
  padding: ${SPACING.TWO} ${SPACING.FOUR} ${SPACING.TWO} 0;
`;

const TdName = styled(Td)`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const TdMuted = styled(Td)`
  color: ${COLORS.MUTED_FOREGROUND};
`;

const TdSoft = styled(Td)`
  color: rgba(2, 8, 23, 0.8);
`;

export interface UsersTableUser {
  id: string;
  name: string;
  email: string;
  role: string;
  regionName: string | null;
  joinedDate: string;
}

export interface UsersTableProps {
  users: UsersTableUser[];
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <Scroll>
      <Table>
        <thead>
          <HeadRow>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Region</Th>
            <Th>Joined</Th>
          </HeadRow>
        </thead>
        <Tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <TdName>{u.name}</TdName>
              <TdSoft>{u.email}</TdSoft>
              <Td>{u.role.toLowerCase()}</Td>
              <Td>{u.regionName ?? "—"}</Td>
              <TdMuted>{u.joinedDate}</TdMuted>
            </tr>
          ))}
        </Tbody>
      </Table>
    </Scroll>
  );
}
