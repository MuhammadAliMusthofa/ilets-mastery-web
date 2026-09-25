"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import {
  Badge,
  EmptyState,
  SearchInput,
  TBody,
  THead,
  Table,
  TableCard,
  Td,
  Th,
  Tr,
} from "@/src/features/admin/components/AdminUI";

// Contoh data: halaman ini belum tersambung ke endpoint pengguna di backend.
const USERS = [
  { id: "U1001", name: "Alice Johnson", email: "alice@example.com", role: "Student", band: "6.5", joined: "1 Sep 2024" },
  { id: "U1002", name: "Bob Smith", email: "bob@example.com", role: "Admin", band: "—", joined: "15 Aug 2024" },
  { id: "U1003", name: "Charlie Davis", email: "charlie@example.com", role: "Student", band: "7.0", joined: "2 Oct 2024" },
];

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

        <TableCard
          title="All users"
          count={visible.length}
          toolbar={<SearchInput value={query} onChange={setQuery} placeholder="Search by name, email or ID" label="Search users" />}
        >
          {visible.length === 0 ? (
            <EmptyState title="No matching users" text="Try another name, email or ID." />
          ) : (
            <Table minWidth={720}>
              <THead>
                <Th>User</Th>
                <Th className="w-[110px]">ID</Th>
                <Th className="w-[120px]">Role</Th>
                <Th className="w-[110px]" align="center">
                  Band
                </Th>
                <Th className="w-[130px]">Joined</Th>
                <Th className="w-[140px]">
                  <span className="sr-only">Actions</span>
                </Th>
              </THead>
              <TBody>
                {visible.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-[13px] text-slate-500">{user.email}</p>
                    </Td>
                    <Td className="tabular text-slate-500">{user.id}</Td>
                    <Td>
                      <Badge tone={user.role === "Admin" ? "purple" : "blue"}>{user.role}</Badge>
                    </Td>
                    <Td align="center" className="tabular text-slate-700">
                      {user.band}
                    </Td>
                    <Td className="tabular text-slate-500">{user.joined}</Td>
                    <Td>
                      <span className="flex justify-end">
                        <Button size="sm" variant="ghost" disabled>
                          Change role
                        </Button>
                      </span>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </TableCard>
      </PageBody>
    </>
  );
}
