"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flag,
  LifeBuoy,
  Loader2,
  Mail,
  MessageSquare,
  Paperclip,
  Rocket,
  Search,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Users,
  X,
} from "lucide-react";

/* ================================================================= */
/*  Types & content                                                  */
/* ================================================================= */

type CategoryId =
  | "start"
  | "posting"
  | "communities"
  | "account"
  | "notifications"
  | "safety";

interface Faq {
  id: string;
  category: CategoryId;
  q: string;
  a: string[];
  steps?: string[];
  keywords?: string[];
}

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "resolved";
  updated: string;
}

export interface TicketInput {
  topic: string;
  subject: string;
  message: string;
  file: File | null;
}

const CATEGORIES: {
  id: CategoryId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
}[] = [
  {
    id: "start",
    label: "Getting started",
    description: "Set up your profile and find your people",
    icon: Rocket,
    tint: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
  },
  {
    id: "posting",
    label: "Posting & answering",
    description: "Ask, answer, edit and get accepted",
    icon: MessageSquare,
    tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  {
    id: "communities",
    label: "Communities",
    description: "Join, create and moderate",
    icon: Users,
    tint: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
  },
  {
    id: "account",
    label: "Account & security",
    description: "Password, email and your data",
    icon: ShieldCheck,
    tint: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  },
  {
    id: "notifications",
    label: "Notifications & messages",
    description: "Alerts, quiet hours and DMs",
    icon: Bell,
    tint: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  },
  {
    id: "safety",
    label: "Safety & reporting",
    description: "Report problems and stay safe",
    icon: Flag,
    tint: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  },
];

const FAQS: Faq[] = [
  {
    id: "f1",
    category: "start",
    q: "How do I create an account?",
    a: [
      "CampusHub is for students, so you sign up with your university email. We send a 6-digit code to that address to confirm it&apos;s really yours.",
    ],
    steps: [
      "Choose Sign up and enter your name, university email and a password.",
      "Open the email from CampusHub and copy the 6-digit code.",
      "Paste the code to verify your account, then pick a few communities to join.",
    ],
    keywords: ["sign up", "register", "verify", "code", "email"],
  },
  {
    id: "f2",
    category: "start",
    q: "How do I join a community?",
    a: ["You can join any public community, or request access to restricted and private ones."],
    steps: [
      "Open Communities from the sidebar and find one that fits your courses or interests.",
      "Select Join. Communities you&apos;ve joined appear under My Communities in the sidebar.",
    ],
    keywords: ["follow", "subscribe"],
  },
  {
    id: "f3",
    category: "start",
    q: "What&apos;s the difference between a question, discussion, image post and poll?",
    a: [
      "A question is for getting answers, and answers can be accepted. A discussion is an open conversation with no single right answer.",
      "An image post shares up to 4 photos with a caption, and a poll lets the community vote on options for 1, 3 or 7 days.",
    ],
    keywords: ["post types", "create post"],
  },
  {
    id: "f4",
    category: "posting",
    q: "How do I ask a good question?",
    a: [
      "Specific questions get faster, better answers. Say what you&apos;re trying to do, what you&apos;ve tried, and include any error messages or code.",
      "Add a few tags so the right people see it, and search first in case it has already been answered.",
    ],
    keywords: ["tips", "tags", "ask"],
  },
  {
    id: "f5",
    category: "posting",
    q: "How do I mark an answer as accepted?",
    a: [
      "Only the person who asked the question can accept an answer, and only one answer can be accepted at a time.",
    ],
    steps: [
      "Open your question and scroll to the answers.",
      "Select Mark as accepted under the answer that solved it.",
      "To change your mind, select Accepted again to remove it.",
    ],
    keywords: ["solved", "best answer"],
  },
  {
    id: "f6",
    category: "posting",
    q: "Can I edit or delete my post?",
    a: [
      "You can edit your own post from the ••• menu on the post at any time.",
      "If a post already has answers, deleting it may need a moderator so other people&apos;s work isn&apos;t lost. Contact support and we&apos;ll sort it out.",
    ],
    keywords: ["remove", "change"],
  },
  {
    id: "f7",
    category: "posting",
    q: "Why was my post removed?",
    a: [
      "Moderators remove posts that break a community&apos;s rules or the CampusHub guidelines, such as sharing answers to active coursework, spam, or harassment.",
      "You get a notification that names the rule. If you think it was a mistake, send us a request with the post title and we&apos;ll review it.",
    ],
    keywords: ["moderation", "deleted", "rules"],
  },
  {
    id: "f8",
    category: "communities",
    q: "How do I create a community?",
    a: ["Any verified student can start a community."],
    steps: [
      "Select New Community in the sidebar.",
      "Choose a name, description, category, icon and banner.",
      "Pick who can see and post (Public, Restricted or Private), add your rules, then create it.",
    ],
    keywords: ["new community", "start"],
  },
  {
    id: "f9",
    category: "communities",
    q: "What do Public, Restricted and Private mean?",
    a: [
      "Public: anyone can read, post and comment. Restricted: anyone can read, but only approved members can post. Private: only approved members can see or post.",
    ],
    keywords: ["visibility", "privacy"],
  },
  {
    id: "f10",
    category: "communities",
    q: "How do I make someone a moderator?",
    a: [
      "Community owners can promote members from the community&apos;s Members tab. Moderators can remove posts, pin posts and manage reports for that community.",
    ],
    keywords: ["admin", "owner", "roles"],
  },
  {
    id: "f11",
    category: "account",
    q: "How do I change my password?",
    a: ["You can change your password any time while signed in."],
    steps: [
      "Open Settings from your profile menu, then choose Account.",
      "Under Change password, enter your current password and a new one.",
      "Select Update password. Forgot it? Use Forgot password on the sign-in page.",
    ],
    keywords: ["reset", "login", "forgot"],
  },
  {
    id: "f12",
    category: "account",
    q: "Can I change my university or email?",
    a: [
      "Your verified university email can&apos;t be changed in the app, because it proves you&apos;re a student there.",
      "If you moved universities or lost access to your email, send us a request and we&apos;ll help you move your account.",
    ],
    keywords: ["transfer", "school", "edu"],
  },
  {
    id: "f13",
    category: "account",
    q: "How do I delete my account?",
    a: ["Deleting your account permanently removes your profile, posts, answers and saved items. It can&apos;t be undone."],
    steps: [
      "Open Settings and choose Account.",
      "Scroll to the Danger zone and select Delete.",
      "Type DELETE to confirm.",
    ],
    keywords: ["close account", "remove data"],
  },
  {
    id: "f14",
    category: "notifications",
    q: "How do I turn off notifications?",
    a: [
      "In Settings, open Notifications. You can switch off individual alerts by In-app, Email or Push, pause everything, or set quiet hours so you&apos;re not disturbed at night.",
    ],
    keywords: ["mute", "alerts", "email", "push"],
  },
  {
    id: "f15",
    category: "notifications",
    q: "Someone keeps sending me unwanted messages. What can I do?",
    a: [
      "Open the conversation, choose Block from the ••• menu, and the person can no longer message you. You can also report them there.",
      "To limit who can message you in future, go to Settings, then Privacy, and change Who can message me.",
    ],
    keywords: ["dm", "harassment", "block", "spam"],
  },
  {
    id: "f16",
    category: "safety",
    q: "How do I report a post or user?",
    a: ["Reports are private, and the person you report is never told who reported them."],
    steps: [
      "Open the ••• menu on the post, comment or profile.",
      "Select Report and choose the reason that fits best.",
      "Add details if you like, then submit.",
    ],
    keywords: ["abuse", "inappropriate", "flag"],
  },
  {
    id: "f17",
    category: "safety",
    q: "What happens after I send a report?",
    a: [
      "Community moderators review reports first, and serious violations are escalated to the CampusHub team. We may remove content, warn the person, or suspend the account.",
      "If you feel unsafe, contact campus security or local emergency services first, then tell us.",
    ],
    keywords: ["review", "ban", "suspend"],
  },
  {
    id: "f18",
    category: "safety",
    q: "Who can see my profile and activity?",
    a: [
      "You choose. In Settings, open Privacy to make your profile public, visible only to your university, or private, and to hide your activity, reputation or online status.",
    ],
    keywords: ["data", "visibility", "private"],
  },
];

const POPULAR_SEARCHES = [
  "Reset password",
  "Accepted answer",
  "Report a post",
  "Delete account",
];

const TOPICS = [
  "Account or login",
  "Posts or answers",
  "Communities",
  "Report a bug",
  "Safety concern",
  "Something else",
];

const INITIAL_TICKETS: Ticket[] = [
  { id: "CH-2038", subject: "Can&apos;t verify my university email", status: "open", updated: "2 hours ago" },
  { id: "CH-1990", subject: "Community name change request", status: "resolved", updated: "3 days ago" },
];

/* ================================================================= */
/*  Shared styles                                                    */
/* ================================================================= */

const card =
  "rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900";
const muted = "text-neutral-500 dark:text-neutral-400";
const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500";
const labelCls =
  "mb-1.5 block text-sm font-semibold text-neutral-800 dark:text-neutral-200";

const MAX_MESSAGE = 1000;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/* ================================================================= */
/*  FAQ item                                                         */
/* ================================================================= */

function FaqItem({
  faq,
  open,
  onToggle,
  vote,
  onVote,
  onContact,
}: {
  faq: Faq;
  open: boolean;
  onToggle: () => void;
  vote?: "yes" | "no";
  onVote: (v: "yes" | "no") => void;
  onContact: () => void;
}) {
  const panelId = `faq-panel-${faq.id}`;
  return (
    <div
      className={`rounded-xl border transition-colors ${
        open
          ? "border-indigo-200 bg-indigo-50/40 dark:border-indigo-500/30 dark:bg-indigo-500/5"
          : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left sm:px-5"
      >
        <span className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
          {faq.q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
            open ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
          }`}
        />
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-3 px-4 pb-4 sm:px-5">
            {faq.a.map((p, i) => (
              <p key={i} className={`text-sm leading-relaxed ${muted}`}>
                {p}
              </p>
            ))}
            {faq.steps && (
              <ol className="space-y-2">
                {faq.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200/70 pt-3 dark:border-neutral-800">
              {vote ? (
                <p role="status" className={`text-xs ${muted}`}>
                  {vote === "yes" ? (
                    "Thanks for the feedback."
                  ) : (
                    <>
                      Sorry that didn&apos;t help.{" "}
                      <button
                        type="button"
                        onClick={onContact}
                        className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Contact support
                      </button>
                    </>
                  )}
                </p>
              ) : (
                <>
                  <span className={`text-xs ${muted}`}>Was this helpful?</span>
                  <div className="flex gap-1.5">
                    {(
                      [
                        { v: "yes", icon: ThumbsUp, label: "Yes" },
                        { v: "no", icon: ThumbsDown, label: "No" },
                      ] as const
                    ).map(({ v, icon: Icon, label }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => onVote(v)}
                        className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================= */
/*  Page                                                             */
/* ================================================================= */

export default function HelpSupportPage({
  email = "student@university.edu",
  onSubmitTicket,
}: {
  /** Shown read-only on the contact form */
  email?: string;
  /** Send the request to your backend. Throw to show an error. */
  onSubmitTicket?: (t: TicketInput) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, "yes" | "no">>({});

  // contact form
  const [topic, setTopic] = useState(TOPICS[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);

  const searchRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);

  // "/" jumps to search, like most help centers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const counts = useMemo(() => {
    const map = new Map<CategoryId, number>();
    FAQS.forEach((f) => map.set(f.category, (map.get(f.category) ?? 0) + 1));
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (!q) return true;
      const haystack = [f.q, ...f.a, ...(f.steps ?? []), ...(f.keywords ?? [])]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [query, category]);

  const groups = CATEGORIES.map((c) => ({
    ...c,
    items: filtered.filter((f) => f.category === c.id),
  })).filter((g) => g.items.length > 0);

  const scrollTo = (el: HTMLElement | null) =>
    el?.scrollIntoView({ behavior: "smooth", block: "start" });

  const contactSupport = (prefill?: string) => {
    if (prefill && !subject) setSubject(prefill.slice(0, 80));
    setSentId(null);
    scrollTo(contactRef.current);
  };

  const pickCategory = (id: CategoryId | "all") => {
    setCategory(id);
    setOpenId(null);
    scrollTo(faqRef.current);
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) {
      setFileError("That file is over 5 MB.");
      return;
    }
    setFileError(null);
    setFile(f);
  };

  const subjectOk = subject.trim().length >= 5;
  const messageOk = message.trim().length >= 20;
  const canSend = subjectOk && messageOk && !submitting;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setSubmitting(true);
    setFormError(null);
    try {
      if (onSubmitTicket) {
        await onSubmitTicket({ topic, subject: subject.trim(), message: message.trim(), file });
      } else {
        await new Promise((r) => setTimeout(r, 800)); // demo only
      }
      const id = `CH-${2040 + tickets.length}`;
      setTickets((prev) => [
        { id, subject: subject.trim(), status: "open", updated: "just now" },
        ...prev,
      ]);
      setSentId(id);
      setSubject("");
      setMessage("");
      setFile(null);
      setTopic(TOPICS[0]);
    } catch (err) {
      setFormError(
        err instanceof Error && err.message
          ? err.message
          : "We couldn&apos;t send your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16 dark:bg-neutral-800">
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-900 px-5 py-10 text-center text-white sm:px-10 sm:py-14">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            How can we help?
          </h1>
          <p className="mt-2 text-sm text-indigo-100 sm:text-base">
            Search the help center, browse by topic, or message the CampusHub team.
          </p>

          <div className="relative mt-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCategory("all");
              }}
              placeholder="Search for help, e.g. “reset password”"
              aria-label="Search the help center"
              className="w-full rounded-2xl border-0 bg-white py-3.5 pl-12 pr-24 text-base text-neutral-900 shadow-lg placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-neutral-200 px-2 py-0.5 font-mono text-xs text-neutral-400 sm:block">
                /
              </kbd>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-indigo-200">Popular:</span>
            {POPULAR_SEARCHES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  setCategory("all");
                  scrollTo(faqRef.current);
                }}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/25"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- Quick status ---------------------------- */}
      <div className="-mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          All systems operational
        </span>
        <span className={`flex items-center gap-1.5 ${muted}`}>
          <Clock className="h-4 w-4" />
          We usually reply within 24 hours
        </span>
      </div>

      {/* ----------------------------- Categories ----------------------------- */}
      <section aria-labelledby="browse-title">
        <h2 id="browse-title" className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
          Browse by topic
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ id, label, description, icon: Icon, tint }) => {
            const active = category === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => pickCategory(active ? "all" : id)}
                aria-pressed={active}
                className={`${card} flex items-start gap-3.5 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/30 ${
                  active ? "!border-indigo-500 ring-2 ring-indigo-500/20" : "hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{label}</span>
                    <span className="rounded-full bg-neutral-100 px-1.5 font-mono text-[11px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                      {counts.get(id) ?? 0}
                    </span>
                  </span>
                  <span className={`mt-0.5 block text-sm ${muted}`}>{description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* -------------------------------- FAQ -------------------------------- */}
      <section ref={faqRef} aria-labelledby="faq-title" className="scroll-mt-24">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="faq-title" className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {query.trim()
                ? `Results for “${query.trim()}”`
                : category === "all"
                ? "Frequently asked questions"
                : CATEGORIES.find((c) => c.id === category)?.label}
            </h2>
            <p className={`text-sm ${muted}`}>
              {filtered.length} {filtered.length === 1 ? "article" : "articles"}
            </p>
          </div>
          {(query || category !== "all") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className={`${card} px-6 py-14 text-center`}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
              <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              No articles found
            </h3>
            <p className={`mx-auto mt-1 max-w-sm text-sm ${muted}`}>
              Try different words, or tell us what you need and a person will help.
            </p>
            <button
              type="button"
              onClick={() => contactSupport(query.trim())}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Contact support
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-7">
            {groups.map(({ id, label, icon: Icon, tint, items }) => (
              <div key={id}>
                <div className="mb-2.5 flex items-center gap-2.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tint}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    {label}
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {items.map((faq) => (
                    <FaqItem
                      key={faq.id}
                      faq={faq}
                      open={openId === faq.id}
                      onToggle={() => setOpenId((cur) => (cur === faq.id ? null : faq.id))}
                      vote={votes[faq.id]}
                      onVote={(v) => setVotes((prev) => ({ ...prev, [faq.id]: v }))}
                      onContact={() => contactSupport(faq.q)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------ Contact ------------------------------ */}
      <section
        ref={contactRef}
        aria-labelledby="contact-title"
        className="scroll-mt-24"
      >
        <div className="mb-4">
          <h2 id="contact-title" className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            Still need help?
          </h2>
          <p className={`text-sm ${muted}`}>
            Send us a message and the team will get back to you by email.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* Form / success */}
          <div className={`${card} p-5 sm:p-6`}>
            {sentId ? (
              <div role="status" className="py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  Request sent
                </h3>
                <p className={`mx-auto mt-1 max-w-sm text-sm leading-relaxed ${muted}`}>
                  Your reference is{" "}
                  <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-100">
                    {sentId}
                  </span>
                  . We&apos;ll reply to {email}, usually within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSentId(null)}
                  className="mt-5 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="help-topic" className={labelCls}>
                      Topic
                    </label>
                    <div className="relative">
                      <select
                        id="help-topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={submitting}
                        className={`${inputCls} appearance-none pr-10`}
                      >
                        {TOPICS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="help-email" className={labelCls}>
                      Reply to
                    </label>
                    <input
                      id="help-email"
                      value={email}
                      readOnly
                      className={`${inputCls} cursor-not-allowed bg-neutral-50 text-neutral-500 dark:bg-neutral-800/60 dark:text-neutral-400`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="help-subject" className={labelCls}>
                    Subject
                  </label>
                  <input
                    id="help-subject"
                    value={subject}
                    maxLength={100}
                    disabled={submitting}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Briefly, what&apos;s going on?"
                    className={inputCls}
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="help-message" className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      Message
                    </label>
                    <span className={`text-xs ${muted}`}>
                      {message.length}/{MAX_MESSAGE}
                    </span>
                  </div>
                  <textarea
                    id="help-message"
                    value={message}
                    maxLength={MAX_MESSAGE}
                    rows={6}
                    disabled={submitting}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what happened, what you expected, and any steps to reproduce it."
                    className={`${inputCls} resize-y`}
                  />
                  {message.length > 0 && !messageOk && (
                    <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      A little more detail helps us fix it faster (20+ characters).
                    </p>
                  )}
                </div>

                <div>
                  <span className={labelCls}>
                    Screenshot <span className={`font-normal ${muted}`}>(optional)</span>
                  </span>
                  {file ? (
                    <div className="inline-flex items-center gap-2.5 rounded-xl border border-neutral-200 py-2 pl-3 pr-2 dark:border-neutral-700">
                      <Paperclip className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="max-w-[14rem] truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        aria-label="Remove attachment"
                        className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300">
                      <Paperclip className="h-4 w-4" />
                      Attach a file
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={onPickFile}
                      />
                    </label>
                  )}
                  <p
                    className={`mt-1.5 text-xs ${
                      fileError ? "font-medium text-red-600 dark:text-red-400" : muted
                    }`}
                  >
                    {fileError ?? "Images or PDF, up to 5 MB."}
                  </p>
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {formError}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <p className={`text-xs ${muted}`}>
                    {canSend ? "Ready to send" : "Add a subject and a message to continue"}
                  </p>
                  <button
                    type="submit"
                    disabled={!canSend}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? "Sending..." : "Send request"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Side column */}
          <div className="space-y-4">
            <div className={`${card} p-5`}>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Your requests
              </h3>
              {tickets.length === 0 ? (
                <p className={`mt-3 text-sm ${muted}`}>No requests yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {tickets.map((t) => (
                    <li key={t.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                          {t.subject}
                        </div>
                        <div className={`font-mono text-[11px] ${muted}`}>
                          {t.id} · {t.updated}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          t.status === "open"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        }`}
                      >
                        {t.status === "open" ? "Open" : "Resolved"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`${card} p-5`}>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Other ways to reach us
              </h3>
              <ul className="mt-3 space-y-1">
                <li>
                  <a
                    href="mailto:support@campushub.app"
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <Mail className="h-4 w-4 text-neutral-400" />
                    support@campushub.app
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <BookOpen className="h-4 w-4 text-neutral-400" />
                    Community guidelines
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 dark:border-red-500/20 dark:bg-red-500/5">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-800 dark:text-red-300">
                  Is someone in danger?
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-red-800/80 dark:text-red-200/80">
                Contact campus security or local emergency services first. CampusHub can&apos;t respond to emergencies.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}