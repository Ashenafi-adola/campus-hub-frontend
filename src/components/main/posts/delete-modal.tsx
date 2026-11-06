"use client";

import { deletePost } from "@/libs/api";
import { Post } from "@/libs/types";
import { useRouter } from "next/navigation";
// components/DeletePostModal.tsx
// Confirmation dialog for deleting a post. Uses the native <dialog> element, so focus
// trapping, Escape-to-close and the backdrop come from the browser. Assumes Tailwind CSS.

import { useEffect, useRef, useState } from "react";

interface DeletePostModalProps {
  open: boolean;
  post: Post;
  answerCount?: number;
  onClose: () => void;
  /** Should throw (or reject) if the delete fails so the error shows in the modal. */
}

export default function DeletePostModal({
  open,
  post,
  answerCount = 0,
  onClose,
}: DeletePostModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const router = useRouter()
  // Sync the open prop with the native dialog.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setError(null);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      deletePost(post.id);
      router.refresh()
      onClose();
    } catch {
      setError("We couldn't delete this post. Check your connection and try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="delete-post-title"
      aria-describedby="delete-post-desc"
      // Escape key: block it while a delete is in flight.
      onCancel={(e) => {
        e.preventDefault();
        if (!deleting) onClose();
      }}
      // Click on the backdrop (the dialog element itself) closes it.
      onClick={(e) => {
        if (e.target === ref.current && !deleting) onClose();
      }}
      className="fixed m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-0 text-zinc-100 shadow-2xl backdrop:bg-black/70"
    >
      <div className="p-6">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full bg-red-950 text-red-300"
          aria-hidden
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M6 6l1 14h10l1-14" />
            <path d="M10 11v5M14 11v5" />
          </svg>
        </div>

        <h2 id="delete-post-title" className="mt-4 text-lg font-semibold text-white">
          Delete this post?
        </h2>
        <p id="delete-post-desc" className="mt-2 text-sm leading-relaxed text-zinc-400">
          <span className="font-medium text-zinc-200">&ldquo;{post.title}&rdquo;</span> will be removed
          {answerCount > 0
            ? ` along with its ${answerCount} ${answerCount === 1 ? "answer" : "answers"}`
            : ""}
          . You can&apos;t undo this.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-zinc-800 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          autoFocus
          className="h-10 rounded-full border border-zinc-700 px-5 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:opacity-50"
        >
          Keep post
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="h-10 min-w-28 rounded-full bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete post"}
        </button>
      </div>
    </dialog>
  );
}
