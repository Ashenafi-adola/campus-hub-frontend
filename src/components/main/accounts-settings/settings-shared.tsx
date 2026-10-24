"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type TabId = "profile" | "account" | "notifications" | "privacy" | "appearance";

export const TABS: { id: TabId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
  { id: "appearance", label: "Appearance" },
];

export const UNIVERSITIES = [
  "Stanford University",
  "MIT",
  "UC Berkeley",
  "UCLA",
  "Harvard University",
  "Carnegie Mellon University",
  "Georgia Tech",
  "UT Austin",
  "NYU",
  "Other",
];

export const MAX_BIO = 200;

export const labelCls =
  "mb-1.5 block text-sm font-semibold text-neutral-800 dark:text-neutral-200";
export const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500";

export function Switch({
  checked,
  onChange,
  label,
  small = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  small?: boolean;
}) {
  const track = small ? "h-5 w-9" : "h-6 w-11";
  const knob = small ? "h-4 w-4" : "h-5 w-5";
  const on = small ? "translate-x-5" : "translate-x-5";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative ${track} shrink-0 rounded-full transition-colors ${
        checked ? "bg-indigo-600" : "bg-neutral-200 dark:bg-neutral-700"
      }`}
    >
      <span
        className={`absolute top-0.5 ${knob} rounded-full left-0 bg-white shadow transition-transform ${
          checked ? on : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            value === o.id
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
              : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} appearance-none pr-10`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
    </div>
  );
}

export function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-100 py-3.5 last:border-0 dark:border-neutral-800">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{title}</div>
        {description && (
          <div className="mt-0.5 text-xs leading-snug text-neutral-500 dark:text-neutral-400">
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-2">
      <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      )}
    </div>
  );
}

export function SaveBar({
  dirty,
  valid = true,
  onSave,
  onDiscard,
}: {
  dirty: boolean;
  valid?: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || !valid}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
      >
        Save Changes
      </button>
      {dirty && (
        <>
          <button
            type="button"
            onClick={onDiscard}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            Discard
          </button>
          <span className="text-xs text-neutral-400">Unsaved changes</span>
        </>
      )}
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
      <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
      {message}
    </div>
  );
}

export function useDraft<T extends object>(initial: T) {
  const [saved, setSaved] = useState<T>(initial);
  const [draft, setDraft] = useState<T>(initial);
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  return {
    saved,
    draft,
    dirty,
    update: (patch: Partial<T>) => setDraft((d) => ({ ...d, ...patch })),
    save: () => setSaved(draft),
    discard: () => setDraft(saved),
  };
}

export type Draft<T extends object> = ReturnType<typeof useDraft<T>>;

export function useScrollEdges() {
  const ref = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  return { ref, edges };
}

export interface ProfileForm {
  displayName: string;
  university: string;
  bio: string;
  avatarUrl: string | null;
}

export interface AccountForm {
  username: string;
}

export type Channel = "inApp" | "email" | "push";
export type NotifKey = "answers" | "replies" | "upvotes" | "announcements" | "digest";

export const CHANNELS: { id: Channel; label: string }[] = [
  { id: "inApp", label: "In-app" },
  { id: "email", label: "Email" },
  { id: "push", label: "Push" },
];

export const NOTIF_ROWS: { key: NotifKey; label: string; description: string }[] = [
  {
    key: "answers",
    label: "Answers to my questions",
    description: "When someone answers a question you asked",
  },
  {
    key: "replies",
    label: "Replies to my comments",
    description: "When someone replies in a thread you're in",
  },
  {
    key: "upvotes",
    label: "Upvotes and badges",
    description: "Milestones on your posts and new achievements",
  },
  {
    key: "announcements",
    label: "Community announcements",
    description: "Updates from moderators of your communities",
  },
  {
    key: "digest",
    label: "Weekly digest",
    description: "A summary of the best posts in your communities",
  },
];

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export type Visibility = "public" | "university" | "private";
export type Messages = "everyone" | "communities" | "nobody";

export interface PrivacyForm {
  visibility: Visibility;
  showUniversity: boolean;
  showActivity: boolean;
  showOnline: boolean;
  showReputation: boolean;
  messages: Messages;
}

export const VISIBILITY_OPTIONS: {
  id: Visibility;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "public",
    label: "Public",
    description: "Anyone on CampusHub can view your profile",
    icon: ({ className }: { className?: string }) => <span className={className}>🌐</span>,
  },
  {
    id: "university",
    label: "My university",
    description: "Only students from your university can view it",
    icon: ({ className }: { className?: string }) => <span className={className}>🎓</span>,
  },
  {
    id: "private",
    label: "Only me",
    description: "Your profile is hidden from everyone else",
    icon: ({ className }: { className?: string }) => <span className={className}>🔒</span>,
  },
];

export const ACCENTS = [
  { id: "indigo", label: "Indigo", hex: "#4f46e5" },
  { id: "emerald", label: "Emerald", hex: "#059669" },
  { id: "rose", label: "Rose", hex: "#e11d48" },
  { id: "amber", label: "Amber", hex: "#d97706" },
  { id: "sky", label: "Sky", hex: "#0284c7" },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];
export type Theme = "light" | "dark" | "system";
export type Density = "comfortable" | "compact";
export type TextSize = "small" | "default" | "large";

export interface AppearanceForm {
  theme: Theme;
  accent: AccentId;
  density: Density;
  textSize: TextSize;
  language: string;
}

export interface NotifForm {
  paused: boolean;
  prefs: Record<NotifKey, Record<Channel, boolean>>;
  digestDay: string;
  quietHours: boolean;
  quietFrom: string;
  quietTo: string;
}

export const THEMES: {
  id: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  preview: React.CSSProperties;
  bar: string;
}[] = [
  {
    id: "light",
    label: "Light",
    icon: ({ className }: { className?: string }) => <span className={className}>☀️</span>,
    preview: { background: "#ffffff" },
    bar: "#e5e7eb",
  },
  {
    id: "dark",
    label: "Dark",
    icon: ({ className }: { className?: string }) => <span className={className}>🌙</span>,
    preview: { background: "#0f172a" },
    bar: "#334155",
  },
  {
    id: "system",
    label: "System",
    icon: ({ className }: { className?: string }) => <span className={className}>🖥️</span>,
    preview: { background: "linear-gradient(120deg,#ffffff 50%,#0f172a 50%)" },
    bar: "#94a3b8",
  },
];

export const LANGUAGES = ["English", "አማርኛ (Amharic)", "Español", "Français"];
