import React from "react";
import { cn } from "@/src/libs/utils";
import { MOCK_QUESTIONS } from "../../constants/constant";

interface ExamQuestionListProps {
  answers: Record<number, string>;
  onOptionSelect: (questionId: number, optionId: string) => void;
}

export function ExamQuestionList({ answers, onOptionSelect }: ExamQuestionListProps) {
  return (
    <div className="w-full lg:w-1/2 h-[60vh] lg:h-full bg-slate-50/50 p-6 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col gap-6">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h3 className="font-black text-slate-800 text-lg mb-2">Questions 1–3</h3>
        <p className="text-sm text-slate-600 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
          Choose the correct letter, <span className="font-bold">A, B, C or D</span>.
        </p>
        
        <div className="space-y-10">
          {MOCK_QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-4">
              <p className="font-semibold text-slate-800 text-base leading-relaxed flex gap-2">
                <span className="font-black text-brand-purple shrink-0">{q.id}.</span> 
                {q.question}
              </p>
              
              <div className="space-y-2 pl-2 sm:pl-6">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.id;
                  return (
                    <label 
                      key={opt.id}
                      className={cn(
                        "group flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all",
                        isSelected 
                          ? "border-brand-purple bg-brand-purple/5 shadow-sm" 
                          : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 flex shrink-0 items-center justify-center h-5 w-5 rounded-full border-2 transition-colors",
                        isSelected ? "border-brand-purple" : "border-slate-300 group-hover:border-slate-400"
                      )}>
                        <div className={cn("h-2.5 w-2.5 rounded-full bg-brand-purple transition-transform", isSelected ? "scale-100" : "scale-0")} />
                      </div>
                      
                      <input 
                        type="radio" 
                        name={`question-${q.id}`} 
                        value={opt.id}
                        className="hidden"
                        checked={isSelected}
                        onChange={() => onOptionSelect(q.id, opt.id)}
                      />
                      
                      <div className="flex gap-2 text-sm sm:text-base">
                        <span className="font-bold text-slate-700">{opt.id}.</span>
                        <span className={isSelected ? "text-slate-900 font-medium" : "text-slate-600"}>{opt.text}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-20 lg:h-10"></div>
    </div>
  );
}