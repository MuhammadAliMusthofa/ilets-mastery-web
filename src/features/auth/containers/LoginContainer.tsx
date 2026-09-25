"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Import skema validasi dari folder validator lu
import { loginSchema } from "../validator/validation";
import { useState } from "react";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/src/store/authStore";
import { isAdminRole, type AuthUser } from "@/src/models/auth";
import Link from "next/link";
import { AuthFrame, AuthNotice } from "../components/AuthFrame";

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
            setErrorMsg(error.response?.data?.message || "Couldn't sign in. Check your email and password.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthFrame title="Sign in to IELTS Vibe" description="Pick up your practice right where you left off.">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {errorMsg && <AuthNotice tone="error">{errorMsg}</AuthNotice>}

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[14px] font-medium text-slate-800">Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="name@email.com" className="h-12 rounded-xl px-4 text-[15px]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[14px] font-medium text-slate-800">Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" className="h-12 rounded-xl px-4 text-[15px]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" variant="dark" shape="pill" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in…" : "Sign in"}
                    </Button>
                </form>
            </Form>

            <p className="mt-8 text-[15px] text-slate-600">
                Don't have an account?{" "}
                <Link href="/register" className="font-medium text-slate-900 underline underline-offset-4 hover:text-primary-500">
                    Create one
                </Link>
            </p>
        </AuthFrame>
    );
}
