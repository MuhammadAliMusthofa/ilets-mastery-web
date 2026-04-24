import { BookOpen, Headphones, PenTool, Mic2 } from "lucide-react";

export const SKILLS_DATA = [
  {
    id: "listening",
    title: "Listening Agent",
    desc: "Master all 4 sections & various accents.",
    icon: Headphones,
    imageUrl: "/assets/icons/listeningggwp.png",
    avatarBgColor: 'bg-yellow-100',
    gradientColor: "from-blue-400 via-cyan-400 to-blue-500",
    themeClass: "bg-blue-50 text-blue-500 group-hover:bg-blue-500",
  },
  {
    id: "reading",
    title: "Reading Master",
    desc: "Improve skimming and scanning skills.",
    icon: BookOpen,
    imageUrl: "/assets/icons/reading.png",
    avatarBgColor: 'bg-blue-100',
    gradientColor: "from-brand-purple via-purple-400 to-pink-400",
    themeClass: "bg-brand-purple/10 text-brand-purple group-hover:bg-brand-purple",
  },
  {
    id: "writing",
    title: "Writing Expert",
    desc: "Task 1 & 2 essay structured practice.",
    icon: PenTool,
    avatarBgColor: 'bg-pink-100',
    imageUrl: "/assets/icons/writingggwp.png",

    gradientColor: "from-orange-400 via-red-400 to-pink-500",
    themeClass: "bg-orange-50 text-orange-500 group-hover:bg-orange-500",
  },
  {
    id: "speaking",
    title: "Speaking Partner",
    desc: "Mock test with AI analysis feedback.",
    icon: Mic2,
    avatarBgColor: 'bg-cyan-100',
    imageUrl: "/assets/icons/speaking.png",
    gradientColor: "from-emerald-400 via-teal-400 to-cyan-500",
    themeClass: "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500",
  },
] as const;