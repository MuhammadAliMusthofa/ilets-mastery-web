"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationMenu } from "radix-ui";
import { Menu, X, LogOut, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { useAuthStore } from "@/src/store/authStore";
import { isAdminRole } from "@/src/models/auth";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CharacterTile } from "@/src/_global/components/Showcase/Showcase";
import { Wordmark } from "./Wordmark";
import { ADMIN_NAV, STUDENT_NAV, isActive, type NavItem, type NavSection } from "./nav";

/*
 * Dua kerangka:
 * - admin: chrome abu-abu ala produk monday (sidebar kiri + panel putih).
 * - siswa: navbar atas ala situs monday.com dengan mega menu, halaman putih lega.
 */

type Variant = "student" | "admin";
const ShellVariant = createContext<Variant>("student");
export const useShellVariant = () => useContext(ShellVariant);

const initialsOf = (name: string | undefined) =>
  (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

// ---------------------------------------------------------------------------
// Admin: sidebar
// ---------------------------------------------------------------------------

function Sidebar({ sections, pathname, onNavigate }: { sections: NavSection[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-5 px-3 pb-6 pt-2">
      {sections.map((section, index) => (
        <div key={section.workspace?.name ?? section.title ?? index}>
          {section.workspace && (
            <div className="mb-1 flex items-center gap-2 px-2 py-1.5">
              <span
                className="flex size-6 items-center justify-center rounded-[4px] text-[13px] font-semibold"
                style={{ backgroundColor: section.workspace.color, color: section.workspace.ink }}
                aria-hidden="true"
              >
                {section.workspace.letter}
              </span>
              <span className="truncate text-[14px] font-semibold text-slate-800">{section.workspace.name}</span>
            </div>
          )}
          {section.title && <p className="mb-1 px-2 text-[12px] font-medium text-slate-500">{section.title}</p>}

          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center gap-2.5 rounded-[4px] px-2 text-[14px] transition-colors duration-150",
                      section.workspace && "pl-4",
                      active ? "bg-primary-100 font-medium text-slate-800" : "text-slate-700 hover:bg-[#dcdfec]"
                    )}
                  >
                    <Icon size={16} className={active ? "text-primary-500" : "text-slate-500"} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ProfileMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [leaving, setLeaving] = useState(false);

  const roleLabel = user?.role === "SUPER_ADMIN" ? "Super admin" : user?.role === "ADMIN" ? "Admin" : "Student";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition-colors hover:bg-slate-100"
          aria-label="Account menu"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-primary-500 text-[13px] font-semibold text-white">
            {initialsOf(user?.full_name)}
          </span>
          <ChevronDown size={14} className="text-slate-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <DropdownMenuLabel className="px-2 py-2">
          <span className="block truncate text-[14px] font-semibold text-slate-800">{user?.full_name ?? "Guest"}</span>
          <span className="block truncate text-[13px] font-normal text-slate-500">{user?.email}</span>
          <span className="mt-1.5 inline-block rounded-[4px] bg-slate-100 px-1.5 py-0.5 text-[12px] font-medium text-slate-700">
            {roleLabel}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={leaving}
          onSelect={async (event) => {
            event.preventDefault();
            setLeaving(true);
            await logout();
          }}
          className="h-9 px-2 text-[14px]"
        >
          <LogOut size={16} />
          {leaving ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-2 bg-slate-50 px-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex size-8 items-center justify-center rounded-[4px] text-slate-700 hover:bg-[#dcdfec] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <Wordmark href="/admin" suffix="Admin" />

        <div className="ml-auto flex items-center gap-2">
          <Link href="/dashboard" className="hidden rounded-[4px] px-2 py-1 text-[13px] text-slate-700 hover:bg-[#dcdfec] sm:block">
            View as student
          </Link>
          <ProfileMenu />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="sticky top-12 hidden h-[calc(100vh-3rem)] w-[248px] shrink-0 overflow-y-auto lg:block">
          <Sidebar sections={ADMIN_NAV} pathname={pathname} />
        </aside>

        <main className="min-w-0 flex-1 rounded-tl-2xl border-l border-t border-slate-200 bg-white">{children}</main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] overflow-y-auto bg-slate-50 shadow-lg">
            <div className="flex h-12 items-center justify-between px-3">
              <Wordmark href="/admin" />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex size-8 items-center justify-center rounded-[4px] text-slate-700 hover:bg-[#dcdfec]"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <Sidebar sections={ADMIN_NAV} pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Siswa: navbar + mega menu
// ---------------------------------------------------------------------------

const [HOME_SECTION, IELTS_SECTION, BASIC_SECTION] = STUDENT_NAV;

const topLinkClass = (active: boolean) =>
  cn(
    "relative flex h-10 items-center gap-1 rounded-full px-3.5 text-[15px] transition-colors duration-150 outline-none focus-visible:outline-2 focus-visible:outline-primary-500",
    "data-[state=open]:bg-slate-100 hover:bg-slate-100",
    active ? "font-medium text-slate-900" : "text-slate-700"
  );

function ActiveDot({ show }: { show: boolean }) {
  if (!show) return null;
  return <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary-500" aria-hidden="true" />;
}

function MegaItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item);
  const Icon = item.icon;
  return (
    <NavigationMenu.Link asChild active={active}>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-2xl p-2.5 transition-colors duration-150 hover:bg-[#eef0fb]",
          active && "bg-[#eef0fb]"
        )}
      >
        {item.skill ? (
          <CharacterTile skill={item.skill} size={46} />
        ) : (
          <span className="flex size-[46px] shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Icon size={20} />
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-[15px] text-slate-900">{item.label}</span>
          {item.description && <span className="block truncate text-[13px] text-slate-500">{item.description}</span>}
        </span>
      </Link>
    </NavigationMenu.Link>
  );
}

function MenuHeading({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 px-2.5 text-[13px] text-slate-500">{children}</p>;
}

const menuPanel =
  "absolute left-0 top-full mt-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_24px_60px_-20px_rgb(24_27_52/0.28)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1";

function StudentNav({ pathname }: { pathname: string }) {
  const ieltsItems = IELTS_SECTION.items;
  const skillItems = ieltsItems.filter((item) => item.skill);
  const studyItems = ieltsItems.filter((item) => !item.skill);
  const inIelts = ieltsItems.some((item) => isActive(pathname, item)) || pathname.startsWith("/ielts");
  const inBasic = BASIC_SECTION.items.some((item) => isActive(pathname, item));
  const home = HOME_SECTION.items[0];

  return (
    <NavigationMenu.Root aria-label="Main navigation" delayDuration={80} className="relative hidden lg:block">
      <NavigationMenu.List className="flex items-center gap-0.5">
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild active={isActive(pathname, home)}>
            <Link href={home.href} className={topLinkClass(isActive(pathname, home))}>
              Home
              <ActiveDot show={isActive(pathname, home)} />
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className={cn(topLinkClass(inIelts), "group")}>
            IELTS General Training
            <ChevronDown size={15} className="text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            <ActiveDot show={inIelts} />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={cn(menuPanel, "w-[780px]")}>
            <div className="grid grid-cols-[1fr_1.35fr] gap-6">
              <div className="border-r border-slate-100 pr-6">
                <MenuHeading>Study space</MenuHeading>
                <div className="space-y-1">
                  {studyItems.map((item) => (
                    <MegaItem key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
              <div>
                <MenuHeading>Skill materials, guided by the crew</MenuHeading>
                <div className="grid grid-cols-2 gap-1">
                  {skillItems.map((item) => (
                    <MegaItem key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            </div>
            <NavigationMenu.Link asChild>
              <Link
                href="/ielts/mock"
                className="group/promo mt-5 flex items-center justify-between gap-4 rounded-2xl bg-slate-950 px-5 py-4 text-white"
              >
                <span>
                  <span className="block font-display text-[18px]">Full mock test</span>
                  <span className="block text-[13px] text-[#c3c6d4]">
                    2 h 45 min · band estimate right after you submit
                  </span>
                </span>
                <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#b9e3ff] px-4 text-[14px] font-medium text-slate-900 transition-colors group-hover/promo:bg-white">
                  Try it now <ArrowRight size={15} />
                </span>
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className={cn(topLinkClass(inBasic), "group")}>
            Basic to Hero
            <ChevronDown size={15} className="text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            <ActiveDot show={inBasic} />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={cn(menuPanel, "w-[560px]")}>
            <MenuHeading>English foundations</MenuHeading>
            <div className="grid grid-cols-2 gap-1">
              {BASIC_SECTION.items.map((item) => (
                <MegaItem key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link asChild active={pathname.startsWith("/ielts/mock")}>
            <Link href="/ielts/mock" className={topLinkClass(pathname.startsWith("/ielts/mock"))}>
              Mock test
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

function StudentMobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="flex h-16 items-center justify-between px-5">
        <Wordmark href="/dashboard" />
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>
      <nav aria-label="Main navigation" className="space-y-6 px-5 pb-10 pt-2">
        {STUDENT_NAV.map((section, index) => (
          <div key={section.workspace?.name ?? index}>
            {section.workspace && <MenuHeading>{section.workspace.name}</MenuHeading>}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(pathname, item);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn("flex items-center gap-3 rounded-2xl p-2", active ? "bg-[#eef0fb]" : "hover:bg-slate-50")}
                    >
                      {item.skill ? (
                        <CharacterTile skill={item.skill} size={40} />
                      ) : (
                        <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                          <Icon size={18} />
                        </span>
                      )}
                      <span className="text-[16px] text-slate-900">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header
        className={cn(
          "sticky top-0 z-40 bg-white transition-shadow duration-200",
          scrolled ? "shadow-[0_1px_0_#ecedf5,0_8px_24px_-16px_rgb(24_27_52/0.25)]" : ""
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-4 px-5 lg:gap-6 lg:px-8">
          <Wordmark href="/dashboard" />
          <StudentNav pathname={pathname} />

          <div className="ml-auto flex items-center gap-2">
            {isAdminRole(user?.role) && (
              <Link href="/admin" className={cn(buttonVariants({ variant: "outline", size: "sm", shape: "pill" }), "hidden sm:inline-flex")}>
                Open admin
              </Link>
            )}
            <Link
              href="/ielts/mock"
              className={cn(buttonVariants({ variant: "dark", size: "sm", shape: "pill" }), "hidden sm:inline-flex")}
            >
              Start a mock test <ArrowRight size={15} />
            </Link>
            <ProfileMenu />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex size-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="min-w-0 flex-1 pb-16">{children}</main>

      {menuOpen && <StudentMobileMenu pathname={pathname} onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

export function AppShell({ variant = "student", children }: { variant?: Variant; children: React.ReactNode }) {
  return (
    <ShellVariant.Provider value={variant}>
      {variant === "admin" ? <AdminShell>{children}</AdminShell> : <StudentShell>{children}</StudentShell>}
    </ShellVariant.Provider>
  );
}

// ---------------------------------------------------------------------------
// Kepala & isi halaman
// ---------------------------------------------------------------------------

/**
 * Kepala halaman. Admin: judul ringkas di atas garis. Siswa: judul Poppins
 * besar tanpa garis, seperti judul bagian di situs monday.
 */
export function PageHeader({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const variant = useShellVariant();

  if (variant === "student") {
    return (
      <div className="mx-auto max-w-[1240px] px-5 pt-10 lg:px-8 lg:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[44px]">
              {title}
            </h1>
            {description && <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-slate-600">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {children && <div className="mt-8">{children}</div>}
      </div>
    );
  }

  return (
    <div className="border-b border-slate-200 px-6 pb-0 pt-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4">
        <div className="min-w-0">
          <h1 className="font-display text-[26px] font-semibold leading-tight text-slate-800">{title}</h1>
          {description && <p className="mt-1 max-w-[70ch] text-[14px] text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

/** Isi halaman di bawah PageHeader. */
export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  const variant = useShellVariant();
  return (
    <div className={cn(variant === "student" ? "mx-auto max-w-[1240px] px-5 py-10 lg:px-8" : "px-6 py-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
