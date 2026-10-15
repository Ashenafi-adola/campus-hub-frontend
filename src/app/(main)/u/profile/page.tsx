"use client"
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  BookOpen,
  Mail,
  Check,
  CheckCircle2,
  Lock,
  Globe,
  GraduationCap,
  Sun,
  Moon,
  Monitor,
  Download,
  Trash2,
  AlertTriangle,
  Apple,
  X,
} from "lucide-react";
import { Avatar } from "@/components/shared/ui";
import { AuthContext } from "@/context/auth-context";

/* ================================================================= */
/*  Types & constants                                                */
/* ================================================================= */

type TabId = "profile" | "account" | "notifications" | "privacy" | "appearance";

const TABS: { id: TabId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
  { id: "appearance", label: "Appearance" },
];

const UNIVERSITIES = [
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

const MAX_BIO = 200;

/* ================================================================= */
/*  Shared helpers & small components                                */
/* ================================================================= */

const labelCls = "mb-1.5 block text-sm font-semibold text-neutral-800";
const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

function Switch({
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
        checked ? "bg-indigo-600" : "bg-neutral-200"
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

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg bg-neutral-100 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            value === o.id
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SelectField({
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
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
    </div>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-100 py-3.5 last:border-0">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-neutral-800">{title}</div>
        {description && (
          <div className="mt-0.5 text-xs leading-snug text-neutral-500">
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-2">
      <h2 className="text-base font-bold text-neutral-900">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
      )}
    </div>
  );
}

function SaveBar({
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
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
      >
        Save Changes
      </button>
      {dirty && (
        <>
          <button
            type="button"
            onClick={onDiscard}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            Discard
          </button>
          <span className="text-xs text-neutral-400">Unsaved changes</span>
        </>
      )}
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
      <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
      {message}
    </div>
  );
}

/**
 * Draft/saved state for one settings tab.
 * `dirty` drives the Save button and the dot next to the tab name.
 */
function useDraft<T extends object>(initial: T) {
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

type Draft<T extends object> = ReturnType<typeof useDraft<T>>;

/** Tracks whether a horizontally scrollable element has more content on either side. */
function useScrollEdges() {
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

/* ================================================================= */
/*  PROFILE tab                                                      */
/* ================================================================= */

interface ProfileForm {
  displayName: string;
  university: string;
  bio: string;
  avatarUrl: string | null;
}

function ProfileTab({
  form,
  onSaved,
}: {
  form: Draft<ProfileForm>;
  onSaved: () => void;
}) {
  const { draft, update } = form;
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const nameValid = draft.displayName.trim().length >= 2;
  const { user } = useContext(AuthContext);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setAvatarError("Use a JPG or PNG image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("That file is over 2MB.");
      return;
    }
    setAvatarError(null);
    update({ avatarUrl: URL.createObjectURL(file) });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Avatar Image</label>
        <div className="flex items-center gap-4">
          <Avatar
            user={user}
            size="h-16 w-16"
            textSize="text-xl"
          />
          <div>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                Upload New
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={onAvatarChange}
                />
              </label>
              <button
                type="button"
                disabled={!draft.avatarUrl}
                onClick={() => {
                  setAvatarError(null);
                  update({ avatarUrl: null });
                }}
                className="text-sm font-semibold text-red-500 hover:underline disabled:cursor-not-allowed disabled:text-neutral-300 disabled:no-underline"
              >
                Remove
              </button>
            </div>
            <p
              className={`mt-1.5 text-xs ${
                avatarError ? "text-red-500" : "text-neutral-400"
              }`}
            >
              {avatarError ?? "JPG or PNG. Max size 2MB"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Display Name</label>
        <input
          type="text"
          value={draft.displayName}
          maxLength={40}
          onChange={(e) => update({ displayName: e.target.value })}
          className={`${inputCls} ${
            nameValid ? "" : "border-red-300 focus:border-red-400 focus:ring-red-500/20"
          }`}
        />
        {!nameValid && (
          <p className="mt-1.5 text-xs font-medium text-red-500">
            Display name must be at least 2 characters.
          </p>
        )}
      </div>

      <div>
        <label className={labelCls}>University</label>
        <SelectField
          value={draft.university}
          onChange={(v) => update({ university: v })}
          options={UNIVERSITIES}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-800">Bio</label>
          <span className="text-xs text-neutral-400">
            {draft.bio.length}/{MAX_BIO}
          </span>
        </div>
        <textarea
          value={draft.bio}
          maxLength={MAX_BIO}
          rows={4}
          onChange={(e) => update({ bio: e.target.value })}
          className={`${inputCls} resize-y`}
        />
      </div>

      <SaveBar
        dirty={form.dirty}
        valid={nameValid}
        onSave={() => {
          form.save();
          onSaved();
        }}
        onDiscard={form.discard}
      />
    </div>
  );
}

/* ================================================================= */
/*  ACCOUNT tab                                                      */
/* ================================================================= */

interface AccountForm {
  username: string;
}

function passwordScore(pw: string) {
  return (
    (pw.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 1 : 0) +
    (pw.length >= 12 ? 1 : 0)
  );
}

function DeleteAccountModal({
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
        className="relative w-full max-w-sm rounded-3xl border border-neutral-100 bg-white p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-neutral-900">
          Delete your account?
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
          This permanently removes your profile, questions, answers and saved
          posts. This can&apos;t be undone. Type{" "}
          <span className="font-bold text-neutral-800">DELETE</span> to
          confirm.
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
            className="flex-1 rounded-full border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={text !== "DELETE"}
            className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountTab({
  form,
  email,
  notify,
}: {
  form: Draft<AccountForm>;
  email: string;
  notify: (msg: string) => void;
}) {
  const { draft, update } = form;
  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(draft.username);

  // password form
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const score = passwordScore(next);
  const mismatch = confirm.length > 0 && next !== confirm;
  const canUpdatePw =
    current.length > 0 && next.length >= 8 && next === confirm && next !== current;

  // connected accounts
  const [google, setGoogle] = useState<string | null>("alex.j@gmail.com");
  const [apple, setApple] = useState<string | null>(null);

  // danger zone
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="space-y-8">
      {/* Email + username */}
      <div className="space-y-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-semibold text-neutral-800">
              University Email
            </label>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="email"
              value={email}
              readOnly
              className={`${inputCls} cursor-not-allowed bg-neutral-50 pl-10 text-neutral-500`}
            />
          </div>
          <p className="mt-1.5 text-xs text-neutral-400">
            Your university email can&apos;t be changed. Contact support if you lost
            access to it.
          </p>
        </div>

        <div>
          <label className={labelCls}>Username</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
              @
            </span>
            <input
              type="text"
              value={draft.username}
              maxLength={20}
              onChange={(e) => update({ username: e.target.value })}
              className={`${inputCls} pl-8 ${
                usernameValid
                  ? ""
                  : "border-red-300 focus:border-red-400 focus:ring-red-500/20"
              }`}
            />
          </div>
          <p
            className={`mt-1.5 text-xs ${
              usernameValid ? "text-neutral-400" : "font-medium text-red-500"
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

      {/* Password */}
      <div className="border-t border-neutral-100 pt-6">
        <SectionHeading
          title="Change password"
          description="Use at least 8 characters."
        />
        <div className="mt-3 space-y-4">
          <div>
            <label className={labelCls}>Current password</label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>New password</label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={inputCls}
            />
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
                          : "bg-neutral-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs font-medium text-neutral-500">
                  {score <= 1 ? "Weak" : score === 2 ? "Medium" : "Strong"}{" "}
                  password
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
              className={`${inputCls} ${
                mismatch
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                  : ""
              }`}
            />
            {mismatch && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                Passwords don&apos;t match.
              </p>
            )}
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
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            Update password
          </button>
        </div>
      </div>

      {/* Connected accounts */}
      <div className="border-t border-neutral-100 pt-6">
        <SectionHeading
          title="Connected accounts"
          description="Sign in faster with a linked account."
        />
        <div className="mt-2">
          <SettingRow
            title="Google"
            description={google ? `Connected as ${google}` : "Not connected"}
          >
            <button
              onClick={() => {
                setGoogle(google ? null : "alex.j@gmail.com");
                notify(google ? "Google disconnected" : "Google connected");
              }}
              className="shrink-0 rounded-lg border border-neutral-200 px-3.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              {google ? "Disconnect" : "Connect"}
            </button>
          </SettingRow>
          <SettingRow
            title="Apple"
            description={apple ? `Connected as ${apple}` : "Not connected"}
          >
            <button
              onClick={() => {
                setApple(apple ? null : "alex@icloud.com");
                notify(apple ? "Apple disconnected" : "Apple connected");
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 px-3.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <Apple className="h-3.5 w-3.5" />
              {apple ? "Disconnect" : "Connect"}
            </button>
          </SettingRow>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
        <h3 className="text-sm font-bold text-red-700">Danger zone</h3>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-neutral-800">
              Delete account
            </div>
            <div className="text-xs text-neutral-500">
              Permanently remove your profile and all of your content.
            </div>
          </div>
          <button
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

/* ================================================================= */
/*  NOTIFICATIONS tab                                                */
/* ================================================================= */

type Channel = "inApp" | "email" | "push";
type NotifKey = "answers" | "replies" | "upvotes" | "announcements" | "digest";

const CHANNELS: { id: Channel; label: string }[] = [
  { id: "inApp", label: "In-app" },
  { id: "email", label: "Email" },
  { id: "push", label: "Push" },
];

const NOTIF_ROWS: { key: NotifKey; label: string; description: string }[] = [
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

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface NotifForm {
  paused: boolean;
  prefs: Record<NotifKey, Record<Channel, boolean>>;
  digestDay: string;
  quietHours: boolean;
  quietFrom: string;
  quietTo: string;
}

function NotificationsTab({
  form,
  onSaved,
}: {
  form: Draft<NotifForm>;
  onSaved: () => void;
}) {
  const { draft, update } = form;

  const setPref = (key: NotifKey, ch: Channel, value: boolean) =>
    update({
      prefs: { ...draft.prefs, [key]: { ...draft.prefs[key], [ch]: value } },
    });

  return (
    <div className="space-y-6">
      <SettingRow
        title="Pause all notifications"
        description="Mute everything until you turn this back off"
      >
        <Switch
          checked={draft.paused}
          onChange={(v) => update({ paused: v })}
          label="Pause all notifications"
        />
      </SettingRow>

      <div
        className={`transition-opacity ${
          draft.paused ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <div className="grid grid-cols-[1fr_repeat(3,4.25rem)] items-center border-b border-neutral-100 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          <span>Notify me about</span>
          {CHANNELS.map((c) => (
            <span key={c.id} className="text-center">
              {c.label}
            </span>
          ))}
        </div>

        {NOTIF_ROWS.map((row) => (
          <div
            key={row.key}
            className="grid grid-cols-[1fr_repeat(3,4.25rem)] items-center border-b border-neutral-100 py-3.5 last:border-0"
          >
            <div className="min-w-0 pr-3">
              <div className="text-sm font-semibold text-neutral-800">
                {row.label}
              </div>
              <div className="mt-0.5 text-xs leading-snug text-neutral-500">
                {row.description}
              </div>
            </div>
            {CHANNELS.map((c) => (
              <div key={c.id} className="flex justify-center">
                <Switch
                  small
                  checked={draft.prefs[row.key][c.id]}
                  onChange={(v) => setPref(row.key, c.id, v)}
                  label={`${row.label} via ${c.label}`}
                />
              </div>
            ))}
          </div>
        ))}

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label className={labelCls}>Weekly digest day</label>
            <SelectField
              value={draft.digestDay}
              onChange={(v) => update({ digestDay: v })}
              options={DAYS}
            />
          </div>

          <div>
            <SettingRow
              title="Quiet hours"
              description="No push notifications during this window"
            >
              <Switch
                checked={draft.quietHours}
                onChange={(v) => update({ quietHours: v })}
                label="Quiet hours"
              />
            </SettingRow>
            {draft.quietHours && (
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="time"
                  value={draft.quietFrom}
                  onChange={(e) => update({ quietFrom: e.target.value })}
                  className={inputCls}
                />
                <span className="text-sm text-neutral-400">to</span>
                <input
                  type="time"
                  value={draft.quietTo}
                  onChange={(e) => update({ quietTo: e.target.value })}
                  className={inputCls}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <SaveBar
        dirty={form.dirty}
        onSave={() => {
          form.save();
          onSaved();
        }}
        onDiscard={form.discard}
      />
    </div>
  );
}

/* ================================================================= */
/*  PRIVACY tab                                                      */
/* ================================================================= */

type Visibility = "public" | "university" | "private";
type Messages = "everyone" | "communities" | "nobody";

interface PrivacyForm {
  visibility: Visibility;
  showUniversity: boolean;
  showActivity: boolean;
  showOnline: boolean;
  showReputation: boolean;
  messages: Messages;
}

const VISIBILITY_OPTIONS: {
  id: Visibility;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "public",
    label: "Public",
    description: "Anyone on CampusHub can view your profile",
    icon: Globe,
  },
  {
    id: "university",
    label: "My university",
    description: "Only students from your university can view it",
    icon: GraduationCap,
  },
  {
    id: "private",
    label: "Only me",
    description: "Your profile is hidden from everyone else",
    icon: Lock,
  },
];

function PrivacyTab({
  form,
  onSaved,
  notify,
}: {
  form: Draft<PrivacyForm>;
  onSaved: () => void;
  notify: (msg: string) => void;
}) {
  const { draft, update } = form;
  const [blocked, setBlocked] = useState([
    { id: "1", name: "Chris Hollow", school: "UCLA" },
    { id: "2", name: "Tara Neal", school: "NYU" },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <SectionHeading title="Profile visibility" />
        <div className="mt-2 space-y-2">
          {VISIBILITY_OPTIONS.map((v) => {
            const active = draft.visibility === v.id;
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => update({ visibility: v.id })}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                  active
                    ? "border-indigo-600 bg-indigo-50/60"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-indigo-600 bg-indigo-600" : "border-neutral-300"
                  }`}
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                <div>
                  <div className="text-sm font-semibold text-neutral-900">
                    {v.label}
                  </div>
                  <div className="text-xs text-neutral-500">{v.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeading title="What others can see" />
        <div className="mt-1">
          <SettingRow
            title="Show my university"
            description="Display it next to your name on posts"
          >
            <Switch
              checked={draft.showUniversity}
              onChange={(v) => update({ showUniversity: v })}
              label="Show my university"
            />
          </SettingRow>
          <SettingRow
            title="Show my activity"
            description="Let others see your questions and answers"
          >
            <Switch
              checked={draft.showActivity}
              onChange={(v) => update({ showActivity: v })}
              label="Show my activity"
            />
          </SettingRow>
          <SettingRow
            title="Show reputation and badges"
            description="Display your score and achievements"
          >
            <Switch
              checked={draft.showReputation}
              onChange={(v) => update({ showReputation: v })}
              label="Show reputation and badges"
            />
          </SettingRow>
          <SettingRow
            title="Show online status"
            description="Let others see when you're active"
          >
            <Switch
              checked={draft.showOnline}
              onChange={(v) => update({ showOnline: v })}
              label="Show online status"
            />
          </SettingRow>
        </div>
      </div>

      <div>
        <label className={labelCls}>Who can message me</label>
        <Segmented<Messages>
          value={draft.messages}
          onChange={(v) => update({ messages: v })}
          options={[
            { id: "everyone", label: "Everyone" },
            { id: "communities", label: "My communities" },
            { id: "nobody", label: "Nobody" },
          ]}
        />
      </div>

      <SaveBar
        dirty={form.dirty}
        onSave={() => {
          form.save();
          onSaved();
        }}
        onDiscard={form.discard}
      />

      {/* Blocked users */}
      <div className="border-t border-neutral-100 pt-6">
        <SectionHeading
          title="Blocked users"
          description="Blocked people can't message you or see your posts."
        />
        {blocked.length === 0 ? (
          <p className="py-3 text-sm text-neutral-400">
            You haven&apos;t blocked anyone.
          </p>
        ) : (
          <div className="mt-1">
            {blocked.map((b) => (
              <SettingRow key={b.id} title={b.name} description={b.school}>
                <button
                  onClick={() => {
                    setBlocked((prev) => prev.filter((x) => x.id !== b.id));
                    notify(`${b.name} unblocked`);
                  }}
                  className="shrink-0 rounded-lg border border-neutral-200 px-3.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Unblock
                </button>
              </SettingRow>
            ))}
          </div>
        )}
      </div>

      {/* Data */}
      <div className="border-t border-neutral-100 pt-6">
        <SettingRow
          title="Download my data"
          description="Get a copy of your posts, answers and account details"
        >
          <button
            onClick={() => notify("We'll email you a download link")}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 px-3.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <Download className="h-3.5 w-3.5" />
            Request
          </button>
        </SettingRow>
      </div>
    </div>
  );
}

/* ================================================================= */
/*  APPEARANCE tab                                                   */
/* ================================================================= */

const ACCENTS = [
  { id: "indigo", label: "Indigo", hex: "#4f46e5" },
  { id: "emerald", label: "Emerald", hex: "#059669" },
  { id: "rose", label: "Rose", hex: "#e11d48" },
  { id: "amber", label: "Amber", hex: "#d97706" },
  { id: "sky", label: "Sky", hex: "#0284c7" },
] as const;

type AccentId = (typeof ACCENTS)[number]["id"];
type Theme = "light" | "dark" | "system";
type Density = "comfortable" | "compact";
type TextSize = "small" | "default" | "large";

interface AppearanceForm {
  theme: Theme;
  accent: AccentId;
  density: Density;
  textSize: TextSize;
  language: string;
}

const THEMES: {
  id: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  preview: React.CSSProperties;
  bar: string;
}[] = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    preview: { background: "#ffffff" },
    bar: "#e5e7eb",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    preview: { background: "#0f172a" },
    bar: "#334155",
  },
  {
    id: "system",
    label: "System",
    icon: Monitor,
    preview: { background: "linear-gradient(120deg,#ffffff 50%,#0f172a 50%)" },
    bar: "#94a3b8",
  },
];

const LANGUAGES = ["English", "አማርኛ (Amharic)", "Español", "Français"];

function AppearanceTab({
  form,
  onSaved,
}: {
  form: Draft<AppearanceForm>;
  onSaved: () => void;
}) {
  const { draft, update } = form;
  const accentHex = ACCENTS.find((a) => a.id === draft.accent)!.hex;
  const dark = draft.theme === "dark";
  const fontSize =
    draft.textSize === "small" ? 13 : draft.textSize === "large" ? 17 : 15;

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <label className={labelCls}>Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const active = draft.theme === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => update({ theme: t.id })}
                aria-pressed={active}
                className={`rounded-xl border p-2.5 text-left transition-colors ${
                  active
                    ? "border-indigo-600 ring-2 ring-indigo-600/20"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div
                  className="space-y-1.5 rounded-lg border border-neutral-200 p-2.5"
                  style={t.preview}
                >
                  <div
                    className="h-1.5 w-2/3 rounded"
                    style={{ background: t.bar }}
                  />
                  <div
                    className="h-1.5 w-full rounded"
                    style={{ background: t.bar }}
                  />
                  <div
                    className="h-1.5 w-1/2 rounded"
                    style={{ background: accentHex }}
                  />
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
                  <Icon className="h-3.5 w-3.5 text-neutral-500" />
                  {t.label}
                  {active && (
                    <Check
                      className="ml-auto h-4 w-4 text-indigo-600"
                      strokeWidth={3}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent */}
      <div>
        <label className={labelCls}>Accent color</label>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => {
            const active = draft.accent === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => update({ accent: a.id })}
                aria-label={a.label}
                aria-pressed={active}
                className={`flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 transition-shadow ${
                  active ? "ring-2 ring-neutral-900" : "hover:ring-2 hover:ring-neutral-200"
                }`}
                style={{ background: a.hex }}
              >
                {active && (
                  <Check className="h-4 w-4 text-white" strokeWidth={3} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Density + text size */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Density</label>
          <Segmented<Density>
            value={draft.density}
            onChange={(v) => update({ density: v })}
            options={[
              { id: "comfortable", label: "Comfortable" },
              { id: "compact", label: "Compact" },
            ]}
          />
        </div>
        <div>
          <label className={labelCls}>Text size</label>
          <Segmented<TextSize>
            value={draft.textSize}
            onChange={(v) => update({ textSize: v })}
            options={[
              { id: "small", label: "Small" },
              { id: "default", label: "Default" },
              { id: "large", label: "Large" },
            ]}
          />
        </div>
      </div>

      {/* Language */}
      <div>
        <label className={labelCls}>Language</label>
        <SelectField
          value={draft.language}
          onChange={(v) => update({ language: v })}
          options={LANGUAGES}
        />
      </div>

      {/* Live preview */}
      <div>
        <label className={labelCls}>Preview</label>
        <div
          className="rounded-xl border border-neutral-200"
          style={{
            background: dark ? "#0f172a" : "#ffffff",
            color: dark ? "#f1f5f9" : "#171717",
            padding: draft.density === "compact" ? 12 : 20,
            fontSize,
          }}
        >
          <div className="font-bold">How do I prepare for finals week?</div>
          <div
            className="mt-1 opacity-70"
            style={{ fontSize: fontSize - 2 }}
          >
            Looking for a realistic study plan that doesn&apos;t burn me out.
          </div>
          <div
            className="flex items-center gap-2"
            style={{ marginTop: draft.density === "compact" ? 8 : 14 }}
          >
            <span
              className="rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ background: `${accentHex}22`, color: accentHex }}
            >
              StudyTips
            </span>
            <button
              type="button"
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white"
              style={{ background: accentHex }}
            >
              Answer
            </button>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-neutral-400">
          The preview shows your choices. Apply them app-wide from your theme
          provider after saving.
        </p>
      </div>

      <SaveBar
        dirty={form.dirty}
        onSave={() => {
          form.save();
          onSaved();
        }}
        onDiscard={form.discard}
      />
    </div>
  );
}

/* ================================================================= */
/*  Page                                                             */
/* ================================================================= */

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("profile");
  const [toast, setToast] = useState<string | null>(null);
  const { ref: navRef, edges } = useScrollEdges();

  const profile = useDraft<ProfileForm>({
    displayName: "Alex Johnson",
    university: "Stanford University",
    bio: "CS junior passionate about algorithms and open source. Always happy to help with study advice or graph theory puzzles!",
    avatarUrl: null,
  });

  const account = useDraft<AccountForm>({ username: "alexjohnson" });

  const notifications = useDraft<NotifForm>({
    paused: false,
    prefs: {
      answers: { inApp: true, email: true, push: true },
      replies: { inApp: true, email: false, push: true },
      upvotes: { inApp: true, email: false, push: false },
      announcements: { inApp: true, email: true, push: false },
      digest: { inApp: false, email: true, push: false },
    },
    digestDay: "Monday",
    quietHours: false,
    quietFrom: "22:00",
    quietTo: "07:00",
  });

  const privacy = useDraft<PrivacyForm>({
    visibility: "public",
    showUniversity: true,
    showActivity: true,
    showOnline: false,
    showReputation: true,
    messages: "communities",
  });

  const appearance = useDraft<AppearanceForm>({
    theme: "light",
    accent: "indigo",
    density: "comfortable",
    textSize: "default",
    language: "English",
  });

  const dirtyByTab: Record<TabId, boolean> = {
    profile: profile.dirty,
    account: account.dirty,
    notifications: notifications.dirty,
    privacy: privacy.dirty,
    appearance: appearance.dirty,
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Header reflects the *saved* profile, not the draft
  

  return (
    <div className="min-h-screen w-full bg-[#f4f6f9]">
      

      <div className="mx-auto flex w-full gap-6 px-6 py-6">
        {/* Left sidebar */}
        

        {/* Settings card */}
        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
            <div className="mt-4 border-t border-neutral-100 pt-5">
              <div className="flex flex-col gap-5 md:flex-row md:gap-8">
                {/* Tab list: scrollable underline tabs on mobile, vertical list from md */}
                <div className="relative -mx-4 sm:-mx-6 md:sticky md:top-24 md:mx-0 md:w-44 md:shrink-0 md:self-start">
                  <nav
                    ref={navRef}
                    aria-label="Settings sections"
                    className="flex gap-1 overflow-x-auto border-b border-neutral-200 px-4 [scrollbar-width:none] sm:px-6 md:flex-col md:overflow-visible md:border-0 md:px-0 [&::-webkit-scrollbar]:hidden"
                  >
                    {TABS.map((t) => {
                      const active = tab === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={(e) => {
                            setTab(t.id);
                            e.currentTarget.scrollIntoView({
                              behavior: "smooth",
                              inline: "center",
                              block: "nearest",
                            });
                          }}
                          aria-current={active ? "page" : undefined}
                          className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-sm transition-colors md:w-full md:justify-between md:rounded-lg md:py-2 ${
                            active
                              ? "font-semibold text-indigo-700 md:bg-indigo-50"
                              : "font-medium text-neutral-500 hover:text-neutral-900 md:text-neutral-600 md:hover:bg-neutral-100"
                          }`}
                        >
                          {t.label}
                          {dirtyByTab[t.id] && (
                            <span
                              aria-label="Unsaved changes"
                              className="h-1.5 w-1.5 rounded-full bg-amber-500"
                            />
                          )}
                          {active && (
                            <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-indigo-600 md:hidden" />
                          )}
                        </button>
                      );
                    })}
                  </nav>

                  {/* Edge fades hint that the tab row scrolls */}
                  {edges.left && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent md:hidden"
                    />
                  )}
                  {edges.right && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent md:hidden"
                    />
                  )}
                </div>
                {/* Active tab */}
                <div className="min-w-0 flex-1">
                  {tab === "profile" && (
                    <ProfileTab
                      form={profile}
                      onSaved={() => setToast("Profile updated")}
                    />
                  )}
                  {tab === "account" && (
                    <AccountTab
                      form={account}
                      email="alex.johnson@stanford.edu"
                      notify={setToast}
                    />
                  )}
                  {tab === "notifications" && (
                    <NotificationsTab
                      form={notifications}
                      onSaved={() => setToast("Notification settings saved")}
                    />
                  )}
                  {tab === "privacy" && (
                    <PrivacyTab
                      form={privacy}
                      onSaved={() => setToast("Privacy settings saved")}
                      notify={setToast}
                    />
                  )}
                  {tab === "appearance" && (
                    <AppearanceTab
                      form={appearance}
                      onSaved={() => setToast("Appearance saved")}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Help card */}
        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-900">Need Help?</h3>
            <div className="mt-3 space-y-2.5">
              {[
                { label: "Community Guidelines", icon: BookOpen },
                { label: "Frequently Asked Questions", icon: HelpCircle },
                { label: "Contact Support Team", icon: Mail },
              ].map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center gap-2.5 text-sm font-semibold text-indigo-600 hover:underline"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <Toast message={toast} />
    </div>
  );
}