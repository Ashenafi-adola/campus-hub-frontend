"use client";

import { useState } from "react";

import { SectionHeading, inputCls, labelCls } from "../settings-shared";

export function AccountPasswordSection({ notify }: { notify: (msg: string) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const score =
    (next.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(next) && /[0-9]/.test(next) ? 1 : 0) +
    (next.length >= 12 ? 1 : 0);
  const mismatch = confirm.length > 0 && next !== confirm;
  const canUpdatePw = current.length > 0 && next.length >= 8 && next === confirm && next !== current;

  return (
    <div className="border-t border-neutral-100 pt-6 dark:border-neutral-800">
      <SectionHeading title="Change password" description="Use at least 8 characters." />
      <div className="mt-3 space-y-4">
        <div>
          <label className={labelCls}>Current password</label>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>New password</label>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className={inputCls} />
          {next && (
            <div className="mt-2">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < Math.max(1, score)
                        ? score >= 2
                          ? "bg-emerald-500"
                          : "bg-red-500"
                        : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {score <= 1 ? "Weak" : score === 2 ? "Medium" : "Strong"} password
              </p>
            </div>
          )}
        </div>
        <div>
          <label className={labelCls}>Confirm new password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`${inputCls} ${mismatch ? "border-red-300 focus:border-red-400 focus:ring-red-500/20" : ""}`}
          />
          {mismatch && <p className="mt-1.5 text-xs font-medium text-red-500">Passwords don&apos;t match.</p>}
        </div>
        <button
          type="button"
          disabled={!canUpdatePw}
          onClick={() => {
            setCurrent("");
            setNext("");
            setConfirm("");
            notify("Password updated");
          }}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
        >
          Update password
        </button>
      </div>
    </div>
  );
}
