"use client"
import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Bookmark,
  MessageSquare,
  Flame,
  Zap,
  Trophy,
  Check,
  Image as ImageIcon,
  BarChart3,
  HelpCircle as QuestionIcon,
} from "lucide-react";

/* ================================================================= */
/*  Types & data                                                     */
/* ================================================================= */

type PostType = "question" | "discussion" | "image" | "poll";
type SortId = "hot" | "top" | "rising";

interface Post {
  id: string;
  type: PostType;
  author: string;
  school: string;
  community: string;
  ageHours: number;
  postedAt: string;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  votesToday: number;
  answers: number;
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

const RANGES = [
  { id: "day", label: "Today", hours: 24 },
  { id: "week", label: "This week", hours: 168 },
  { id: "month", label: "This month", hours: 720 },
  { id: "all", label: "All time", hours: Number.POSITIVE_INFINITY },
];

const SORTS: { id: SortId; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "hot", label: "Hot", hint: "Votes weighted by how recent they are", icon: Flame },
  { id: "top", label: "Top", hint: "Most total upvotes", icon: Trophy },
  { id: "rising", label: "Rising", hint: "Gaining votes fastest today", icon: Zap },
];

const POSTS: Post[] = [
  {
    id: "p6",
    type: "question",
    author: "Daniel Kim",
    school: "UCLA",
    community: "r/ComputerScience",
    ageHours: 1,
    postedAt: "1 hour ago",
    title: "Is anyone taking OS next quarter?",
    body: "Looking to see if we can start a prep group over the break. I've heard the labs are extremely difficult and require writing custom file systems in C. Let me know if you want to team up!",
    tags: ["OperatingSystems", "C", "UCLA"],
    upvotes: 18,
    votesToday: 18,
    answers: 4,
  },
  {
    id: "p1",
    type: "question",
    author: "Sophia Martinez",
    school: "Stanford University",
    community: "r/ComputerScience",
    ageHours: 2,
    postedAt: "2 hours ago",
    title: "How can I understand recursion in Python?",
    body: "I've been trying to wrap my head around call stacks and base cases. Every time I write a recursive function, I end up with a stack overflow error or returning None. Are there any mental models or drawings that help?",
    tags: ["Python", "Recursion", "Beginner"],
    upvotes: 42,
    votesToday: 42,
    answers: 8,
  },
  {
    id: "p2",
    type: "question",
    author: "Ethan Wright",
    school: "MIT",
    community: "r/Mathematics",
    ageHours: 4,
    postedAt: "4 hours ago",
    title: "Best resources for linear algebra?",
    body: "My professor is moving extremely fast and the textbook is super abstract. Are there any online series, visual guides, or supplementary problem sheets you'd recommend for someone who needs geometric intuition?",
    tags: ["LinearAlgebra", "StudyResources", "MIT"],
    upvotes: 89,
    votesToday: 71,
    answers: 15,
  },
  {
    id: "p7",
    type: "poll",
    author: "Priya Shah",
    school: "UC Berkeley",
    community: "r/CampusLife",
    ageHours: 5,
    postedAt: "5 hours ago",
    title: "Best place to study on campus?",
    body: "",
    tags: ["Campus", "StudySpots"],
    upvotes: 37,
    votesToday: 37,
    answers: 9,
  },
  {
    id: "p3",
    type: "question",
    author: "Lily Chen",
    school: "UC Berkeley",
    community: "r/StudyTips",
    ageHours: 26,
    postedAt: "1 day ago",
    title: "Tips for surviving finals week?",
    body: "Facing three back-to-back exams next week and the stress is setting in. How do you block out your study days, organize summaries, and keep your sanity without burning out entirely by Wednesday?",
    tags: ["Finals", "Productivity", "MentalHealth"],
    upvotes: 112,
    votesToday: 29,
    answers: 24,
  },
  {
    id: "p4",
    type: "question",
    author: ME,
    school: "Stanford University",
    community: "r/ComputerScience",
    ageHours: 48,
    postedAt: "2 days ago",
    title: "How to optimize Floyd-Warshall algorithm for dense graphs?",
    body: "I am working on an all-pairs shortest path problem where the edge density is extremely high. Standard implementation is O(V^3), but I wonder if there is an alternative representation that performs better under GPU parallelism or cache-aware blocking?",
    tags: ["Algorithms", "Graphs", "Optimization"],
    upvotes: 56,
    votesToday: 6,
    answers: 11,
  },
  {
    id: "p9",
    type: "question",
    author: "Grace Liu",
    school: "UT Austin",
    community: "r/Scholarships",
    ageHours: 70,
    postedAt: "3 days ago",
    title: "How do I find scholarships as a sophomore?",
    body: "Most lists I find are for incoming freshmen or seniors. Are there databases or department offices that actually surface awards for second-year students?",
    tags: ["Scholarships", "Funding"],
    upvotes: 64,
    votesToday: 11,
    answers: 7,
  },
  {
    id: "p5",
    type: "discussion",
    author: ME,
    school: "Stanford University",
    community: "r/StudyTips",
    ageHours: 168,
    postedAt: "1 week ago",
    title: "My structured system for keeping track of research papers",
    body: "After trying Zotero, Notion, and physical folders, I finally designed a study pipeline that keeps me sane. Here's a brief markdown structure and tagging guide I use to summarize 10+ papers weekly.",
    tags: ["Research", "StudyHabits", "Organization"],
    upvotes: 142,
    votesToday: 9,
    answers: 29,
  },
  {
    id: "p8",
    type: "discussion",
    author: "Marcus Aurelius",
    school: "MIT",
    community: "r/ComputerScience",
    ageHours: 300,
    postedAt: "12 days ago",
    title: "Recursive vs iterative solutions chart",
    body: "I drafted a quick cheatsheet summarizing complexity tradeoffs, space constraints, and call stack overheads for common algorithms. Hope this helps anyone preparing for midterms!",
    tags: ["Algorithms", "Cheatsheet", "StudyTips"],
    upvotes: 156,
    votesToday: 4,
    answers: 9,
  },
  {
    id: "p10",
    type: "image",
    author: "Leo Martin",
    school: "Georgia Tech",
    community: "r/CampusLife",
    ageHours: 30,
    postedAt: "1 day ago",
    title: "Photo walk: old campus and new buildings",
    body: "A few of us are taking a relaxed photo walk on Saturday morning, starting by the clock tower. All cameras and experience levels welcome.",
    tags: ["Photography", "Campus"],
    upvotes: 23,
    votesToday: 8,
    answers: 4,
  },
];

/* ================================================================= */
/*  Helpers                                                          */
/* ================================================================= */

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-indigo-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-sky-600",
  "bg-violet-600",
];

function colorFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function Avatar({ name, size = "h-8 w-8" }: { name: string; size?: string }) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${colorFor(
        name
      )}`}
    >
      {getInitials(name)}
    </div>
  );
}

function score(p: Post, sort: SortId) {
  if (sort === "top") return p.upvotes;
  if (sort === "rising") return p.votesToday;
  // "hot": upvotes decayed by age, so fresh posts can outrank older heavy ones
  return p.upvotes / Math.pow(p.ageHours + 2, 1.5);
}

function SideCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-[#eef1f6] text-neutral-600 hover:bg-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}

/* ================================================================= */
/*  Post pieces                                                      */
/* ================================================================= */

function MetaLine({ post, light = false }: { post: Post; light?: boolean }) {
  const meta = TYPE_META[post.type];
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
      <span
        className={`rounded-full px-2.5 py-1 font-semibold ${
          light ? "bg-white/15 text-white" : meta.chip
        }`}
      >
        {meta.label}
      </span>
      <a
        href="#"
        className={`font-semibold hover:underline ${
          light ? "text-indigo-100" : "text-indigo-600"
        }`}
      >
        {post.community}
      </a>
      <span className={light ? "text-indigo-200" : "text-neutral-400"}>
        · {post.author} · {post.postedAt}
      </span>
    </div>
  );
}

function StatsLine({ post, light = false }: { post: Post; light?: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${
        light ? "text-white" : "text-neutral-500"
      }`}
    >
      <span
        className={`flex items-center gap-1 font-bold ${
          light ? "" : "text-neutral-800"
        }`}
      >
        <ChevronUp className="h-4 w-4" />
        {post.upvotes}
      </span>
      <span
        className={`flex items-center gap-0.5 text-xs font-bold ${
          light ? "text-emerald-300" : "text-emerald-600"
        }`}
      >
        <TrendingUp className="h-3.5 w-3.5" />+{post.votesToday} today
      </span>
      <span className="flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4" />
        {plural(post.answers, "answer", "answers")}
      </span>
    </div>
  );
}

function SaveButton({
  saved,
  onClick,
  light = false,
}: {
  saved: boolean;
  onClick: () => void;
  light?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={saved ? "Remove from saved" : "Save post"}
      aria-pressed={saved}
      className={`rounded-full p-2 transition-colors ${
        light
          ? "text-white hover:bg-white/15"
          : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
      }`}
    >
      <Bookmark
        className={`h-4 w-4 ${
          saved
            ? light
              ? "fill-white text-white"
              : "fill-indigo-600 text-indigo-600"
            : ""
        }`}
      />
    </button>
  );
}

function TagRow({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, 3).map((t) => (
        <span
          key={t}
          className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/** #1: full-width hero */
function Hero({
  post,
  saved,
  onSave,
  rangeLabel,
}: {
  post: Post;
  saved: boolean;
  onSave: () => void;
  rangeLabel: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-900 p-5 text-white sm:p-6">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <Trophy className="h-3.5 w-3.5" />
            #1 {rangeLabel}
          </span>
          <SaveButton saved={saved} onClick={onSave} light />
        </div>

        <div className="mt-4">
          <MetaLine post={post} light />
        </div>
        <a
          href="#"
          className="mt-2 block text-2xl font-extrabold leading-snug hover:underline"
        >
          {post.title}
        </a>
        {post.body && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-indigo-100">
            {post.body}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
          <StatsLine post={post} light />
          <div className="flex items-center gap-2.5">
            <Avatar name={post.author} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** #2 and #3: medium cards side by side */
function PodiumCard({
  post,
  rank,
  saved,
  onSave,
}: {
  post: Post;
  rank: number;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white">
          #{rank}
        </span>
        <SaveButton saved={saved} onClick={onSave} />
      </div>
      <div className="mt-3">
        <MetaLine post={post} />
      </div>
      <a
        href="#"
        className="mt-2 text-lg font-bold leading-snug text-neutral-900 hover:text-indigo-700"
      >
        {post.title}
      </a>
      {post.body && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-500">
          {post.body}
        </p>
      )}
      <div className="flex-1" />
      <div className="mt-4 border-t border-neutral-100 pt-3.5">
        <StatsLine post={post} />
      </div>
    </div>
  );
}

/** #4 and below: ranked rows */
function RankRow({
  post,
  rank,
  saved,
  onSave,
}: {
  post: Post;
  rank: number;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 sm:gap-4 sm:p-5">
      <div className="w-7 shrink-0 pt-0.5 text-center text-2xl font-extrabold text-neutral-300 sm:w-9">
        {rank}
      </div>

      <div className="min-w-0 flex-1">
        <MetaLine post={post} />
        <a
          href="#"
          className="mt-2 block text-[17px] font-bold leading-snug text-neutral-900 hover:text-indigo-700"
        >
          {post.title}
        </a>
        {post.body && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500">
            {post.body}
          </p>
        )}
        <div className="mt-3">
          <TagRow tags={post.tags} />
        </div>
        <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
          <StatsLine post={post} />
          <SaveButton saved={saved} onClick={onSave} />
        </div>
      </div>
    </div>
  );
}

/* ================================================================= */
/*  Page                                                             */
/* ================================================================= */

export default function PopularPostsPage() {
  const [range, setRange] = useState("week");
  const [sort, setSort] = useState<SortId>("hot");
  const [typeFilter, setTypeFilter] = useState<PostType | "all">("all");
  const [community, setCommunity] = useState("all");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(["p4"]));
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const activeRange = RANGES.find((r) => r.id === range)!;
  const rangeLabel = activeRange.label.toLowerCase();
  const activeSort = SORTS.find((s) => s.id === sort)!;

  const inRange = useMemo(
    () => POSTS.filter((p) => p.ageHours <= activeRange.hours),
    [activeRange.hours]
  );

  const communities = useMemo(
    () => Array.from(new Set(POSTS.map((p) => p.community))).sort(),
    []
  );

  const ranked = useMemo(
    () =>
      inRange
        .filter(
          (p) =>
            (typeFilter === "all" || p.type === typeFilter) &&
            (community === "all" || p.community === community)
        )
        .sort((a, b) => score(b, sort) - score(a, sort)),
    [inRange, typeFilter, community, sort]
  );

  const presentTypes = POST_TYPES.filter((t) =>
    inRange.some((p) => p.type === t)
  );

  // Sidebar data, derived from everything in the selected time range
  const topTags = useMemo(() => {
    const map = new Map<string, number>();
    inRange.forEach((p) =>
      p.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + p.upvotes))
    );
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [inRange]);

  const contributors = useMemo(() => {
    const map = new Map<string, { school: string; points: number }>();
    inRange.forEach((p) => {
      const cur = map.get(p.author) ?? { school: p.school, points: 0 };
      cur.points += p.upvotes;
      map.set(p.author, cur);
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 4);
  }, [inRange]);

  const trendingCommunities = useMemo(() => {
    const map = new Map<string, number>();
    inRange.forEach((p) =>
      map.set(p.community, (map.get(p.community) ?? 0) + p.votesToday)
    );
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [inRange]);

  const toggleSave = (id: string) => {
    const was = savedIds.has(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      was ? next.delete(id) : next.add(id);
      return next;
    });
    setToast(was ? "Removed from saved" : "Post saved");
  };

  const [first, second, third, ...rest] = ranked;
  const podium = [second, third].filter(Boolean) as Post[];
  const hasFilters = typeFilter !== "all" || community !== "all";

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        {/* Main */}
        <main className="min-w-0 flex-1 space-y-4">
          {/* Header + controls */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                  <Flame className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">Popular</h1>
                  <p className="text-sm text-neutral-500">
                    What the whole campus is talking about
                  </p>
                </div>
              </div>

              {/* Hot / Top / Rising */}
              <div className="flex rounded-xl bg-neutral-100 p-1">
                {SORTS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSort(id)}
                    aria-pressed={sort === id}
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                      sort === id
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-400">{activeSort.hint}</p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
              <div className="flex flex-wrap gap-2">
                {RANGES.map((r) => (
                  <Chip
                    key={r.id}
                    active={range === r.id}
                    onClick={() => setRange(r.id)}
                  >
                    {r.label}
                  </Chip>
                ))}
              </div>

              <div className="relative">
                <select
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  aria-label="Filter by community"
                  className="appearance-none rounded-xl border border-neutral-200 bg-white py-2 pl-3.5 pr-9 text-sm font-medium text-neutral-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All communities</option>
                  {communities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  typeFilter === "all"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                All types
              </button>
              {presentTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                    typeFilter === t
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  {TYPE_META[t].label}
                </button>
              ))}
              {hasFilters && (
                <button
                  onClick={() => {
                    setTypeFilter("all");
                    setCommunity("all");
                  }}
                  className="ml-auto text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Trending tags (shown here when the sidebar is hidden) */}
          {topTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] xl:hidden [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Trending
              </span>
              {topTags.map(([tag]) => (
                <span
                  key={tag}
                  className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 ring-1 ring-neutral-200"
                >
                  <span className="text-indigo-500">#</span>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Results */}
          {!first ? (
            <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Flame className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900">
                Nothing popular here yet
              </h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-neutral-500">
                No posts match this range and filters. Try a wider time range.
              </p>
              <button
                onClick={() => {
                  setRange("all");
                  setTypeFilter("all");
                  setCommunity("all");
                }}
                className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Show all time
              </button>
            </div>
          ) : (
            <>
              <Hero
                post={first}
                rangeLabel={rangeLabel}
                saved={savedIds.has(first.id)}
                onSave={() => toggleSave(first.id)}
              />

              {podium.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {podium.map((p, i) => (
                    <PodiumCard
                      key={p.id}
                      post={p}
                      rank={i + 2}
                      saved={savedIds.has(p.id)}
                      onSave={() => toggleSave(p.id)}
                    />
                  ))}
                </div>
              )}

              {rest.length > 0 && (
                <>
                  <h2 className="px-1 pt-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                    More popular posts
                  </h2>
                  {rest.map((p, i) => (
                    <RankRow
                      key={p.id}
                      post={p}
                      rank={i + 4}
                      saved={savedIds.has(p.id)}
                      onSave={() => toggleSave(p.id)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="hidden w-72 shrink-0 space-y-4 xl:block">
          <SideCard title="Trending tags" subtitle={`Most upvoted ${rangeLabel}`}>
            {topTags.length === 0 ? (
              <p className="text-sm text-neutral-400">No tags yet.</p>
            ) : (
              <ol className="space-y-2.5">
                {topTags.slice(0, 6).map(([tag, points], i) => (
                  <li key={tag} className="flex items-center gap-3">
                    <span className="w-4 text-sm font-bold text-neutral-300">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-800">
                      <span className="text-indigo-500">#</span>
                      {tag}
                    </span>
                    <span className="text-xs text-neutral-400">{points}</span>
                  </li>
                ))}
              </ol>
            )}
          </SideCard>

          <SideCard title="Top contributors" subtitle={`Most upvotes ${rangeLabel}`}>
            {contributors.length === 0 ? (
              <p className="text-sm text-neutral-400">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {contributors.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="w-4 text-sm font-bold text-neutral-300">
                      {i + 1}
                    </span>
                    <Avatar name={c.name} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-neutral-900">
                        {c.name}
                      </div>
                      <div className="truncate text-xs text-neutral-400">
                        {c.school}
                      </div>
                    </div>
                    <span className="flex items-center gap-0.5 text-sm font-bold text-indigo-600">
                      <ChevronUp className="h-4 w-4" />
                      {c.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SideCard>

          <SideCard title="Trending communities" subtitle="Gaining the most votes today">
            <div className="space-y-3">
              {trendingCommunities.map(([name, votes]) => {
                const isJoined = joined.has(name);
                return (
                  <div key={name} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">
                        {name}
                      </div>
                      <div className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                        <TrendingUp className="h-3 w-3" />+{votes} today
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setJoined((prev) => {
                          const next = new Set(prev);
                          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                          next.has(name) ? next.delete(name) : next.add(name);
                          return next;
                        })
                      }
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        isJoined
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      }`}
                    >
                      {isJoined ? "Joined" : "Join"}
                    </button>
                  </div>
                );
              })}
            </div>
          </SideCard>
        </aside>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
          {toast}
        </div>
      )}
    </div>
  );
}