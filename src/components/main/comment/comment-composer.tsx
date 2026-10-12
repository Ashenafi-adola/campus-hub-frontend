"use client"

import { useState } from "react";


export function Composer({
  placeholder,
  autoFocus = false,
  onSubmit,
  onCancel,
  submitLabel = "Comment",
}: {
  placeholder: string;
  autoFocus?: boolean;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
      <textarea
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y bg-transparent px-3.5 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
      />
      <div className="flex items-center justify-between bg-neutral-50 px-3 py-2">
        <span className="text-xs text-neutral-400">Ctrl + Enter to post</span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-500 hover:bg-neutral-100"
            >
              Cancel
            </button>
          )}
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
