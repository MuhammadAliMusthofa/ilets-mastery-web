// app/admin/layout.tsx
import AdminTopbar from "@/src/_global/components/Navbar/AdminNavbar";
import AdminSidebar from "@/src/_global/components/Sidebar/AdminSidebar";
import React from "react";


export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

            {/* 1. SIDEBAR (Nempel terus di kiri) */}
            <AdminSidebar />

            {/* 2. AREA KANAN (Topbar + Konten) */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* TOPBAR (Nempel terus di atas) */}
                <AdminTopbar />

                {/* 3. KONTEN DINAMIS (Berubah sesuai URL) */}
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>

            </div>
        </div>
    );
}