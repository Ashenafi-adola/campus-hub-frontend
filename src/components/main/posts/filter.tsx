"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Chip } from "@/components/shared/ui";
import type { PostQuery, PostType } from "@/libs/types";

/* -------------------------------------------------------------------------- */
/*  Filter model                                                              */
/* -------------------------------------------------------------------------- */

export type PostSort = "hot" | "top" | "rising" | "new" | "votes" | "answers";
export type PostRange = "day" | "week" | "month" | "all";
export type AnsweredFilter = "all" | "answered" | "unanswered";

export interface PostFilters {
    search: string;
    sort: PostSort;
    type: PostType | "all";
    community: string; // community slug, "" = any
    answered: AnsweredFilter;
    range: PostRange;
}

export const DEFAULT_FILTERS: PostFilters = {
    search: "",
    sort: "top",
    type: "all",
    community: "",
    answered: "all",
    range: "all",
};

const POST_TYPES: PostType[] = ["question", "discussion", "image", "poll"];
const SORT_VALUES: readonly PostSort[] = ["hot", "top", "rising", "new", "votes", "answers"];
const TYPE_VALUES: readonly (PostType | "all")[] = ["all", ...POST_TYPES];
const ANSWERED_VALUES: readonly AnsweredFilter[] = ["all", "answered", "unanswered"];
const RANGE_VALUES: readonly PostRange[] = ["day", "week", "month", "all"];

/**
 * Backend `ordering` value for each sort. Tune these to your API.
 * (The old Popular page never actually applied hot/rising, so these two are my guess.)
 */
const SORT_TO_ORDERING: Record<PostSort, string> = {
    top: "-score",
    hot: "-comment_count,-score",
    rising: "-created_at",
    new: "-created_at",
    votes: "-upvote",
    answers: "-comment_count",
};

const RANGE_HOURS: Record<PostRange, number> = { day: 24, week: 168, month: 720, all: Infinity };
const HOUR_MS = 3_600_000;

/** Rounded to the hour so page 1 and page 2 of the same feed use the same cutoff. */
function rangeToCreatedAfter(range: PostRange): string | undefined {
    const hours = RANGE_HOURS[range];
    if (!Number.isFinite(hours)) return undefined;
    const nowHour = Math.floor(Date.now() / HOUR_MS) * HOUR_MS;
    return new Date(nowHour - hours * HOUR_MS).toISOString();
}

/* -------------------------------------------------------------------------- */
/*  URL <-> filters                                                           */
/* -------------------------------------------------------------------------- */

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
    return allowed.includes(value as T) ? (value as T) : fallback;
}

/** ?q=...&sort=new&type=question&community=slug&answered=unanswered&range=week */
export function parseFilters(
    params: Pick<URLSearchParams, "get">,
    defaults: PostFilters = DEFAULT_FILTERS
): PostFilters {
    return {
        search: (params.get("q") ?? defaults.search).trim(),
        sort: pick(params.get("sort"), SORT_VALUES, defaults.sort),
        type: pick(params.get("type"), TYPE_VALUES, defaults.type),
        community: params.get("community") ?? defaults.community,
        answered: pick(params.get("answered"), ANSWERED_VALUES, defaults.answered),
        range: pick(params.get("range"), RANGE_VALUES, defaults.range),
    };
}

/** Writes only values that differ from the defaults so URLs stay clean. */
export function filtersToSearchParams(
    f: PostFilters,
    defaults: PostFilters = DEFAULT_FILTERS
): URLSearchParams {
    const p = new URLSearchParams();
    const set = (key: string, value: string, def: string) => {
        if (value && value !== def) p.set(key, value);
    };
    set("q", f.search, defaults.search);
    set("sort", f.sort, defaults.sort);
    set("type", f.type, defaults.type);
    set("community", f.community, defaults.community);
    set("answered", f.answered, defaults.answered);
    set("range", f.range, defaults.range);
    return p;
}

/** Maps filters to backend query params (page / pageSize are added by the hook). */
export function filtersToQuery(f: PostFilters): Omit<PostQuery, "page" | "pageSize"> {
    return {
        search: f.search || undefined,
        ordering: SORT_TO_ORDERING[f.sort],
        postType: f.type === "all" ? undefined : f.type,
        community: f.community || undefined,
        answered: f.answered === "all" ? undefined : f.answered === "answered",
        createdAfter: rangeToCreatedAfter(f.range),
    };
}

export function countActiveFilters(f: PostFilters, defaults: PostFilters = DEFAULT_FILTERS): number {
    return (Object.keys(defaults) as (keyof PostFilters)[]).filter((k) => f[k] !== defaults[k]).length;
}

/* -------------------------------------------------------------------------- */
/*  Hook: filters live in the URL (shareable, survives refresh / back button) */
/* -------------------------------------------------------------------------- */

export interface PostFilterOptions {
    /** Starting values for this page (e.g. sort: "new"). Not written to the URL. */
    defaults?: Partial<PostFilters>;
    /** Values locked for this page (e.g. type: "question"). The URL can't change them. */
    fixed?: Partial<PostFilters>;
}

/**
 * `options` must be a stable reference (define it at module level).
 * Needs a <Suspense> boundary above it (Next.js requirement for useSearchParams).
 */
export function usePostFilters(options?: PostFilterOptions) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const defaults = useMemo<PostFilters>(
        () => ({ ...DEFAULT_FILTERS, ...options?.defaults, ...options?.fixed }),
        [options]
    );

    const filters = useMemo<PostFilters>(
        () => ({ ...parseFilters(searchParams, defaults), ...options?.fixed }),
        [searchParams, defaults, options]
    );

    // history.replaceState updates the URL instantly and Next.js syncs useSearchParams
    // with it (Next 14.1+). router.replace would do a server round trip for every
    // click, so the active chip only changed after the navigation finished.
    const replaceUrl = useCallback(
        (qs: string) => {
            window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
        },
        [pathname]
    );

    const setFilters = useCallback(
        (patch: Partial<PostFilters>) => {
            const next = { ...filters, ...patch, ...options?.fixed };
            replaceUrl(filtersToSearchParams(next, defaults).toString());
        },
        [filters, defaults, options, replaceUrl]
    );

    const resetFilters = useCallback(() => replaceUrl(""), [replaceUrl]);

    return { filters, setFilters, resetFilters };
}

/* -------------------------------------------------------------------------- */
/*  UI (used by the main feed; Popular / Questions have their own controls)   */
/* -------------------------------------------------------------------------- */

const TYPE_OPTIONS: { value: PostFilters["type"]; label: string }[] = [
    { value: "all", label: "All" },
    { value: "question", label: "Questions" },
    { value: "discussion", label: "Discussions" },
    { value: "image", label: "Images" },
    { value: "poll", label: "Polls" },
];

/* Shared with the post form and profile page so all three read as one app. */
const CARD =
    "rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900";
const FIELD =
    "rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500";

interface PostFiltersBarProps {
    filters: PostFilters;
    onChange: (patch: Partial<PostFilters>) => void;
    onReset: () => void;
}

export function PostFiltersBar({ filters, onChange, onReset }: PostFiltersBarProps) {
    const [text, setText] = useState(filters.search);

    // Debounce typing so we don't hit the backend on every keystroke.
    useEffect(() => {
        const value = text.trim();
        if (value === filters.search) return;
        const t = setTimeout(() => onChange({ search: value }), 400);
        return () => clearTimeout(t);
    }, [text, filters.search, onChange]);

    const active = countActiveFilters(filters);

    return (
        <div className={`${CARD} space-y-3 sticky z-50 top-0`}>
            <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                    <Search
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Search posts..."
                        aria-label="Search posts"
                        className={`${FIELD} w-full pl-10`}
                    />
                </div>
                <select
                    value={filters.sort}
                    onChange={(e) => onChange({ sort: e.target.value as PostSort })}
                    className={`${FIELD} shrink-0 font-medium`}
                    aria-label="Sort posts"
                >
                    <option value="top">Top</option>
                    <option value="new">Newest</option>
                </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {TYPE_OPTIONS.map((o) => (
                    <Chip
                        key={o.value}
                        active={filters.type === o.value}
                        onClick={() => onChange({ type: o.value })}
                    >
                        {o.label}
                    </Chip>
                ))}

                <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    <input
                        type="checkbox"
                        checked={filters.answered === "unanswered"}
                        onChange={(e) => onChange({ answered: e.target.checked ? "unanswered" : "all" })}
                        className="h-4 w-4 rounded border-neutral-300 accent-indigo-600 dark:border-neutral-600"
                    />
                    Unanswered
                </label>

                {active > 0 && (
                    <button
                        type="button"
                        onClick={() => {
                            setText("");
                            onReset();
                        }}
                        className="ml-auto text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        Clear filters ({active})
                    </button>
                )}
            </div>
        </div>
    );
}