import React from "react";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";

interface ExamFooterProps {
  answers: Record<number, string>;
  totalQuestions: number;
}

export function ExamFooter({ answers, totalQuestions }: ExamFooterProps) {
  // Bikin array angka dari 1 sampai totalQuestions (misal: [1,2,3])
  const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  return (
    <footer className="h-16 lg:h-20 bg-white border-t border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
      <Button variant="outline" className="hidden sm:flex text-orange-500 border-orange-200 hover:bg-orange-50 font-bold rounded-xl">
        <Flag size={16} className="mr-2" /> Mark for Review
      </Button>

      <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto px-4 custom-scrollbar">
        {questionNumbers.map((num) => {
          const isAnswered = !!answers[num];
          return (
            <button 
              key={num}
              className={cn(
                "min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 rounded-lg text-sm font-bold transition-all border",
                isAnswered 
                  ? "bg-brand-purple text-white border-brand-purple shadow-md" 
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
              )}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" className="hidden sm:flex text-slate-600 rounded-xl font-bold">
          <ChevronLeft size={18} className="mr-1" /> Prev
        </Button>
        <Button className="bg-slate-900 hover:bg-brand-purple text-white px-4 sm:px-8 rounded-xl font-bold h-10 transition-all shadow-md">
          Next <ChevronRight size={18} className="ml-1" />
        </Button>
      </div>
    </footer>
  );
}