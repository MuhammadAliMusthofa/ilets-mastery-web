"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { SKILLS_DATA } from "../constants/contants";
import { SparklesText } from "@/components/ui/sparkles-text";
import { CharacterCard } from "@/src/_global/components/Card/CharacterCard";
import Image from "next/image";

export default function StudentContainer() {
    const router = useRouter();

    return (
        /* 1. Tambahkan px-4 sm:px-6 lg:px-8 agar konten tidak menempel di tepi layar HP
           dan tambahkan max-w-7xl mx-auto agar di monitor besar tidak terlalu melebar */
        <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-500 pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            
            {/* WELCOME SECTION */}
            <div className="flex flex-col gap-2">
                {/* 2. Ukuran font dibuat dinamis: text-2xl di mobile, text-4xl di desktop */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    Are You Ready to Be a, <br className="hidden sm:block" />
                    <SparklesText>
                        <span className="bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
                            IELTS FIGHTER
                        </span> 🚀
                    </SparklesText>
                </h1>
                <p className="text-sm sm:text-base text-slate-500">
                    Don't stop until you reach your target band score.
                </p>
            </div>

            {/* QUICK STATS */}
            {/* 3. Grid diubah gap-nya agar lebih rapat di mobile (gap-4) dan pas di desktop (gap-6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card variant="default" className="border-none shadow-sm bg-white/80 backdrop-blur-md rounded-2xl w-full">
                    {/* Padding CardContent dikurangi di mobile (p-4) agar proporsional */}
                    <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                            <Image src="/assets/icons/speedometer.png" width={40} height={40} alt="speed" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">Target Band</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">8.0</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="default" className="border-none shadow-sm bg-white/80 backdrop-blur-md rounded-2xl w-full">
                    <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                            <Image src="/assets/icons/fast-time.png" width={40} height={40} alt="clock" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">Practice Time</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">12h 45m</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* MAIN SKILLS GRID */}
            <div className="mt-12 sm:mt-16">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-6 sm:mb-10">
                    Focus Your Training
                </h2>

                {/* 4. PERBAIKAN GAP PADA GRID:
                    Sebelumnya gap-x-16 dan gap-y-10 terlalu besar untuk mobile.
                    Sekarang menggunakan gap-y-4 di mobile dan bertambah lebar di layar besar.
                */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 lg:gap-x-12 xl:gap-x-16 gap-y-4 sm:gap-y-8">
                    {SKILLS_DATA.map((skill) => (
                        <CharacterCard
                            key={skill.id}
                            title={skill.title}
                            subtitle={skill.desc}
                            icon={<skill.icon size={18} />}
                            imageUrl={skill.imageUrl}
                            gradientColor={skill.gradientColor}
                            avatarBg={skill.avatarBgColor}
                            onClick={() => router.push(`/student/materials/${skill.id}`)}
                        />
                    ))}
                </div>
            </div>
            
        </div>
    );
}