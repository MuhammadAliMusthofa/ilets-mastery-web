"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"; // <-- Huruf kecil 'card'
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Import skema validasi dari folder validator lu
import { loginSchema } from "../validator/validation";
import { useState } from "react";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/src/store/authStore";
import { isAdminRole, type AuthUser } from "@/src/models/auth";
import Link from "next/link";

export default function LoginContainer() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const setAuth = useAuthStore((state) => state.setAuth);

    // Inisialisasi form pakai skema Zod yang udah di-import
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Fungsi saat tombol submit diklik
    async function onSubmit(values: z.infer<typeof loginSchema>) {
        try {
            setIsLoading(true);
            setErrorMsg("");
            const res = await authService.login(values);
            
            // Backend sudah mengirim role dan memasang cookie accessToken & role sendiri,
            // jadi tidak ada pemetaan maupun penulisan cookie di sisi klien.
            const user: AuthUser = res.data.user;
            setAuth(user, res.data.token);

            router.push(isAdminRole(user.role) ? "/admin" : "/dashboard");
        } catch (error: any) {
            console.error("Login Error:", error);
            setErrorMsg(error.response?.data?.message || "Gagal login, periksa kembali email & password Anda.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center p-4 bg-slate-50 overflow-hidden">

            {/* Dekorasi Background dengan warna Logo Lu */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-cyan rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-purple rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-pulse" />

            {/* 🔥 PERBAIKAN DI SINI: Class kaca (backdrop-blur & border-white/60) DIHAPUS! */}
            <Card variant="gradientBrand" className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center pb-2">
                    {/* Judul Teks pakai Gradasi Logo */}
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-purple mb-2">
                        Welcome Back
                    </CardTitle>
                    <p className="text-slate-500 text-sm">
                        Sign in to continue your IELTS preparation
                    </p>
                </CardHeader>

                <CardContent className="space-y-6 mt-4">

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {errorMsg && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* FIELD EMAIL */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700">Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="student@ielts.com"
                                                    className="bg-white/70 border-slate-200 focus:bg-white"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* FIELD PASSWORD */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel className="text-slate-700">Password</FormLabel>
                                                {/* Link hover nyambung sama warna logo */}
                                                <a href="#" className="text-xs text-brand-purple hover:text-brand-cyan transition-colors">Forgot password?</a>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="bg-white/70 border-slate-200 focus:bg-white"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="gradientOutline"
                                className="w-full h-12 text-base rounded-xl font-bold tracking-wide"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>

                        </form>
                    </Form>

                    <p className="text-center text-sm text-slate-500">
                        {"Don't have an account? "}<Link href="/register" className="text-brand-purple font-medium hover:text-brand-cyan transition-colors">Register here</Link>
                    </p>
                </CardContent>
            </Card>

        </main>
    );
}