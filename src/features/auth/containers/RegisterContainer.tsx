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

import { PASSWORD_RULES, registerSchema } from "../validator/validation";
import { authService } from "../services/auth.service";
import { Check } from "lucide-react";
import { cn } from "@/src/libs/utils";

/**
 * Checklist syarat password yang ikut berubah saat diketik, supaya aturannya
 * terbaca sebelum tombol ditekan — bukan muncul sebagai error setelah gagal.
 */
function PasswordRules({ value }: { value: string }) {
    return (
        <ul className="mt-2 grid gap-1 sm:grid-cols-2" aria-label="Password requirements">
            {PASSWORD_RULES.map((rule) => {
                const met = rule.test(value ?? "");
                return (
                    <li key={rule.label} className={cn("flex items-center gap-1.5 text-[13px]", met ? "text-[#007a47]" : "text-slate-500")}>
                        <span
                            aria-hidden="true"
                            className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                                met ? "border-[#00c875] bg-[#00c875] text-white" : "border-slate-300"
                            )}
                        >
                            {met && <Check size={10} strokeWidth={3} />}
                        </span>
                        {rule.label}
                        <span className="sr-only">{met ? " — met" : " — not met yet"}</span>
                    </li>
                );
            })}
        </ul>
    );
}

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
        } catch (error: unknown) {
            console.error("Register Error:", error);
            // Pesan backend ditampilkan apa adanya: validatornya menyebut persis aturan yang dilanggar.
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setErrorMsg(message || "Couldn't create your account. Please try again.");
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
                                <PasswordRules value={field.value} />
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
