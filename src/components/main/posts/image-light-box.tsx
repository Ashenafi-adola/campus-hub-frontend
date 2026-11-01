"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, X } from "lucide-react";

type Props = {
  images: string[];
  /** Which image to show first */
  startIndex?: number;
  /** Shown in the top bar, e.g. the post title */
  title?: string;
  onClose: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SWIPE_THRESHOLD = 50;

/** One slide. Keyed by src so each image gets its own loading state. */
function Slide({ src, alt, hasThumbs }: { src: string; alt: string; hasThumbs: boolean }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      {!loaded && (
        <Loader2 className="absolute h-8 w-8 animate-spin text-white/60" aria-hidden />
      )}
      {/* Plain <img>: natural size, so clicking the empty space around it can close the viewer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={(el) => {
          // Cached images can finish loading before React attaches onLoad
          if (el?.complete && el.naturalWidth > 0) setLoaded(true);
        }}
        src={src}
        alt={alt}
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={`select-none rounded-lg object-contain shadow-2xl transition-opacity duration-300 ${
          hasThumbs
            ? "max-h-[calc(100dvh-10.5rem)]"
            : "max-h-[calc(100dvh-7rem)]"
        } max-w-full ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

export default function ImageLightbox({
  images,
  startIndex = 0,
  title,
  onClose,
}: Props) {
  const total = images.length;
  const [index, setIndex] = useState(
    Math.min(Math.max(startIndex, 0), Math.max(total - 1, 0))
  );

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const multiple = total > 1;

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total),
    [total]
  );

  /* Scroll lock (without the page jumping when the scrollbar disappears),
     initial focus, and focus restore */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocused?.focus?.();
    };
  }, []);

  /* Keyboard: Esc, arrows, Home/End, and a Tab focus trap */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          return;
        case "ArrowRight":
          if (multiple) go(1);
          return;
        case "ArrowLeft":
          if (multiple) go(-1);
          return;
        case "Home":
          if (multiple) setIndex(0);
          return;
        case "End":
          if (multiple) setIndex(total - 1);
          return;
        case "Tab": {
          const items = Array.from(
            dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
          );
          if (items.length === 0) return;
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
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, multiple, onClose, total]);

  /* Warm the cache for the neighbours so next/prev feels instant */
  useEffect(() => {
    if (!multiple) return;
    [(index + 1) % total, (index - 1 + total) % total].forEach((i) => {
      const img = new window.Image();
      img.src = images[i];
    });
  }, [index, images, multiple, total]);

  /* Keep the active thumbnail in view */
  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [index]);

  /* Swipe */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !multiple) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
  };

  if (total === 0) return null;

  const arrow =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:h-12 sm:w-12";

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      // React events bubble through portals, so keep clicks away from the post card
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[60] flex flex-col bg-black/90 backdrop-blur-sm"
    >
      {/* Announce position changes to screen readers */}
      <p className="sr-only" aria-live="polite">
        Image {index + 1} of {total}
      </p>

      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
        <span className="min-w-[3.5rem] font-mono text-sm text-white/80">
          {multiple ? `${index + 1} / ${total}` : ""}
        </span>
        {title && (
          <span className="hidden min-w-0 flex-1 truncate text-center text-sm font-medium text-white/90 sm:block">
            {title}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <a
            href={images[index]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open original in a new tab"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close image viewer"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Stage: click the empty space to close, swipe to navigate */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {multiple && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className={`${arrow} left-2 sm:left-5`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <Slide
          key={images[index]}
          src={images[index]}
          alt={title ? `${title}, image ${index + 1} of ${total}` : `Image ${index + 1} of ${total}`}
          hasThumbs={multiple}
        />

        {multiple && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className={`${arrow} right-2 sm:right-5`}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {multiple && (
        <div className="flex justify-center px-4 pb-4 pt-2">
          <div className="flex max-w-full gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((src, i) => (
              <button
                key={src + i}
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-black transition-all ${
                  i === index
                    ? "opacity-100 ring-white"
                    : "opacity-50 ring-transparent hover:opacity-90"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}