"use client"

import React from "react"
import { HighlightableReading } from "@/src/components/ui/highlightable-reading"
import { Button } from "@/components/ui/button"
import { Clock, Info } from "lucide-react"

export default function ReadingExamPage() {
  const readingPassage = (
    <div className="space-y-4">
      <p>
        The history of human civilization is intertwined with the history of the ways we have learned to manipulate water resources. As towns gradually expanded, water was brought from increasingly remote sources, leading to sophisticated engineering efforts such as dams and aqueducts. At the height of the Roman Empire, nine major systems, with an innovative layout of pipes and well-built sewers, supplied the occupants of Rome with as much water per person as is provided in many parts of the industrial world today.
      </p>
      <p>
        During the industrial revolution and population explosion of the 19th and 20th centuries, the demand for water rose dramatically. Unprecedented construction of tens of thousands of monumental engineering projects designed to control floods, protect clean water supplies, and provide water for irrigation and hydropower brought great benefits to hundreds of millions of people. Food production has kept pace with soaring populations mainly because of the expansion of artificial irrigation systems that make possible the growth of 40 % of the world’s food.
      </p>
      <p>
        Yet there is a dark side to this picture: despite our progress, half of the world’s population still suffers, with water services inferior to those available to the ancient Greeks and Romans. As the United Nations report on access to water reiterated in November 2001, more than one billion people lack access to clean drinking water; some two and a half billion do not have adequate sanitation services.
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-3rem)]">
        
        {/* Header Exam */}
        <header className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-md font-bold text-sm">
              READING PASSAGE 1
            </div>
            <h1 className="font-semibold text-slate-800 dark:text-slate-100">IELTS Academic Reading Test</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-red-600 font-mono font-bold text-xl bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5" /> 59:30
            </div>
            <Button variant="default" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              Submit Test
            </Button>
          </div>
        </header>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-xl mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Tip:</strong> You can highlight text in the passage below by <strong>selecting it (drag to select)</strong> and then <strong>right-clicking</strong> to choose a highlight colour, just like the British Council method.
          </p>
        </div>

        {/* Content Area - Split Screen */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          
          {/* Kiri: Reading Passage (Highlightable) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-y-auto p-8 custom-scrollbar">
            <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">
              MAKING EVERY DROP COUNT
            </h2>
            
            {/* INI ADALAH KOMPONEN HIGHLIGHT */}
            <HighlightableReading 
              content={readingPassage} 
              className="text-lg text-justify select-text"
            />
          </div>

          {/* Kanan: Questions */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-y-auto p-8 custom-scrollbar">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Questions 1-3</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 italic">
              Do the following statements agree with the information given in Reading Passage 1?<br/>
              In boxes 1-3 on your answer sheet, write TRUE, FALSE, or NOT GIVEN.
            </p>

            <div className="space-y-6">
              {[
                "Water use per person is higher in the industrial world than it was in Ancient Rome.",
                "Feeding increasing populations is possible due primarily to improved irrigation systems.",
                "Modern water systems are currently being built in developing countries."
              ].map((q, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="font-bold w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="mb-2 text-slate-800 dark:text-slate-200">{q}</p>
                    <select className="border border-slate-300 dark:border-slate-700 rounded-md p-2 bg-slate-50 dark:bg-slate-800 outline-none focus:border-purple-500">
                      <option value="">Select answer...</option>
                      <option value="TRUE">TRUE</option>
                      <option value="FALSE">FALSE</option>
                      <option value="NOT GIVEN">NOT GIVEN</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
