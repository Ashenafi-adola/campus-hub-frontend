"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Loader2, Plus } from "lucide-react";

export type PostingState =
  | { phase: "posting"; mode: "created" | "updated" }
  | { phase: "success"; mode: "created" | "updated"; postId?: number | string }
  | { phase: "error"; mode: "created" | "updated"; message: string; detail?: string };

type Props = {
  /** null closes the modal */
  state: PostingState | null;
  /** Changes the loading copy ("Uploading your images...") */
  hasImages?: boolean;
  /** Shown on the success dialog so people see what was published */
  postTitle?: string;
  /** Link for the "View post" button */
  viewHref?: string;
  /** Error dialog: close and go back to editing */
  onDismiss: () => void;
  /** Error dialog: send the same post again */
  onRetry?: () => void;
  /** Success after creating: clear the form and start a new post */
  onCreateAnother?: () => void;
  /** Success after editing: go back to the form */
  onContinueEditing?: () => void;
  onGoHome?: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const btnPrimary =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const btnSecondary =
  "flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";
const btnGhost =
  "w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100";

function Dialog({
  state,
  hasImages,
  postTitle,
  viewHref,
  onDismiss,
  onRetry,
  onCreateAnother,
  onContinueEditing,
  onGoHome,
}: Omit<Props, "state"> & { state: PostingState }) {
  const { phase, mode } = state;
  const created = mode === "created";

  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  // Pop-in animation for the status icon
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntered(false);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // "Taking longer than usual" hint
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (phase !== "posting") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, [phase]);

  // Lock page scroll and give the dialog focus
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Move focus to the main action when the result arrives
  useEffect(() => {
    if (phase === "posting") dialogRef.current?.focus();
    else primaryRef.current?.focus();
  }, [phase]);

  // Only the error dialog can be dismissed. While posting there's nothing to
  // dismiss, and after success the person picks what to do next.
  const dismissible = phase === "error";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) {
        onDismiss();
        return;
      }
      if (e.key === "Tab") {
        const items = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
        );
        if (items.length === 0) {
          e.preventDefault();
          dialogRef.current?.focus();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismissible, onDismiss]);

  const pop = `transition-all duration-300 ease-out ${
    entered ? "scale-100 opacity-100" : "scale-50 opacity-0"
  }`;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (dismissible && e.target === e.currentTarget) onDismiss();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role={phase === "error" ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        aria-busy={phase === "posting"}
        className="w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-2xl outline-none dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
      >
        {/* ------------------------------ Posting ------------------------------ */}
        {phase === "posting" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2
              id={titleId}
              className="mt-5 text-lg font-bold text-neutral-900 dark:text-neutral-50"
            >
              {created ? "Publishing your post..." : "Saving your changes..."}
            </h2>
            <p
              id={descId}
              className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400"
            >
              {hasImages
                ? "Uploading your images. This can take a moment."
                : "Hang tight, this only takes a second."}
            </p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-600" />
            </div>
            <p
              role="status"
              className={`mt-3 text-xs text-neutral-400 transition-opacity dark:text-neutral-500 ${
                slow ? "opacity-100" : "opacity-0"
              }`}
            >
              This is taking longer than usual. Please don&apos;t close this page.
            </p>
          </>
        )}

        {/* ------------------------------ Success ------------------------------ */}
        {phase === "success" && (
          <>
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 animate-[ping_900ms_cubic-bezier(0,0,0.2,1)_1] rounded-full bg-emerald-400/40"
              />
              <span
                className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ${pop}`}
              >
                <Check className="h-8 w-8" strokeWidth={3} />
              </span>
            </div>
            <h2
              id={titleId}
              className="mt-5 text-xl font-bold text-neutral-900 dark:text-neutral-50"
            >
              {created ? "Your post is live!" : "Post updated"}
            </h2>
            <p
              id={descId}
              className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400"
            >
              {created
                ? "Everyone in the community can see it now."
                : "Your changes have been saved."}
            </p>
            {postTitle && (
              <p className="mt-4 line-clamp-2 rounded-xl bg-neutral-50 px-4 py-2.5 text-sm font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                {postTitle}
              </p>
            )}

            <div className="mt-6 space-y-2.5">
              {viewHref ? (
                <Link
                  href={viewHref}
                  ref={(el) => {
                    primaryRef.current = el;
                  }}
                  className={btnPrimary}
                >
                  View post
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                onGoHome && (
                  <button
                    type="button"
                    ref={(el) => {
                      primaryRef.current = el;
                    }}
                    onClick={onGoHome}
                    className={btnPrimary}
                  >
                    Back to home
                  </button>
                )
              )}

              {created && onCreateAnother && (
                <button type="button" onClick={onCreateAnother} className={btnSecondary}>
                  <Plus className="h-4 w-4" />
                  Create another post
                </button>
              )}
              {!created && onContinueEditing && (
                <button type="button" onClick={onContinueEditing} className={btnSecondary}>
                  Keep editing
                </button>
              )}
              {viewHref && onGoHome && (
                <button type="button" onClick={onGoHome} className={btnGhost}>
                  Back to home
                </button>
              )}
            </div>
          </>
        )}

        {/* ------------------------------- Error ------------------------------- */}
        {phase === "error" && (
          <>
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 ${pop}`}
            >
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2
              id={titleId}
              className="mt-5 text-xl font-bold text-neutral-900 dark:text-neutral-50"
            >
              {created ? "Couldn't publish your post" : "Couldn't save your changes"}
            </h2>
            <p
              id={descId}
              className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400"
            >
              {state.message} Your draft is still here, nothing was lost.
            </p>
            {state.detail && (
              <p className="mt-3 break-words rounded-lg bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                {state.detail}
              </p>
            )}

            <div className="mt-6 space-y-2.5">
              {onRetry && (
                <button
                  type="button"
                  ref={(el) => {
                    primaryRef.current = el;
                  }}
                  onClick={onRetry}
                  className={btnPrimary}
                >
                  Try again
                </button>
              )}
              <button
                type="button"
                ref={(el) => {
                  if (!onRetry) primaryRef.current = el;
                }}
                onClick={onDismiss}
                className={btnSecondary}
              >
                Edit post
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PostStatusModal({ state, ...rest }: Props) {
  // Wait for the client so the portal never runs during SSR/hydration
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted || !state) return null;
  return createPortal(<Dialog state={state} {...rest} />, document.body);
}