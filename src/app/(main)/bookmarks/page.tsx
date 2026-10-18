"use client"
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Bookmark,
  MessageSquare,
  LayoutGrid,
  List,
  Folder,
  Check,
  X,
  Trash2,
  Lightbulb,
  HelpCircle as QuestionIcon,
  Image as ImageIcon,
  BarChart3,
} from "lucide-react";

/* ================================================================= */
/*  Types & data                                                     */
/* ================================================================= */

type PostType = "question" | "discussion" | "image" | "poll";
type SortId = "recent" | "oldest" | "votes" | "answers";
type ViewMode = "list" | "grid";

interface SavedPost {
  id: string;
  type: PostType;
  author: string;
  school: string;
  community: string;
  postedAt: string;
  savedAgeHours: number;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  answers: number;
  collectionId: string | null;
}

interface Collection {
  id: string;
  name: string;
  color: string;
}

const ME = "Alex Johnson";

const TYPE_META: Record<
  PostType,
  { label: string; chip: string; icon: React.ComponentType<{ className?: string }> }
> = {
  question: { label: "Question", chip: "bg-indigo-50 text-indigo-600", icon: QuestionIcon },
  discussion: { label: "Discussion", chip: "bg-emerald-50 text-emerald-600", icon: MessageSquare },
  image: { label: "Image", chip: "bg-amber-50 text-amber-600", icon: ImageIcon },
  poll: { label: "Poll", chip: "bg-violet-50 text-violet-600", icon: BarChart3 },
};

const POST_TYPES: PostType[] = ["question", "discussion", "image", "poll"];

const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "recent", label: "Recently saved" },
  { id: "oldest", label: "Oldest saved" },
  { id: "votes", label: "Most votes" },
  { id: "answers", label: "Most answers" },
];

const COLLECTION_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-violet-500",
];

const INITIAL_COLLECTIONS: Collection[] = [
  { id: "read-later", name: "Read later", color: "bg-sky-500" },
  { id: "exam", name: "Exam prep", color: "bg-rose-500" },
  { id: "projects", name: "Project ideas", color: "bg-emerald-500" },
];

const INITIAL_SAVED: SavedPost[] = [
  {
    id: "s1",
    type: "question",
    author: "Priya Shah",
    school: "UC Berkeley",
    community: "r/ComputerScience",
    postedAt: "2 days ago",
    savedAgeHours: 3,
    title: "How to optimize Floyd-Warshall algorithm for dense graphs?",
    body: "I am working on an all-pairs shortest path problem where the edge density is extremely high. Standard implementation is O(V^3), but I wonder if there is an alternative representation that performs better under GPU parallelism or cache-aware blocking?",
    tags: ["Algorithms", "Graphs", "Optimization"],
    upvotes: 56,
    answers: 11,
    collectionId: "exam",
  },
  {
    id: "s2",
    type: "discussion",
    author: ME,
    school: "Stanford University",
    community: "r/StudyTips",
    postedAt: "1 week ago",
    savedAgeHours: 26,
    title: "My structured system for keeping track of research papers",
    body: "After trying Zotero, Notion, and physical folders, I finally designed a study pipeline that keeps me sane. Here's a brief markdown structure and tagging guide I use to summarize 10+ papers weekly.",
    tags: ["Research", "StudyHabits", "Organization"],
    upvotes: 142,
    answers: 29,
    collectionId: "read-later",
  },
  {
    id: "s3",
    type: "question",
    author: "Ethan Wright",
    school: "MIT",
    community: "r/Mathematics",
    postedAt: "4 hours ago",
    savedAgeHours: 50,
    title: "Best resources for linear algebra?",
    body: "My professor is moving extremely fast and the textbook is super abstract. Are there any online series, visual guides, or supplementary problem sheets you'd recommend for someone who needs geometric intuition?",
    tags: ["LinearAlgebra", "StudyResources"],
    upvotes: 89,
    answers: 15,
    collectionId: "exam",
  },
  {
    id: "s4",
    type: "poll",
    author: "Priya Shah",
    school: "UC Berkeley",
    community: "r/CampusLife",
    postedAt: "5 hours ago",
    savedAgeHours: 72,
    title: "Best place to study on campus?",
    body: "",
    tags: ["Campus", "StudySpots"],
    upvotes: 37,
    answers: 9,
    collectionId: null,
  },
  {
    id: "s5",
    type: "discussion",
    author: "Marcus Aurelius",
    school: "MIT",
    community: "r/ComputerScience",
    postedAt: "12 days ago",
    savedAgeHours: 120,
    title: "Recursive vs iterative solutions chart",
    body: "I drafted a quick cheatsheet summarizing complexity tradeoffs, space constraints, and call stack overheads for common algorithms. Hope this helps anyone preparing for midterms!",
    tags: ["Algorithms", "Cheatsheet"],
    upvotes: 156,
    answers: 9,
    collectionId: "exam",
  },
  {
    id: "s6",
    type: "question",
    author: "Grace Liu",
    school: "UT Austin",
    community: "r/Scholarships",
    postedAt: "3 days ago",
    savedAgeHours: 200,
    title: "How do I find scholarships as a sophomore?",
    body: "Most lists I find are for incoming freshmen or seniors. Are there databases or department offices that actually surface awards for second-year students?",
    tags: ["Scholarships", "Funding"],
    upvotes: 64,
    answers: 7,
    collectionId: "read-later",
  },
  {
    id: "s7",
    type: "image",
    author: "Leo Martin",
    school: "Georgia Tech",
    community: "r/CampusLife",
    postedAt: "2 weeks ago",
    savedAgeHours: 300,
    title: "Photo walk: old campus and new buildings",
    body: "A few of us are taking a relaxed photo walk on Saturday morning, starting by the clock tower. All cameras and experience levels welcome.",
    tags: ["Photography", "Campus"],
    upvotes: 23,
    answers: 4,
    collectionId: null,
  },
  {
    id: "s8",
    type: "question",
    author: "Lily Chen",
    school: "UC Berkeley",
    community: "r/StudyTips",
    postedAt: "1 day ago",
    savedAgeHours: 400,
    title: "Tips for surviving finals week?",
    body: "Facing three back-to-back exams next week and the stress is setting in. How do you block out your study days, organize summaries, and keep your sanity without burning out entirely by Wednesday?",
    tags: ["Finals", "Productivity"],
    upvotes: 112,
    answers: 24,
    collectionId: "exam",
  },
  {
    id: "s9",
    type: "question",
    author: "Maya Cohen",
    school: "NYU",
    community: "r/ComputerScience",
    postedAt: "5 hours ago",
    savedAgeHours: 500,
    title: "How to setup React with Tailwind?",
    body: "I'm starting a side project and the docs seem to have changed a few times. What's the cleanest way to get React and Tailwind working together today, and do I still need a PostCSS config?",
    tags: ["React", "Tailwind", "WebDev"],
    upvotes: 8,
    answers: 3,
    collectionId: "projects",
  },
  {
    id: "s10",
    type: "discussion",
    author: "Noah Park",
    school: "Georgia Tech",
    community: "r/ComputerScience",
    postedAt: "3 weeks ago",
    savedAgeHours: 700,
    title: "Open-source projects friendly to first-time contributors",
    body: "I've collected a list of repositories with good-first-issue labels, clear contributing guides, and maintainers who actually review pull requests within a few days.",
    tags: ["OpenSource", "Career"],
    upvotes: 71,
    answers: 18,
    collectionId: "projects",
  },
];

/* ================================================================= */
/*  Helpers                                                          */
/* ================================================================= */

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function savedLabel(hours: number) {
  if (hours < 1) return "Saved just now";
  if (hours < 24) return `Saved ${plural(Math.round(hours), "hour", "hours")} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `Saved ${plural(days, "day", "days")} ago`;
  const weeks = Math.round(days / 7);
  return `Saved ${plural(weeks, "week", "weeks")} ago`;
}

function SideCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/* ================================================================= */
/*  Move-to-collection menu                                          */
/* ================================================================= */

function MoveMenu({
  collections,
  current,
  onMove,
  variant = "icon",
}: {
  collections: Collection[];
  current: string | null | "mixed";
  onMove: (collectionId: string | null) => void;
  variant?: "icon" | "bar";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {variant === "icon" ? (
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Move to collection"
          aria-expanded={open}
          className={`rounded-full p-2 transition-colors hover:bg-neutral-100 hover:text-neutral-700 ${open ? "bg-neutral-100 text-neutral-700" : "text-neutral-400"
            }`}
        >
          <Folder className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          <Folder className="h-4 w-4" />
          Move to
          <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
        </button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className={`absolute z-20 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg ${variant === "bar"
                ? "bottom-full left-0 mb-2"
                : "right-0 top-full mt-1"
              }`}
          >
            <p className="px-3.5 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Move to
            </p>
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onMove(c.id);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
                  {c.name}
                </span>
                {current === c.id && (
                  <Check className="h-4 w-4 text-indigo-600" strokeWidth={3} />
                )}
              </button>
            ))}
            <div className="my-1 border-t border-neutral-100" />
            <button
              onClick={() => {
                onMove(null);
                setOpen(false);
              }}
              className="block w-full px-3.5 py-2 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-50"
            >
              No collection
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ================================================================= */
/*  Saved post card                                                  */
/* ================================================================= */

function SavedCard({
  post,
  view,
  collections,
  selecting,
  selected,
  onToggleSelect,
  onUnsave,
  onMove,
}: {
  post: SavedPost;
  view: ViewMode;
  collections: Collection[];
  selecting: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onUnsave: (id: string) => void;
  onMove: (id: string, collectionId: string | null) => void;
}) {
  const meta = TYPE_META[post.type];
  const collection = collections.find((c) => c.id === post.collectionId);

  return (
    <div
      className={`flex gap-3 rounded-2xl border bg-white p-4 transition-colors sm:p-5 ${selected
          ? "border-indigo-500 ring-2 ring-indigo-500/20"
          : "border-neutral-200 hover:border-neutral-300"
        }`}
    >
      {selecting && (
        <button
          onClick={() => onToggleSelect(post.id)}
          aria-label={selected ? "Deselect post" : "Select post"}
          aria-pressed={selected}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${selected
              ? "border-indigo-600 bg-indigo-600"
              : "border-neutral-300 bg-white hover:border-indigo-400"
            }`}
        >
          {selected && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
        </button>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
          <span
            className={`rounded-full px-2.5 py-1 font-semibold ${meta.chip}`}
          >
            {meta.label}
          </span>
          <a href="#" className="font-semibold text-indigo-600 hover:underline">
            {post.community}
          </a>
          <span className="text-neutral-400">
            · {post.author} · {post.postedAt}
          </span>
          {collection && (
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 font-semibold text-neutral-600">
              <span className={`h-2 w-2 rounded-full ${collection.color}`} />
              {collection.name}
            </span>
          )}
        </div>

        <a
          href="#"
          className="mt-2.5 text-[17px] font-bold leading-snug text-neutral-900 hover:text-indigo-700"
        >
          {post.title}
        </a>

        {post.body && (
          <p
            className={`mt-1.5 text-sm leading-relaxed text-neutral-500 ${view === "grid" ? "line-clamp-3" : "line-clamp-2"
              }`}
          >
            {post.body}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Spacer keeps footers aligned across a row in grid view */}
        <div className="flex-1" />

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3.5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
            <span className="flex items-center gap-1 font-semibold text-neutral-700">
              <ChevronUp className="h-4 w-4" />
              {post.upvotes}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              {plural(post.answers, "answer", "answers")}
            </span>
            <span className="text-xs text-neutral-400">
              {savedLabel(post.savedAgeHours)}
            </span>
          </div>

          <div className="flex shrink-0 items-center">
            <MoveMenu
              collections={collections}
              current={post.collectionId}
              onMove={(cid) => onMove(post.id, cid)}
            />
            <button
              onClick={() => onUnsave(post.id)}
              aria-label="Remove from saved"
              title="Remove from saved"
              className="rounded-full p-2 text-indigo-600 hover:bg-indigo-50"
            >
              <Bookmark className="h-4 w-4 fill-indigo-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================= */
/*  Empty states                                                     */
/* ================================================================= */

function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
        <Bookmark className="h-6 w-6 text-indigo-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-xs text-sm text-neutral-500">{text}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}

/* ================================================================= */
/*  Page                                                             */
/* ================================================================= */

export default function SavedPostsPage() {
  const [items, setItems] = useState<SavedPost[]>(INITIAL_SAVED);
  const [collections, setCollections] =
    useState<Collection[]>(INITIAL_COLLECTIONS);

  const [activeCollection, setActiveCollection] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<PostType | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("list");

  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const [toast, setToast] = useState<{
    message: string;
    undo?: () => void;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---- derived data ---- */
  const inCollection = useMemo(
    () =>
      items.filter(
        (p) => activeCollection === "all" || p.collectionId === activeCollection
      ),
    [items, activeCollection]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = inCollection.filter(
      (p) =>
        (typeFilter === "all" || p.type === typeFilter) &&
        (!q ||
          [p.title, p.body, p.community, ...p.tags].some((s) =>
            s.toLowerCase().includes(q)
          ))
    );
    if (sort === "recent") list.sort((a, b) => a.savedAgeHours - b.savedAgeHours);
    if (sort === "oldest") list.sort((a, b) => b.savedAgeHours - a.savedAgeHours);
    if (sort === "votes") list.sort((a, b) => b.upvotes - a.upvotes);
    if (sort === "answers") list.sort((a, b) => b.answers - a.answers);
    return list;
  }, [inCollection, typeFilter, query, sort]);

  const stats = useMemo(() => {
    const byType = POST_TYPES.map((t) => ({
      type: t,
      count: items.filter((p) => p.type === t).length,
    }));
    const byCommunity = new Map<string, number>();
    items.forEach((p) =>
      byCommunity.set(p.community, (byCommunity.get(p.community) ?? 0) + 1)
    );
    const top = Array.from(byCommunity.entries()).sort((a, b) => b[1] - a[1])[0];
    return { byType, top };
  }, [items]);

  const hasFilters =
    query.trim() !== "" || typeFilter !== "all" || activeCollection !== "all";

  const selectedVisible = visible.filter((p) => selectedIds.has(p.id));
  const allSelected =
    visible.length > 0 && selectedVisible.length === visible.length;

  /* ---- actions ---- */
  const removePosts = (ids: string[]) => {
    const removed = items.filter((p) => ids.includes(p.id));
    if (removed.length === 0) return;
    setItems((prev) => prev.filter((p) => !ids.includes(p.id)));
    setSelectedIds(new Set());
    setToast({
      message:
        removed.length === 1
          ? "Removed from saved"
          : `Removed ${removed.length} posts from saved`,
      undo: () => {
        setItems((prev) => [...prev, ...removed]);
        setToast(null);
      },
    });
  };

  const movePosts = (ids: string[], collectionId: string | null) => {
    setItems((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, collectionId } : p))
    );
    const name =
      collections.find((c) => c.id === collectionId)?.name ?? "no collection";
    setToast({
      message:
        ids.length === 1 ? `Moved to ${name}` : `Moved ${ids.length} posts to ${name}`,
    });
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const exitSelecting = () => {
    setSelecting(false);
    setSelectedIds(new Set());
  };

  const createCollection = () => {
    const name = newName.trim();
    if (!name) return;
    const color = COLLECTION_COLORS[collections.length % COLLECTION_COLORS.length];
    setCollections((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, name, color },
    ]);
    setNewName("");
    setCreating(false);
    setToast({ message: `Collection "${name}" created` });
  };

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setActiveCollection("all");
  };

  const countFor = (id: string) =>
    id === "all" ? items.length : items.filter((p) => p.collectionId === id).length;

  const currentSort = SORT_OPTIONS.find((s) => s.id === sort)!;

  /* ---- render ---- */
  return (
    <>
      <main className="min-w-0 flex-1 space-y-4 pb-20">
        {/* Header card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                <Bookmark className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Saved</h1>
                <p className="text-sm text-neutral-500">
                  {plural(items.length, "post", "posts")} saved for later
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => (selecting ? exitSelecting() : setSelecting(true))}
                disabled={items.length === 0}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${selecting
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
              >
                {selecting ? "Done" : "Select"}
              </button>
            </div>
          </div>

          {/* Search + sort + view */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your saved posts..."
                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-9 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                aria-expanded={sortOpen}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                {currentSort.label}
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>
              {sortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSortOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                    {SORT_OPTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSort(s.id);
                          setSortOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        {s.label}
                        {sort === s.id && (
                          <Check
                            className="h-4 w-4 text-indigo-600"
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex rounded-xl bg-neutral-100 p-1">
              {(
                [
                  { id: "list", icon: List, label: "List view" },
                  { id: "grid", icon: LayoutGrid, label: "Grid view" },
                ] as const
              ).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  aria-label={label}
                  aria-pressed={view === id}
                  className={`rounded-lg p-2 transition-colors ${view === id
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-800"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
            <button
              onClick={() => setActiveCollection("all")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${activeCollection === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-[#eef1f6] text-neutral-600 hover:bg-neutral-200"
                }`}
            >
              All saved
              <span
                className={
                  activeCollection === "all"
                    ? "text-indigo-200"
                    : "text-neutral-400"
                }
              >
                {countFor("all")}
              </span>
            </button>

            {collections.map((c) => {
              const active = activeCollection === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCollection(c.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${active
                      ? "bg-indigo-600 text-white"
                      : "bg-[#eef1f6] text-neutral-600 hover:bg-neutral-200"
                    }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${active ? "bg-white" : c.color
                      }`}
                  />
                  {c.name}
                  <span className={active ? "text-indigo-200" : "text-neutral-400"}>
                    {countFor(c.id)}
                  </span>
                </button>
              );
            })}

            {creating ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  maxLength={24}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createCollection();
                    if (e.key === "Escape") {
                      setCreating(false);
                      setNewName("");
                    }
                  }}
                  placeholder="Collection name"
                  className="w-40 rounded-full border border-indigo-500 bg-white px-3.5 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={createCollection}
                  disabled={!newName.trim()}
                  aria-label="Create collection"
                  className="rounded-full bg-indigo-600 p-1.5 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                >
                  <Check className="h-4 w-4" strokeWidth={3} />
                </button>
                <button
                  onClick={() => {
                    setCreating(false);
                    setNewName("");
                  }}
                  aria-label="Cancel"
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 px-3.5 py-1.5 text-sm font-semibold text-neutral-500 hover:border-indigo-400 hover:text-indigo-600"
              >
                <Plus className="h-3.5 w-3.5" />
                New collection
              </button>
            )}
          </div>

          {/* Type filter */}
          {items.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${typeFilter === "all"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:bg-neutral-100"
                  }`}
              >
                All types
              </button>
              {POST_TYPES.filter((t) =>
                inCollection.some((p) => p.type === t)
              ).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${typeFilter === t
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:bg-neutral-100"
                    }`}
                >
                  {TYPE_META[t].label}
                  <span className="ml-1.5 opacity-60">
                    {inCollection.filter((p) => p.type === t).length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Result line */}
        {items.length > 0 && visible.length > 0 && (
          <div className="flex items-center justify-between px-1 text-sm text-neutral-500">
            {selecting ? (
              <button
                onClick={() =>
                  setSelectedIds(
                    allSelected ? new Set() : new Set(visible.map((p) => p.id))
                  )
                }
                className="flex items-center gap-2 font-semibold text-neutral-700 hover:text-indigo-600"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${allSelected
                      ? "border-indigo-600 bg-indigo-600"
                      : "border-neutral-300 bg-white"
                    }`}
                >
                  {allSelected && (
                    <Check className="h-3 w-3 text-white" strokeWidth={4} />
                  )}
                </span>
                Select all {visible.length}
              </button>
            ) : (
              <span>
                Showing {visible.length} of {items.length}
              </span>
            )}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {items.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            text="Tap the bookmark on any post and it will show up here, ready for later."
            action={
              <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Browse popular posts
              </button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title="No saved posts match"
            text="Try a different search, or clear your filters to see everything you've saved."
            action={
              <button
                onClick={clearFilters}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div
            className={
              view === "grid"
                ? "grid gap-4 md:grid-cols-2"
                : "space-y-4"
            }
          >
            {visible.map((p) => (
              <SavedCard
                key={p.id}
                post={p}
                view={view}
                collections={collections}
                selecting={selecting}
                selected={selectedIds.has(p.id)}
                onToggleSelect={toggleSelect}
                onUnsave={(id) => removePosts([id])}
                onMove={(id, cid) => movePosts([id], cid)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Right sidebar */}
      <aside className="hidden w-72 shrink-0 self-start space-y-4 xl:sticky xl:top-16 xl:block">
        <SideCard title="At a glance">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-neutral-900">
              {items.length}
            </span>
            <span className="pb-1 text-sm text-neutral-400">
              saved posts
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {stats.byType.map(({ type, count }) => (
              <div key={type}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-600">
                    {TYPE_META[type].label}
                  </span>
                  <span className="text-neutral-400">{count}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{
                      width: items.length
                        ? `${(count / items.length) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {stats.top && (
            <div className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
              Most saved from{" "}
              <a href="#" className="font-semibold text-indigo-600 hover:underline">
                {stats.top[0]}
              </a>{" "}
              ({stats.top[1]})
            </div>
          )}
        </SideCard>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-neutral-900">
              Stay organized
            </h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Group related posts into collections like &quot;Exam prep&quot; so you can
            find them in seconds.
          </p>
          <button
            onClick={() => setCreating(true)}
            className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Create a collection
          </button>
        </div>
      </aside>
      {/* Bulk action bar */}
      {selecting && selectedVisible.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl bg-neutral-900 px-3 py-2 text-white shadow-xl">
          <span className="px-3 text-sm font-semibold">
            {selectedVisible.length} selected
          </span>
          <div className="mx-1 h-5 w-px bg-white/15" />
          <MoveMenu
            variant="bar"
            collections={collections}
            current="mixed"
            onMove={(cid) => movePosts(selectedVisible.map((p) => p.id), cid)}
          />
          <button
            onClick={() => removePosts(selectedVisible.map((p) => p.id))}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-red-300 hover:bg-white/10"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
          <button
            onClick={exitSelecting}
            aria-label="Cancel selection"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Toast with optional undo */}
      {toast && (
        <div
          className={`fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg ${selecting && selectedVisible.length > 0 ? "bottom-24" : "bottom-6"
            }`}
        >
          <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
          {toast.message}
          {toast.undo && (
            <button
              onClick={toast.undo}
              className="font-bold text-indigo-300 hover:text-indigo-200"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </>
  );
}
