"use client"

import React, { useRef, useState, useEffect } from "react";
import { Mail, RotateCw } from "lucide-react";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function VerifyEmailForm({email}:{email: string}) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown === 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    pasted
      .slice(0, CODE_LENGTH)
      .split("")
      .forEach((d, i) => (next[i] = d));
    setCode(next);
    const lastIndex = Math.min(pasted.length, CODE_LENGTH) - 1;
    inputsRef.current[lastIndex]?.focus();
  };

  const complete = code.every((d) => d !== "");

  return (
    <div className="flex flex-1 items-center justify-center bg-white px-6 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
          <Mail className="h-6 w-6 text-indigo-600" />
        </div>

        <h2 className="mt-5 text-2xl font-extrabold text-neutral-900">
          Verify your email
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-neutral-800">
            {email}
          </span>
          . Enter it below to confirm your account.
        </p>

        <div className="mt-7 flex justify-center gap-2.5">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="h-14 w-11 rounded-xl border border-neutral-200 text-center text-xl font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          ))}
        </div>

        <button
          disabled={!complete}
          className="mt-7 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          Verify Account
        </button>

        <div className="mt-5 text-sm text-neutral-500">
          {cooldown > 0 ? (
            <span>
              Resend code in{" "}
              <span className="font-mono font-semibold text-neutral-700">
                {cooldown}s
              </span>
            </span>
          ) : (
            <button
              onClick={() => setCooldown(RESEND_SECONDS)}
              className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:underline"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Resend code
            </button>
          )}
        </div>

        <p className="mt-8 text-sm text-neutral-500">
          Wrong email?{" "}
          <a href="#" className="font-semibold text-indigo-600 hover:underline">
            Go back
          </a>
        </p>
      </div>
    </div>
  );
}
