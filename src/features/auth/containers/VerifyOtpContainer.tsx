"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, Suspense } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { AuthFrame, AuthNotice } from "../components/AuthFrame";
import { OTP_LENGTH, OtpInput } from "../components/OtpInput";

import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import { gsap, prefersReducedMotion, useGSAP } from "@/src/_global/motion/gsap";

import { verifyOtpSchema } from "../validator/validation";
import { authService } from "../services/auth.service";

/** idle: menunggu ketikan · merging: kotak menyatu · checking: menunggu API · success/error: hasil. */
type Phase = "idle" | "merging" | "checking" | "success" | "error";

const readErrorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

/**
 * Lama minimal bulatan berputar. Tanpa ini, jawaban server yang datang dalam
 * puluhan milidetik membuat animasinya cuma berkedip.
 */
const MIN_SPIN_MS = 600;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email") || "";
  const isRegistered = searchParams.get("registered") === "true";

  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(
    isRegistered ? "Your account has been created. Activate it by entering the PIN we sent to your email." : ""
  );

  const stageRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<gsap.core.Tween | null>(null);

  const busy = phase === "merging" || phase === "checking" || phase === "success";

  const { contextSafe } = useGSAP({ scope: stageRef });

  const boxes = () => gsap.utils.toArray<HTMLElement>("[data-otp-box]", stageRef.current);

  /**
   * Keenam kotak berputar mengelilingi titik tengah sambil mengecil, lalu
   * lebur menjadi satu bulatan yang berputar selama API dihubungi.
   */
  const mergeIn = contextSafe(() => {
    const ring = stageRef.current?.querySelector<HTMLElement>("[data-otp-ring]");
    const items = boxes();
    if (!ring || items.length === 0 || !orbRef.current) return Promise.resolve();

    const ringBox = ring.getBoundingClientRect();
    const centerX = ringBox.left + ringBox.width / 2;
    const centerY = ringBox.top + ringBox.height / 2;

    // Jarak tiap kotak ke titik tengah diukur sebelum animasi mulai; ring yang
    // ikut berputar membuat jalurnya melengkung, bukan lurus.
    const offsets = items.map((item) => {
      const box = item.getBoundingClientRect();
      return { x: centerX - (box.left + box.width / 2), y: centerY - (box.top + box.height / 2) };
    });

    const timeline = gsap.timeline();
    timeline
      .to(items, {
        x: (index: number) => offsets[index].x,
        y: (index: number) => offsets[index].y,
        scale: 0.35,
        rotate: -180,
        duration: 0.65,
        ease: "power2.inOut",
        stagger: { each: 0.04, from: "edges" },
      })
      .to(ring, { rotate: 360, duration: 0.75, ease: "power2.inOut" }, 0)
      .to(items, { opacity: 0, duration: 0.18 }, 0.55)
      .set(ring, { rotate: 0 })
      .fromTo(
        orbRef.current,
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.28, ease: "back.out(2)" },
        0.6
      );

    return timeline.then();
  });

  /** Kotak kembali ke tempatnya, lalu bergetar sekali sebagai tanda gagal. */
  const mergeOut = contextSafe(() => {
    const ring = stageRef.current?.querySelector<HTMLElement>("[data-otp-ring]");
    const items = boxes();
    if (!ring || items.length === 0) return Promise.resolve();

    const timeline = gsap.timeline();
    if (orbRef.current) timeline.to(orbRef.current, { scale: 0.4, opacity: 0, duration: 0.2 });
    timeline
      .to(items, {
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        opacity: 1,
        duration: 0.45,
        ease: "power3.out",
        stagger: { each: 0.035, from: "center" },
      })
      .fromTo(ring, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1.1, 0.35)" }, "-=0.2");

    return timeline.then();
  });

  const startSpin = contextSafe(() => {
    if (!orbRef.current) return;
    spinRef.current = gsap.to(orbRef.current.querySelector("[data-orb-spin]"), {
      rotate: 360,
      duration: 0.9,
      repeat: -1,
      ease: "none",
    });
  });

  const stopSpin = () => {
    spinRef.current?.kill();
    spinRef.current = null;
  };

  const celebrate = contextSafe(() => {
    if (!orbRef.current) return Promise.resolve();
    return gsap.fromTo(orbRef.current, { scale: 0.8 }, { scale: 1, duration: 0.45, ease: "back.out(2.4)" }).then();
  });

  async function handleVerify(code: string) {
    if (busy) return;

    if (!emailParam) {
      setErrorMsg("We couldn't find your email. Please go back to the sign-up page.");
      return;
    }

    const parsed = verifyOtpSchema.safeParse({ otp: code });
    if (!parsed.success) {
      setSuccessMsg("");
      setErrorMsg(parsed.error.issues[0]?.message ?? "The PIN must be 6 digits.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    const reduced = prefersReducedMotion();

    // Animasi dulu: kotak menyatu jadi satu, baru API dihubungi.
    if (!reduced) {
      setPhase("merging");
      await mergeIn();
      startSpin();
    }
    setPhase("checking");
    const startedAt = Date.now();
    const holdSpin = () => (reduced ? Promise.resolve() : wait(Math.max(0, MIN_SPIN_MS - (Date.now() - startedAt))));

    try {
      await authService.verifyOtp({ email: emailParam, otp: parsed.data.otp });
      await holdSpin();
      stopSpin();
      setPhase("success");
      if (!reduced) await celebrate();
      router.push("/login?verified=true");
    } catch (error: unknown) {
      console.error("Verification Error:", error);
      await holdSpin();
      stopSpin();
      setErrorMsg(readErrorMessage(error, "Couldn't verify the PIN. Please try again."));
      setPhase("error");
      if (!reduced) await mergeOut();
      setPhase("idle");
      setOtp("");
      stageRef.current?.querySelector<HTMLInputElement>("[data-otp-box]")?.focus();
    }
  }

  async function handleResendOtp() {
    if (!emailParam || busy) return;

    try {
      setIsResending(true);
      setErrorMsg("");
      setSuccessMsg("");

      await authService.resendOtp({ email: emailParam });
      setSuccessMsg("A new PIN has been sent to your email.");
    } catch (error: unknown) {
      console.error("Resend Error:", error);
      setErrorMsg(readErrorMessage(error, "Couldn't resend the PIN."));
    } finally {
      setIsResending(false);
    }
  }

  const statusText =
    phase === "merging" || phase === "checking" ? "Verifying your PIN…" : phase === "success" ? "Verified" : "";

  return (
    <AuthFrame
      title="Verify your account"
      description={
        <>
          Enter the {OTP_LENGTH}-digit PIN we sent to{" "}
          <span className="font-medium text-slate-900">{emailParam || "your email"}</span>.
        </>
      }
      skill="WRITING"
    >
      <div className="space-y-5">
        {successMsg && <AuthNotice tone="success">{successMsg}</AuthNotice>}
        {errorMsg && <AuthNotice tone="error">{errorMsg}</AuthNotice>}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleVerify(otp);
          }}
          className="space-y-6"
        >
          <div ref={stageRef} className="relative">
            <OtpInput
              value={otp}
              onChange={(next) => {
                setOtp(next);
                if (errorMsg) setErrorMsg("");
              }}
              onComplete={(next) => handleVerify(next)}
              disabled={busy}
              invalid={phase === "error"}
              autoFocus
            />

            {/* Bulatan hasil peleburan keenam kotak. */}
            <div
              ref={orbRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0"
            >
              <span
                className={cn(
                  "flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-colors duration-300",
                  phase === "success" ? "bg-[#00c875]" : "bg-slate-900"
                )}
              >
                {phase === "success" ? (
                  <Check size={24} strokeWidth={3} />
                ) : (
                  <span data-orb-spin className="flex">
                    <Loader2 size={22} strokeWidth={2.5} />
                  </span>
                )}
              </span>
            </div>
          </div>

          <p role="status" aria-live="polite" className="sr-only">
            {statusText}
          </p>

          <Button
            type="submit"
            variant="dark"
            shape="pill"
            size="lg"
            className="w-full"
            disabled={busy || !emailParam || otp.length < OTP_LENGTH}
          >
            {phase === "success" ? "Verified" : busy ? "Verifying…" : "Verify account"}
          </Button>
        </form>
      </div>

      <div className="mt-8 space-y-2 text-[15px] text-slate-600">
        <p>
          Didn&apos;t get the PIN?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending || busy || !emailParam}
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
