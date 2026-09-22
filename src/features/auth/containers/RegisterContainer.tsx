"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import Link from "next/link";
import { AuthFrame, AuthNotice } from "../components/AuthFrame";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { registerSchema } from "../validator/validation";
import { authService } from "../services/auth.service";

export default function RegisterContainer() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            full_name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        try {
            setIsLoading(true);
            setErrorMsg("");
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...registerData } = values;
            
            await authService.register(registerData);
            
            // Redirect ke halaman verifikasi akun
            router.push(`/verify?email=${encodeURIComponent(registerData.email)}&registered=true`);
        } catch (error: any) {
            console.error("Register Error:", error);
            setErrorMsg(error.response?.data?.message || "Couldn't create your account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthFrame
            title="Create your account"
            description="One account for both tracks: Basic to Hero and IELTS General Training."
            skill="LISTENING"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {errorMsg && <AuthNotice tone="error">{errorMsg}</AuthNotice>}

                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[14px] font-medium text-slate-800">Full name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your name as on your ID" className="h-12 rounded-xl px-4 text-[15px]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[14px] font-medium text-slate-800">Confirm password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" className="h-12 rounded-xl px-4 text-[15px]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" variant="dark" shape="pill" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating account…" : "Create account"}
                    </Button>
                </form>
            </Form>

            <p className="mt-8 text-[15px] text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-slate-900 underline underline-offset-4 hover:text-primary-500">
                    Sign in
                </Link>
            </p>
        </AuthFrame>
    );
}
