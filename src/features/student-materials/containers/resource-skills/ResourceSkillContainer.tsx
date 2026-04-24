"use client";
import { Card } from "@/components/ui/Card";
import { FolderOpen } from "lucide-react";

const DUMMY_TOPICS = [
  { id: 1, title: "Business & Work", count: "24 Words" },
  { id: 2, title: "Travel & Holidays", count: "18 Words" },
  { id: 3, title: "Education & Learning", count: "32 Words" },
  { id: 4, title: "Environment & Nature", count: "15 Words" },
];

export default function ResourceSkillContainer({ skill }: { skill: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {DUMMY_TOPICS.map((topic) => (
        <Card 
          key={topic.id} 
          className="p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-100 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-brand-cyan/10 transition-colors">
              <FolderOpen className="text-slate-400 group-hover:text-brand-cyan" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg group-hover:text-brand-purple transition-colors">
                {topic.title}
              </h3>
              <p className="text-sm font-medium text-slate-400">{topic.count}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}