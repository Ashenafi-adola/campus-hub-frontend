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
import { getSavedPosts } from "@/libs/api";
import { SavedPost } from "@/libs/types";
import QuestionCard from "@/components/main/posts/post-card";
import { plural } from "@/libs/format";

/* ================================================================= */
/*  Types & data                                                     */
/* ================================================================= */

type PostType = "question" | "discussion" | "image" | "poll";
type SortId = "recent" | "oldest" | "votes" | "answers";
type ViewMode = "list" | "grid";


interface Collection {
  id: string;
  name: string;
  color: string;
}

const TYPE_META: Record<
  PostType,
  { label: string; chip: string; icon: React.ComponentType<{ className?: string }> }
> = {
  question: { label: "Question", chip: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300", icon: QuestionIcon },
  discussion: { label: "Discussion", chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300", icon: MessageSquare },
  image: { label: "Image", chip: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300", icon: ImageIcon },
  poll: { label: "Poll", chip: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300", icon: BarChart3 },
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

/* ================================================================= */
/*  Helpers                                                          */
/* ================================================================= */

// function savedLabel(hours: number) {
//   if (hours < 1) return "Saved just now";
//   if (hours < 24) return `Saved ${plural(Math.round(hours), "hour", "hours")} ago`;
//   const days = Math.round(hours / 24);
//   if (days < 7) return `Saved ${plural(days, "day", "days")} ago`;
//   const weeks = Math.round(days / 7);
//   return `Saved ${plural(weeks, "week", "weeks")} ago`;
// }

function SideCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
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
          className={`rounded-full p-2 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${open ? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200" : "text-neutral-400 dark:text-neutral-500"
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
            className={`absolute z-20 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 ${variant === "bar"
                ? "bottom-full left-0 mb-2"
                : "right-0 top-full mt-1"
              }`}
          >
            <p className="px-3.5 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Move to
            </p>
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onMove(c.id);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
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
            <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
            <button
              onClick={() => {
                onMove(null);
                setOpen(false);
              }}
              className="block w-full px-3.5 py-2 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
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

// function SavedCard({
//   post,
//   view,
//   collections,
//   selecting,
//   selected,
//   onToggleSelect,
//   onUnsave,
//   onMove,
// }: {
//   post: SavedPost;
//   view: ViewMode;
//   collections: Collection[];
//   selecting: boolean;
//   selected: boolean;
//   onToggleSelect: (id: string) => void;
//   onUnsave: (id: string) => void;
//   onMove: (id: string, collectionId: string | null) => void;
// }) {
//   const meta = TYPE_META[post.type];
//   const collection = collections.find((c) => c.id === post.collectionId);

//   return (
//     <div
//       className={`flex gap-3 rounded-2xl border bg-white p-4 transition-colors sm:p-5 ${selected
//           ? "border-indigo-500 ring-2 ring-indigo-500/20"
//           : "border-neutral-200 hover:border-neutral-300"
//         }`}
//     >
//       {selecting && (
//         <button
//           onClick={() => onToggleSelect(post.id)}
//           aria-label={selected ? "Deselect post" : "Select post"}
//           aria-pressed={selected}
//           className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${selected
//               ? "border-indigo-600 bg-indigo-600"
//               : "border-neutral-300 bg-white hover:border-indigo-400"
//             }`}
//         >
//           {selected && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
//         </button>
//       )}

//       <div className="flex min-w-0 flex-1 flex-col">
//         <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
//           <span
//             className={`rounded-full px-2.5 py-1 font-semibold ${meta.chip}`}
//           >
//             {meta.label}
//           </span>
//           <a href="#" className="font-semibold text-indigo-600 hover:underline">
//             {post.community}
//           </a>
//           <span className="text-neutral-400">
//             · {post.author} · {post.postedAt}
//           </span>
//           {collection && (
//             <span className="ml-auto flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 font-semibold text-neutral-600">
//               <span className={`h-2 w-2 rounded-full ${collection.color}`} />
//               {collection.name}
//             </span>
//           )}
//         </div>

//         <a
//           href="#"
//           className="mt-2.5 text-[17px] font-bold leading-snug text-neutral-900 hover:text-indigo-700"
//         >
//           {post.title}
//         </a>

//         {post.body && (
//           <p
//             className={`mt-1.5 text-sm leading-relaxed text-neutral-500 ${view === "grid" ? "line-clamp-3" : "line-clamp-2"
//               }`}
//           >
//             {post.body}
//           </p>
//         )}

//         <div className="mt-3 flex flex-wrap gap-2">
//           {post.tags.slice(0, 3).map((tag) => (
//             <span
//               key={tag}
//               className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
//             >
//               {tag}
//             </span>
//           ))}
//         </div>

//         {/* Spacer keeps footers aligned across a row in grid view */}
//         <div className="flex-1" />

//         <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3.5">
//           <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
//             <span className="flex items-center gap-1 font-semibold text-neutral-700">
//               <ChevronUp className="h-4 w-4" />
//               {post.upvotes}
//             </span>
//             <span className="flex items-center gap-1.5">
//               <MessageSquare className="h-4 w-4" />
//               {plural(post.answers, "answer", "answers")}
//             </span>
//             <span className="text-xs text-neutral-400">
//               {savedLabel(post.savedAgeHours)}
//             </span>
//           </div>

//           <div className="flex shrink-0 items-center">
//             <MoveMenu
//               collections={collections}
//               current={post.collectionId}
//               onMove={(cid) => onMove(post.id, cid)}
//             />
//             <button
//               onClick={() => onUnsave(post.id)}
//               aria-label="Remove from saved"
//               title="Remove from saved"
//               className="rounded-full p-2 text-indigo-600 hover:bg-indigo-50"
//             >
//               <Bookmark className="h-4 w-4 fill-indigo-600" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950">
        <Bookmark className="h-6 w-6 text-indigo-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="mx-auto mt-1 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">{text}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}

/* ================================================================= */
/*  Page                                                             */
/* ================================================================= */

export default function SavedPostsPage() {
  const [collections, setCollections] =
    useState<Collection[]>(INITIAL_COLLECTIONS);

  const [activeCollection, setActiveCollection] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<PostType | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("list");

  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saveds, setSaveds] = useState<SavedPost[]>([])

  const [toast, setToast] = useState<{
    message: string;
    undo?: () => void;
  } | null>(null);

  useEffect(()=>{
    getSavedPosts().then(res=>setSaveds(res)).catch(error=>console.log(error))
  }, [])

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---- derived data ---- */
  const inCollection = saveds

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = inCollection.filter(
      (p) =>
        (typeFilter === "all" || p.post.post_type === typeFilter) &&
        (!q ||
          [p.post.title, p.post.content, p.post.community.name, ...(p.post.tags ?? [])].some((s) =>
            s.toLowerCase().includes(q)
          ))
    );
    if (sort === "recent") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (sort === "oldest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sort === "votes") list.sort((a, b) => b.post.upvote - a.post.upvote);
    if (sort === "answers") list.sort((a, b) => b.post.comment_count - a.post.comment_count);
    return list;
  }, [inCollection, typeFilter, query, sort]);

  const stats = useMemo(() => {
    const byType = POST_TYPES.map((t) => ({
      type: t,
      count: visible.filter((p) => p.post.post_type === t).length,
    }));
    const byCommunity = new Map<string, number>();
    visible.forEach((p) =>
      byCommunity.set(p.post.community.name, (byCommunity.get(p.post.community.name) ?? 0) + 1)
    );
    const top = Array.from(byCommunity.entries()).sort((a, b) => b[1] - a[1])[0];
    return { byType, top };
  }, [visible]);

  const hasFilters =
    query.trim() !== "" || typeFilter !== "all" || activeCollection !== "all";

  const selectedVisible = visible.filter((p) => selectedIds.has(p.id));
  const allSelected =
    visible.length > 0 && selectedVisible.length === visible.length;

  /* ---- actions ---- */
  // const removePosts = (ids: number[]) => {
  //   const removed = visible.filter((p) => ids.includes(p.id));
  //   if (removed.length === 0) return;
  //   setItems((prev) => prev.filter((p) => !ids.includes(p.id)));
  //   setSelectedIds(new Set());
  //   setToast({
  //     message:
  //       removed.length === 1
  //         ? "Removed from saved"
  //         : `Removed ${removed.length} posts from saved`,
  //     undo: () => {
  //       setItems((prev) => [...prev, ...removed]);
  //       setToast(null);
  //     },
  //   });
  // };

  const movePosts = (ids: number[], collectionId: string | null) => {
    setSaveds((prev) =>
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

  // const toggleSelect = (id: number) =>
  //   setSelectedIds((prev) => {
  //     const next = new Set(prev);
  //     // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  //     next.has(id) ? next.delete(id) : next.add(id);
  //     return next;
  //   });

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
    id === "all" ? saveds.length : saveds.filter((p) => p.post.post_type === id).length;

  const currentSort = SORT_OPTIONS.find((s) => s.id === sort)!;

  /* ---- render ---- */
  return (
    <>
      <main className="min-w-0 flex-1 space-y-4 pb-20 md:pb-5 pt-5">
        {/* Header card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
                <Bookmark className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Saved</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {plural(saveds.length, "post", "posts")} saved for later
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => (selecting ? exitSelecting() : setSelecting(true))}
                disabled={saveds.length === 0}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${selecting
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
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
                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-9 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                aria-expanded={sortOpen}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
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
                  <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                    {SORT_OPTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSort(s.id);
                          setSortOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
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

            <div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
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
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-neutral-700"
                      : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <button
              onClick={() => setActiveCollection("all")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${activeCollection === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-[#eef1f6] text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
            >
              All saved
              <span
                className={
                  activeCollection === "all"
                    ? "text-indigo-200"
                    : "text-neutral-400 dark:text-neutral-500"
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
                      : "bg-[#eef1f6] text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${active ? "bg-white" : c.color
                      }`}
                  />
                  {c.name}
                  <span className={active ? "text-indigo-200" : "text-neutral-400 dark:text-neutral-500"}>
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
                  className="w-40 rounded-full border border-indigo-500 bg-white px-3.5 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />
                <button
                  onClick={createCollection}
                  disabled={!newName.trim()}
                  aria-label="Create collection"
                  className="rounded-full bg-indigo-600 p-1.5 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
                >
                  <Check className="h-4 w-4" strokeWidth={3} />
                </button>
                <button
                  onClick={() => {
                    setCreating(false);
                    setNewName("");
                  }}
                  aria-label="Cancel"
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 px-3.5 py-1.5 text-sm font-semibold text-neutral-500 hover:border-indigo-400 hover:text-indigo-600 dark:border-neutral-700 dark:text-neutral-400"
              >
                <Plus className="h-3.5 w-3.5" />
                New collection
              </button>
            )}
          </div>

          {/* Type filter */}
          {saveds.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${typeFilter === "all"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
              >
                All types
              </button>
              {POST_TYPES.filter((t) =>
                saveds.some((p) => p.post.post_type === t)
              ).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${typeFilter === t
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    }`}
                >
                  {TYPE_META[t].label}
                  <span className="ml-1.5 opacity-60">
                    {saveds.filter((p) => p.post.post_type === t).length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Result line */}
        {saveds.length > 0 && visible.length > 0 && (
          <div className="flex items-center justify-between px-1 text-sm text-neutral-500 dark:text-neutral-400">
            {selecting ? (
              <button
                onClick={() =>
                  setSelectedIds(
                    allSelected ? new Set() : new Set(visible.map((p) => p.id))
                  )
                }
                className="flex items-center gap-2 font-semibold text-neutral-700 hover:text-indigo-600 dark:text-neutral-300"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${allSelected
                      ? "border-indigo-600 bg-indigo-600"
                      : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
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
                Showing {visible.length} of {saveds.length}
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
        {saveds.length === 0 ? (
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
              <QuestionCard
                key={p.id}
                post={p.post}
              />
            ))}
          </div>
        )}
      </main>

      {/* Right sidebar */}
      <aside className="w-0 xl:w-72 transition-all duration-300 shrink-0 self-start xl:sticky xl:top-16 xl:block">
        <div className="hidden xl:block space-y-4">
          <SideCard title="At a glance">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
                {saveds.length}
              </span>
              <span className="pb-1 text-sm text-neutral-400 dark:text-neutral-500">
                saved posts
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {stats.byType.map(({ type, count }) => (
                <div key={type}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                      {TYPE_META[type].label}
                    </span>
                    <span className="text-neutral-400 dark:text-neutral-500">{count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: saveds.length
                          ? `${(count / saveds.length) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {stats.top && (
              <div className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                Most saved from{" "}
                <a href="#" className="font-semibold text-indigo-600 hover:underline">
                  {stats.top[0]}
                </a>{" "}
                ({stats.top[1]})
              </div>
            )}
          </SideCard>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 dark:border-indigo-900 dark:bg-indigo-950/30">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Stay organized
              </h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
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
        </div>
      </aside>
      { }
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
