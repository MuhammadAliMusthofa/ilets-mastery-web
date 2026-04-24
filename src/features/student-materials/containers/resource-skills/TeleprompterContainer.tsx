"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Mic2, Clock, Filter } from "lucide-react";
import { DUMMY_SCRIPTS, SCRIPT_TOPICS, TeleprompterScript } from "../../constants/teleprompter";
import TeleprompterModal from "../../components/Dialog/TeleprompterModal";


export default function TeleprompterLauncher() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedScript, setSelectedScript] = useState<TeleprompterScript | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Logic Filter Data
  const filteredScripts = DUMMY_SCRIPTS.filter((script) => 
    activeFilter === "All" ? true : script.topic === activeFilter
  );

  // Handler Buka Modal
  const handleOpenTeleprompter = (script: TeleprompterScript) => {
    setSelectedScript(script);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: FILTER KATEGORI */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded-[24px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 px-2 font-medium">
          <Filter size={18} />
          <span>Filter Topic:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SCRIPT_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setActiveFilter(topic)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeFilter === topic 
                  ? "bg-slate-800 text-white shadow-md" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 2: LIST SCRIPT CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScripts.map((script) => (
          <Card 
            key={script.id}
            onClick={() => handleOpenTeleprompter(script)}
            className="p-6 cursor-pointer group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-100 flex flex-col justify-between min-h-[160px]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-brand-cyan/10 text-brand-cyan text-xs font-bold uppercase tracking-wider rounded-lg">
                  {script.topic}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                  script.difficulty === "Easy" ? "bg-green-100 text-green-600" :
                  script.difficulty === "Medium" ? "bg-amber-100 text-amber-600" :
                  "bg-red-100 text-red-600"
                }`}>
                  {script.difficulty}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-brand-purple transition-colors">
                {script.title}
              </h3>
            </div>
            
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100 text-slate-500">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Clock size={16} />
                {script.estimatedTime}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Mic2 size={16} />
                {script.content.split(" ").length} Words
              </div>
            </div>
          </Card>
        ))}

        {filteredScripts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">
            No scripts found for this topic.
          </div>
        )}
      </div>

      {/* SECTION 3: MODAL TELEPROMPTER */}
      <TeleprompterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        script={selectedScript} 
      />

    </div>
  );
}