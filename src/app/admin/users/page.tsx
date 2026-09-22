"use client";

import React, { useState } from "react";
import { Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import {
  BoardBody,
  BoardCell,
  BoardGroup,
  BoardHead,
  BoardHeadCell,
  BoardRow,
  BoardTable,
  FillLabel,
} from "@/src/_global/components/Board/Board";

// Contoh data: halaman ini belum tersambung ke endpoint pengguna di backend.
const USERS = [
  { id: "U1001", name: "Alice Johnson", email: "alice@example.com", role: "Student", band: "6.5", joined: "1 Sep 2024" },
  { id: "U1002", name: "Bob Smith", email: "bob@example.com", role: "Admin", band: "—", joined: "15 Aug 2024" },
  { id: "U1003", name: "Charlie Davis", email: "charlie@example.com", role: "Student", band: "7.0", joined: "2 Oct 2024" },
];

const ROLE_COLOR = {
  Admin: { bg: "#784bd1", fg: "#ffffff" },
  Student: { bg: "#cce5ff", fg: "#323338" },
} as const;

export default function UserManagementPage() {
  const [query, setQuery] = useState("");
  const visible = USERS.filter((user) =>
    `${user.name} ${user.email} ${user.id}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <>
      <PageHeader title="Users" description="Registered students and admins." />
      <PageBody>
        <p className="mb-6 flex items-start gap-2 rounded-lg bg-primary-50 px-4 py-3 text-[14px] text-slate-800">
          <Info size={16} className="mt-0.5 shrink-0 text-primary-500" />
          The data below is sample data. The real user list will appear once the backend has a users endpoint.
        </p>

        <div className="relative mb-6 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email or ID"
            aria-label="Search users"
            className="pl-9"
          />
        </div>

        <BoardGroup title="All users" color="#579bfc" meta={`${visible.length} people`}>
          <BoardTable>
            <BoardHead>
              <BoardHeadCell first align="left" className="w-[38%]">User</BoardHeadCell>
              <BoardHeadCell className="w-[130px]">Role</BoardHeadCell>
              <BoardHeadCell>Average band</BoardHeadCell>
              <BoardHeadCell>Joined</BoardHeadCell>
              <BoardHeadCell className="w-[120px] rounded-tr-lg">
                <span className="sr-only">Actions</span>
              </BoardHeadCell>
            </BoardHead>
            <BoardBody>
              {visible.map((user, index) => (
                <BoardRow key={user.id}>
                  <BoardCell first last={index === visible.length - 1} align="left">
                    <span className="flex items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[12px] font-semibold text-white">
                        {user.name.charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-800">{user.name}</span>
                        <span className="block truncate text-[13px] text-slate-500">{user.email}</span>
                      </span>
                    </span>
                  </BoardCell>
                  <BoardCell flush>
                    <FillLabel color={ROLE_COLOR[user.role as keyof typeof ROLE_COLOR]}>{user.role}</FillLabel>
                  </BoardCell>
                  <BoardCell className="tabular text-slate-700">{user.band}</BoardCell>
                  <BoardCell className="tabular text-slate-700">{user.joined}</BoardCell>
                  <BoardCell>
                    <Button size="sm" variant="ghost" disabled>
                      Change role
                    </Button>
                  </BoardCell>
                </BoardRow>
              ))}
              {visible.length === 0 && (
                <BoardRow>
                  <BoardCell first last align="left" className="text-slate-500">
                    No matching users.
                  </BoardCell>
                  <BoardCell />
                  <BoardCell />
                  <BoardCell />
                  <BoardCell />
                </BoardRow>
              )}
            </BoardBody>
          </BoardTable>
        </BoardGroup>
      </PageBody>
    </>
  );
}
