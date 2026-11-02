"use client";

import { CheckCircle2, Lock } from "lucide-react";

import {
  type Draft,
  SaveBar,
  inputCls,
  labelCls,
} from "../settings-shared";
import { AuthUser } from "@/libs/auth/types";

export function AccountIdentitySection({
  form,
  notify,
}: {
  form: Draft<AuthUser>;
  notify: (msg: string) => void;
}) {
  const { draft, update } = form;
  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(draft.username);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            University Email
          </label>
          { draft.is_verified &&
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          }
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="email"
            value={draft?.email}
            readOnly
            className={`${inputCls} cursor-not-allowed bg-neutral-50 pl-10 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400`}
          />
        </div>
        <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
          Your university email can&apos;t be changed. Contact support if you lost access to it.
        </p>
      </div>

      <div>
        <label className={labelCls}>Username</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400 dark:text-neutral-500">
            @
          </span>
          <input
            type="text"
            value={draft.username}
            maxLength={20}
            onChange={(e) => update({ username: e.target.value })}
            className={`${inputCls} pl-8 ${usernameValid ? "" : "border-red-300 focus:border-red-400 focus:ring-red-500/20"}`}
          />
        </div>
        <p
          className={`mt-1.5 text-xs ${
            usernameValid ? "text-neutral-400 dark:text-neutral-500" : "font-medium text-red-500"
          }`}
        >
          3 to 20 characters: letters, numbers and underscores.
        </p>
      </div>

      <SaveBar
        dirty={form.dirty}
        valid={usernameValid}
        onSave={() => {
          form.save();
          notify("Username updated");
        }}
        onDiscard={form.discard}
      />
    </div>
  );
}
