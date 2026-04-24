"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import CoreSkillSyllabusContainer from "./core-skills/CoreSkillSyllabusContainer";
import ResourceSkillContainer from "./resource-skills/ResourceSkillContainer";
import TeleprompterContainer from "./resource-skills/TeleprompterContainer";
// import CoreSkillSyllabus from "./views/CoreSkillSyllabus";
// import ResourceSkillGrid from "./views/ResourceSkillGrid";
// import TeleprompterLauncher from "./views/TeleprompterLauncher";

interface SkillDetailProps {
  skill: string;
}

export default function SkillDetailContainer({ skill }: SkillDetailProps) {
  const formattedSkillTitle = skill.charAt(0).toUpperCase() + skill.slice(1);
  


  // KOMPONEN SWITCHER LOGIC
  const renderSkillContent = () => {
    switch (skill.toLowerCase()) {
      // 1. Kelompok Core Skills (Pakai UI lama lu)
      case "listening":
      case "reading":
      case "writing":
      case "speaking":
        return <CoreSkillSyllabusContainer skill={skill} />;
      
      // 2. Kelompok Resources (Pakai UI Grid Baru)
      case "idioms":
      case "vocab":
      case "tenses":
        return <ResourceSkillContainer skill={skill} />;
      
      // 3. Kelompok Tools
      case "teleprompter":
        return <TeleprompterContainer />;
        
      default:
        return <div>Materi tidak ditemukan.</div>;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">

      {/* --- KONTEN DINAMIS BERDASARKAN SKILL --- */}
      {renderSkillContent()}

    </div>
  );
}