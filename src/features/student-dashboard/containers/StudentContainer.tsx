"use client";

// Pastikan import path ini huruf kecil di ujungnya 'card' ya bang biar aman
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, PenTool, Mic2, Star, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentContainer() {

        const router = useRouter();
    
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* WELCOME SECTION */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Welcome back, <span className="bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">Warrior!</span> 🚀
                </h1>
                <p className="text-slate-500">Don't stop until you reach your target band score.</p>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card variant="default" className="border-none shadow-sm bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-brand-cyan/10 rounded-2xl text-brand-cyan">
                            <Star size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Target Band</p>
                        <h3 className="text-2xl font-bold text-slate-800">8.0</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="default" className="border-none shadow-sm bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-brand-purple/10 rounded-2xl text-brand-purple">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Practice Time</p>
                            <h3 className="text-2xl font-bold text-slate-800">12h 45m</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* MAIN SKILLS GRID */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                    Focus Your Training
                </h2>
                
                {/* 🔥 PERBAIKAN DI SINI: grid-cols-1 untuk HP, md:grid-cols-2 untuk Laptop/Tablet */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* LISTENING CARD */}
                    <Card variant="gradientCool" className="group cursor-pointer" onClick={() => router.push('/student/materials/listening')}>
                        <CardHeader className="pb-2">
                            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Headphones size={24} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="mb-2 text-xl">Listening</CardTitle>
                            <p className="text-xs text-slate-500 mb-4">Master all 4 sections & various accents.</p>
                            {/* <Button size="sm" variant="gradientOutline" className="w-full rounded-xl">Practice Now</Button> */}
                        </CardContent>
                    </Card>

                    {/* READING CARD */}
                    <Card variant="gradientBrand" className="group cursor-pointer"  onClick={() => router.push('/student/materials/reading')}>
                        <CardHeader className="pb-2">
                            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-brand-purple/10 text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all">
                                <BookOpen size={24} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="mb-2 text-xl text-brand-purple">Reading</CardTitle>
                            <p className="text-xs text-slate-500 mb-4">Improve skimming and scanning skills.</p>
                            {/* <Button size="sm" variant="gradientOutline" className="w-full rounded-xl">Practice Now</Button> */}
                        </CardContent>
                    </Card>

                    {/* WRITING CARD */}
                    <Card variant="gradientWarm" className="group cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                <PenTool size={24} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="mb-2 text-xl text-orange-600">Writing</CardTitle>
                            <p className="text-xs text-slate-500 mb-4">Task 1 & 2 essay structured practice.</p>
                            {/* <Button size="sm" variant="gradientOutline" className="w-full rounded-xl">Submit Essay</Button> */}
                        </CardContent>
                    </Card>

                    {/* SPEAKING CARD */}
                    <Card variant="gradientCool" className="group cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Mic2 size={24} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="mb-2 text-xl text-emerald-600">Speaking</CardTitle>
                            <p className="text-xs text-slate-500 mb-4">Mock test with AI analysis feedback.</p>
                            {/* <Button size="sm" variant="gradientOutline" className="w-full rounded-xl">Record Session</Button> */}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}