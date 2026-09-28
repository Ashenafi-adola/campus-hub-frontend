"use client"
import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { forgotPasswordRequest } from "@/libs/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    await forgotPasswordRequest({email: email});
    setSending(false);
    setSent(true);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel — same as sign-up */}
      <div className="relative hidden w-[46%] shrink-0 overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-900 lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-indigo-600" fill="none">
                <path
                  d="M4 12l8-5 8 5-8 5-8-5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">CampusHub</span>
          </div>
        </div>

        <div className="relative z-10 px-10 pb-10">
          <h1 className="text-4xl font-extrabold leading-tight text-white">
            Locked out
            <br />
            happens to everyone.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-indigo-100">
            Enter your university email and we&apos;ll send you a link to get
            back into your account in under a minute.
          </p>

          <div className="mt-10 flex items-center gap-8">
            <div>
              <div className="text-2xl font-extrabold text-white">15k+</div>
              <div className="text-xs text-indigo-200">Active Students</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-2xl font-extrabold text-white">120+</div>
              <div className="text-xs text-indigo-200">University Hubs</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-2xl font-extrabold text-white">50k+</div>
              <div className="text-xs text-indigo-200">Resolved Qs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-sm">
          {!sent ? (
            <>
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>

              <h2 className="mt-4 text-2xl font-extrabold text-neutral-900">
                Forgot your password?
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                No worries — enter the email tied to your account and we&apos;ll
                send a reset link.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                    University Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sophia.m@stanford.edu"
                      className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  { sending ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-neutral-500">
                Remembered it after all?{" "}
                <Link href="/signin" className="font-semibold text-indigo-600 hover:underline">
                  Log in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>

              <h2 className="mt-5 text-2xl font-extrabold text-neutral-900">
                Check your inbox
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                We sent a reset link to{" "}
                <span className="font-semibold text-neutral-800">{email}</span>
                . Click the link to choose a new password.
              </p>

              <button
                onClick={() => setSent(false)}
                className="mt-7 w-full rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                Use a different email
              </button>

              <p className="mt-6 text-sm text-neutral-500">
                Didn&apos;t get it?{" "}
                <button
                  onClick={() => setSent(false)}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Resend
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
