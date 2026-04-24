import { User, Settings, LayoutDashboard, BookOpen, Library, MessageCircle, WholeWord, Hourglass, BookCheck, Headphones, PenSquare, StarsIcon, Mic2, Tv } from "lucide-react";
import { Children } from "react";


export const MAIN_NAV_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
        name: "Test",
        icon: BookOpen,
        children: [
            { name: "Mock Test", href: "/student/test/mock", icon: BookCheck },
            { name: "English Level", href: "/student/test/english-level", icon: StarsIcon },
        ]
    },
    {
        name: "Materials",
        icon: Library,
        // 🔥 Tinggal tambahin array 'children' kalau menu ini punya sub-menu
        children: [
            { name: "Listening", href: "/student/materials/listening", icon: Headphones },
            { name: "Reading", href: "/student/materials/reading", icon: BookOpen },
            { name: "Writing", href: "/student/materials/writing", icon: PenSquare },
            { name: "Speaking", href: "/student/materials/speaking", icon: Mic2 },
            { name: "Idioms", href: "/materials/idioms", icon: MessageCircle },
            { name: "Vocab & Chunking", href: "/student/materials/vocab", icon: WholeWord },
            { name: "Tenses Mastery", href: "/student/materials/tenses", icon: Hourglass },
            { name: "Teleprompter", href: "/student/materials/teleprompter", icon: Tv },

        ]
    },
];

export const PROFILE_MENU_ITEMS = [
    { name: "Profil Saya", icon: User, href: "/profile" },
    { name: "Pengaturan", icon: Settings, href: "/settings" },
];