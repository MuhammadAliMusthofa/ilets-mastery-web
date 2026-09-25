import {
  Home,
  Route,
  LayoutGrid,
  BookCheck,
  Headphones,
  BookOpen,
  PenLine,
  Mic,
  MonitorPlay,
  Clock3,
  Shapes,
  MessagesSquare,
  FileText,
  Database,
  FolderArchive,
  Library,
  Users,
  Quote,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Aktif hanya bila path persis sama. */
  exact?: boolean;
  /** Baris kedua di mega menu siswa. */
  description?: string;
  /** Item materi skill: tampil dengan karakter kru di mega menu. */
  skill?: "LISTENING" | "READING" | "WRITING" | "SPEAKING";
}

export interface NavSection {
  /** Ruang kerja bergaya monday: kotak huruf berwarna + nama. */
  workspace?: { name: string; letter: string; color: string; ink: string };
  title?: string;
  items: NavItem[];
}

export const STUDENT_NAV: NavSection[] = [
  {
    items: [{ label: "Home", href: "/dashboard", icon: Home, exact: true }],
  },
  {
    workspace: { name: "IELTS General Training", letter: "I", color: "#0073ea", ink: "#ffffff" },
    items: [
      { label: "Overview", href: "/ielts", icon: LayoutGrid, exact: true, description: "Your IELTS GT study map" },
      { label: "Mock Test", href: "/ielts/mock", icon: BookCheck, description: "Timed simulation with a band" },
      { label: "Listening", href: "/student/materials/listening", icon: Headphones, skill: "LISTENING", description: "4 sections, 40 questions" },
      { label: "Reading", href: "/student/materials/reading", icon: BookOpen, skill: "READING", description: "Everyday & workplace texts" },
      { label: "Writing", href: "/student/materials/writing", icon: PenLine, skill: "WRITING", description: "Letters & essays" },
      { label: "Speaking", href: "/student/materials/speaking", icon: Mic, skill: "SPEAKING", description: "Cue cards & discussion" },
      { label: "Teleprompter", href: "/student/materials/teleprompter", icon: MonitorPlay, description: "Practise speaking fluently" },
    ],
  },
  {
    workspace: { name: "English Basic to Hero", letter: "B", color: "#00c875", ink: "#323338" },
    items: [
      { label: "My learning path", href: "/basic", icon: Route, description: "Lessons, reviews and checkpoints" },
      { label: "Tenses", href: "/student/materials/tenses", icon: Clock3, description: "16 tenses & when to use them" },
      { label: "Vocab & Chunking", href: "/student/materials/vocab", icon: Shapes, description: "Vocabulary by topic" },
      { label: "Idioms", href: "/student/materials/idioms", icon: MessagesSquare, description: "Everyday expressions" },
    ],
  },
];

export const ADMIN_NAV: NavSection[] = [
  {
    items: [{ label: "System overview", href: "/admin", icon: Home, exact: true }],
  },
  {
    workspace: { name: "IELTS GT content", letter: "I", color: "#0073ea", ink: "#ffffff" },
    items: [
      { label: "Passage", href: "/admin/passages", icon: FileText },
      { label: "Question bank", href: "/admin/questions", icon: Database },
      { label: "Test packages", href: "/admin/packages", icon: FolderArchive },
    ],
  },
  {
    workspace: { name: "English Basic to Hero", letter: "B", color: "#00c875", ink: "#323338" },
    items: [{ label: "Curriculum", href: "/admin/basic", icon: Library }],
  },
  {
    title: "More",
    items: [
      { label: "Quotes", href: "/admin/quotes", icon: Quote },
      { label: "Users", href: "/admin/users", icon: Users },
    ],
  },
];

export const isActive = (pathname: string, item: NavItem) =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
