"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import { inputCls } from "../settings-shared";

export function DeleteAccountModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [text, setText] = useState("");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl border border-neutral-100 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Delete your account?
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          This permanently removes your profile, questions, answers and saved posts. This can&apos;t be undone. Type {" "}
          <span className="font-bold text-neutral-800 dark:text-neutral-200">DELETE</span> to confirm.
        </p>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="DELETE"
          className={`${inputCls} mt-4`}
        />
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={text !== "DELETE"}
            className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
