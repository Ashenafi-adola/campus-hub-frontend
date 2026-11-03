"use client"
import QuestionCard from "@/components/main/post-card";
import { SortId, SORTS, TYPE_META } from "@/components/popular/constants";
import { Hero } from "@/components/popular/hero";
import { SideCard } from "@/components/shared/side-card";
import { Chip, } from "@/components/shared/ui";
import { usePosts } from "@/hooks/use-posts";
import { Post, PostType } from "@/libs/types";
import { Check, ChevronDown, ChevronUp, Flame, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

const RANGES = [
  { id: "day", label: "Today", hours: 24 },
  { id: "week", label: "This week", hours: 168 },
  { id: "month", label: "This month", hours: 720 },
  { id: "all", label: "All time", hours: Number.POSITIVE_INFINITY },
];

const ageHour = (time: string) => {
  const now = Date.now()
  const difference = new Date(now).getTime() - new Date(time).getTime();
  return Math.floor(difference / 3_600_000);
}
const POST_TYPES: PostType[] = ["question", "discussion", "image", "poll"];

export default function PopularPage() {
  const [range, setRange] = useState("week");
  const [sort, setSort] = useState<SortId>("hot");
  const [typeFilter, setTypeFilter] = useState<PostType | "all">("all");
  const [community, setCommunity] = useState("all");
  // const [savedIds, setSavedIds] = useState<Set<string>>(new Set(["p4"]));
  const [joined, setJoined] = useState<Set<string>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [toast, setToast] = useState<string | null>(null);

  const { posts } = usePosts();


  const activeRanage = RANGES.find((r) => r.id === range);
  const rangeLabel = activeRanage?.label.toLowerCase();
  const activeSort = SORTS.find((s) => s.id === sort);

  const inRange = useMemo(
    () => activeRanage ? posts.filter((p) => ageHour(p.created_at) <= activeRanage?.hours) : [],
    [activeRanage, posts]
  );

  const communities = useMemo(
    () => Array.from(new Set(posts.map((p) => p.community.name))),
    [posts]
  )

  const ranked = useMemo(
    () =>
      inRange
        .filter(
          (p) =>
            (typeFilter === "all" || p.post_type === typeFilter) &&
            (community === "all" || p.community.name === community)
        )
        .sort((a, b) => a.score - b.score),
    [inRange, typeFilter, community]
  )

  const presentTypes = POST_TYPES.filter((t) =>
    inRange.some((p) => p.post_type === t)
  );
  const topTags = useMemo(() => {
    const map = new Map<string, number>();
    inRange.forEach((p) =>
      p.tags?.forEach((t) => map.set(t, (map.get(t) ?? 0) + p.upvote))
    );
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [inRange]);

  const contributors = useMemo(() => {
    const map = new Map<string, { school: string; points: number }>();
    inRange.forEach((p) => {
      const cur = map.get(p.author.username) ?? { school: p.community.name, points: 0 };
      cur.points += p.upvote;
      map.set(p.author.username, cur);
    })

    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 4);
  }, [inRange])

  const trendingCommunities = useMemo(() => {
    const map = new Map<string, number>();
    inRange.forEach((p) =>
      map.set(p.community.name, (map.get(p.community.name) ?? 0) + p.upvote)
    );
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [inRange]);

  const [first, second, third, ...rest] = ranked;
  const podium = [second, third].filter(Boolean) as Post[];
  const hasFilters = typeFilter !== "all" || community !== "all";
  console.log(first)

  return (
    <div className="min-w-0 flex-1 space-y-4 pb-20 md:pb-5">
      <div className="mx-auto flex w-full gap-2 px-0 py-1">
        {/* Main */}
        <main className="min-w-0 flex-1 space-y-4">
          {/* Header + controls */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
                  <Flame className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Popular</h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    What the whole campus is talking about
                  </p>
                </div>
              </div>

              {/* Hot / Top / Rising */}
              <div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
                {SORTS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSort(id)}
                    aria-pressed={sort === id}
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                      sort === id
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-neutral-700"
                        : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">{activeSort && activeSort.hint}</p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
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
                  className="appearance-none rounded-xl border border-neutral-200 bg-white py-2 pl-3.5 pr-9 text-sm font-medium text-neutral-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                >
                  <option value="all">All communities</option>
                  {communities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  typeFilter === "all"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
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
                      : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
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
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Trending
              </span>
              {topTags.map(([tag]) => (
                <span
                  key={tag}
                  className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-700"
                >
                  <span className="text-indigo-500">#</span>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Results */}
          {!first ? (
            <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950">
                <Flame className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Nothing popular here yet
              </h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
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
              />

              {podium.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {podium.map((p) => (
                    <QuestionCard
                      key={p.id}
                      post={p}
                    />
                  ))}
                </div>
              )}

              {rest.length > 0 && (
                <>
                  <h2 className="px-1 pt-2 text-sm font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    More popular posts
                  </h2>
                  {rest.map((p) => (
                    <QuestionCard
                      key={p.id}
                      post={p}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="w-0 xl:w-72 transition-all duration-300 shrink-0 self-start xl:sticky xl:top-16 xl:block">
          <div className="hidden xl:block space-y-4">

            <SideCard title="Trending tags" subtitle={`Most upvoted ${rangeLabel}`}>
              {topTags.length === 0 ? (
                <p className="text-sm text-neutral-400 dark:text-neutral-500">No tags yet.</p>
              ) : (
                <ol className="space-y-2.5">
                  {topTags.slice(0, 6).map(([tag, points], i) => (
                    <li key={tag} className="flex items-center gap-3">
                      <span className="w-4 text-sm font-bold text-neutral-300 dark:text-neutral-600">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        <span className="text-indigo-500">#</span>
                        {tag}
                      </span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">{points}</span>
                    </li>
                  ))}
                </ol>
              )}
            </SideCard>

            <SideCard title="Top contributors" subtitle={`Most upvotes ${rangeLabel}`}>
              {contributors.length === 0 ? (
                <p className="text-sm text-neutral-400 dark:text-neutral-500">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {contributors.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="w-4 text-sm font-bold text-neutral-300 dark:text-neutral-600">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {c.name}
                        </div>
                        <div className="truncate text-xs text-neutral-400 dark:text-neutral-500">
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
                        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
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
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${isJoined
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
                          }`}
                      >
                        {isJoined ? "Joined" : "Join"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </SideCard>
          </div>
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