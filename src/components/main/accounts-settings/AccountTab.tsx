"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { AccountIdentitySection } from "./account/AccountIdentitySection";
import { AccountConnectedAccounts } from "./account/AccountConnectedAccounts";
import { AccountPasswordSection } from "./account/AccountPasswordSection";
import { DeleteAccountModal } from "./account/DeleteAccountModal";
import { type AccountForm, type Draft } from "./settings-shared";

export function AccountTab({ form, email, notify }: { form: Draft<AccountForm>; email: string; notify: (msg: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="space-y-8">
      <AccountIdentitySection form={form} email={email} notify={notify} />
      <AccountPasswordSection notify={notify} />
      <AccountConnectedAccounts notify={notify} />

      <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 dark:border-red-900 dark:bg-red-950/30">
        <h3 className="text-sm font-bold text-red-700">Danger zone</h3>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Delete account</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Permanently remove your profile and all of your content.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDeleting(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {deleting && (
        <DeleteAccountModal
          onClose={() => setDeleting(false)}
          onConfirm={() => {
            setDeleting(false);
            notify("Account deletion requested");
          }}
        />
      )}
    </div>
  );
}
