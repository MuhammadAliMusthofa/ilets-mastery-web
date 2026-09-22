"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, Suspense } from "react";
import Link from "next/link";
import { AuthFrame, AuthNotice } from "../components/AuthFrame";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { verifyOtpSchema } from "../validator/validation";
import { authService } from "../services/auth.service";

function VerifyOtpForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const emailParam = searchParams.get("email") || "";
    const isRegistered = searchParams.get("registered") === "true";

    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState(isRegistered ? "Your account has been created. Activate it by entering the PIN we sent to your email." : "");

    const form = useForm<z.infer<typeof verifyOtpSchema>>({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: {
            otp: "",
        },
    });

    async function onSubmit(values: z.infer<typeof verifyOtpSchema>) {
        if (!emailParam) {
            setErrorMsg("We couldn't find your email. Please go back to the sign-up page.");
            return;
        }

        try {
            setIsLoading(true);
            setErrorMsg("");
            setSuccessMsg("");
            
            await authService.verifyOtp({ email: emailParam, otp: values.otp });
            
            // Redirect ke halaman login setelah berhasil verifikasi
            router.push("/login?verified=true");
        } catch (error: any) {
            console.error("Verification Error:", error);
            setErrorMsg(error.response?.data?.message || "Couldn't verify the PIN. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleResendOtp() {
        if (!emailParam) return;
        
        try {
            setIsResending(true);
            setErrorMsg("");
            setSuccessMsg("");
            
            await authService.resendOtp({ email: emailParam });
            setSuccessMsg("A new PIN has been sent to your email.");
        } catch (error: any) {
            console.error("Resend Error:", error);
            setErrorMsg(error.response?.data?.message || "Couldn't resend the PIN.");
        } finally {
            setIsResending(false);
        }
    }

    return (
        <AuthFrame
            title="Verify your account"
            description={
                <>
                    Enter the 6-digit PIN we sent to{" "}
                    <span className="font-medium text-slate-900">{emailParam || "your email"}</span>.
                </>
            }
            skill="WRITING"
        >
            <div className="space-y-5">
                {successMsg && <AuthNotice tone="success">{successMsg}</AuthNotice>}
                {errorMsg && <AuthNotice tone="error">{errorMsg}</AuthNotice>}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[14px] font-medium text-slate-800">6-digit PIN</FormLabel>
                                <FormControl>
                                    <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" className="h-12 rounded-xl px-4 text-[15px] tabular text-center text-[22px] tracking-[0.4em]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" variant="dark" shape="pill" size="lg" className="w-full" disabled={isLoading || !emailParam}>
                        {isLoading ? "Verifying…" : "Verify account"}
                    </Button>
                    </form>
                </Form>
            </div>

            <div className="mt-8 space-y-2 text-[15px] text-slate-600">
                <p>
                    Didn't get the PIN?{" "}
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isResending || !emailParam}
                        className="font-medium text-slate-900 underline underline-offset-4 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isResending ? "Resending…" : "Resend"}
                    </button>
                </p>
                <p>
                    <Link href="/login" className="hover:text-slate-900 hover:underline">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </AuthFrame>
    );
}

export default function VerifyOtpContainer() {
    // Suspense diperlukan karena useSearchParams() memaksa render di klien.
    return (
        <Suspense fallback={null}>
            <VerifyOtpForm />
        </Suspense>
    );
}
