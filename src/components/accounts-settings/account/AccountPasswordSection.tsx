"use client";

import { useState } from "react";

import { SectionHeading, inputCls, labelCls } from "../settings-shared";
import { PasswordStrengthBar } from "@/components/auth/signup/password-strength";
import { ChangePassword } from "@/libs/api";

export function AccountPasswordSection({ notify }: { notify: (msg: string) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && next !== confirm;
  const canUpdatePw = current.length > 0 && next.length >= 8 && next === confirm && next !== current;

  const save = async () => {
    await ChangePassword({old_password: current, new_password: next})
  }

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
          <PasswordStrengthBar password={next}/>
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
            save();
          }}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
        >
          Update password
        </button>
      </div>
    </div>
  );
}
