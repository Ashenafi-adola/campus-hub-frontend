"use client"
import React, { useState } from "react";
import { Lock, CheckCircle2 } from "lucide-react";
import { redirect, useSearchParams } from "next/navigation";
import { resetPasswordRequest } from "@/libs/api";

function PasswordStrengthBar({ password }: { password: string }) {
  const score = Math.min(
    3,
    Math.floor(password.length / 4) + (/[A-Z]/.test(password) ? 1 : 0)
  );
  const labels = ["Weak", "Medium", "Strong"];
  const colors = ["bg-red-500", "bg-emerald-500", "bg-emerald-600"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i <= score ? colors[score] : "bg-neutral-200"
            }`}
          />
        ))}
      </div>
      <p
        className={`mt-1 text-xs font-medium ${
          score === 0
            ? "text-red-500"
            : score === 1
            ? "text-emerald-600"
            : "text-emerald-700"
        }`}
      >
        {labels[score]} password strength
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);

  const params = useSearchParams();
  
  const token = params.get("token");
  if (!token) redirect("/signin");


  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = password.length >= 8 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await resetPasswordRequest({password: password, token: token})
    setDone(true);
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
            Choose a password
            <br />
            you&apos;ll actually remember.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-indigo-100">
            Make it something new — at least 8 characters, and not the one
            you used last time.
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
          {!done ? (
            <>
              <h2 className="text-2xl font-extrabold text-neutral-900">
                Set a new password
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Almost there — choose a new password for your account.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                        mismatch
                          ? "border-red-300 focus:ring-red-500/20 focus:border-red-400"
                          : "border-neutral-200 focus:ring-indigo-500/30 focus:border-indigo-500"
                      }`}
                    />
                  </div>
                  {mismatch && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      Passwords don&apos;t match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                >
                  Reset password
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>

              <h2 className="mt-5 text-2xl font-extrabold text-neutral-900">
                Password updated
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Your password has been reset. You can now log in with your
                new password.
              </p>

              <button className="mt-7 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
