"use client";

import React, { useContext, useMemo, useState } from "react";
import Link from "next/link";
import { joinLeaveCommunity } from "@/libs/api";
import { Community, Post } from "@/libs/types";
import {
  PopularPostsSkeleton,
  TrendingCommunitiesSkeleton,
} from "../laoding-skeletons";
import { AuthContext } from "@/context/auth-context";

type Props = {
  posts: Post[];
  trending: Community[];
  /**
   * Pass this when you know the data is still loading.
   * If omitted, an empty list is treated as "loading", same as before.
   */
  loading?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

// Adjust to your real post route
const postHref = (p: Post) => `/posts/detail/${p.id}`;

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(iso)
  );
}

/* ------------------------------------------------------------------ */
/*  Building blocks                                                    */
/* ------------------------------------------------------------------ */

export function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-neutral-400 dark:text-neutral-500">{children}</p>
  );
}

function QuestionItem({
  href,
  title,
  meta,
}: {
  href: string;
  title: string;
  meta: string;
}) {
  return (
    <div>
      <Link
        href={href}
        className="line-clamp-2 text-sm font-semibold text-neutral-800 transition-colors hover:text-indigo-600 dark:text-neutral-200 dark:hover:text-indigo-300"
      >
        {title}
      </Link>
      {/* relative times can differ between server and client render */}
      <div
        suppressHydrationWarning
        className="text-xs text-neutral-400 dark:text-neutral-500"
      >
        {meta}
      </div>
    </div>
  );
}

export function TrendingItem({ community }: { community: Community }) {
  const [joined, setJoined] = useState(Boolean(community.is_member));
  const [members, setMembers] = useState(Number(community.member_count) || 0);
  const [pending, setPending] = useState(false);
  const { user } = useContext(AuthContext)
  const toggle = async () => {
    if (pending) return;
    const wasJoined = joined;

    // Optimistic update, rolled back if the request fails
    setPending(true);
    setJoined(!wasJoined);
    setMembers((n) => n + (wasJoined ? -1 : 1));

    try {
      // Pass the *current* membership state, not the stale prop
      await joinLeaveCommunity(wasJoined, community.slug);
    } catch {
      setJoined(wasJoined);
      setMembers((n) => n + (wasJoined ? 1 : -1));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <Link
          href={`/communities/${community.slug}`}
          className="block truncate text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          c/{community.name}
        </Link>
        <div className="text-xs text-neutral-400 dark:text-neutral-500">
          {compact.format(members)} {members === 1 ? "student" : "students"}
        </div>
      </div>

      <button
        onClick={toggle}
        disabled={community.creator?.username === user.username}
        aria-pressed={joined}
        aria-label={`${joined ? "Leave" : "Join"} ${community.name}`}
        className={`group min-w-[4.5rem] shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          joined
            ? "bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
        }`}
      >
        {(joined && community.creator.email !== user.username )? (
          <>
            <span className="group-hover:hidden">Joined</span>
            <span className="hidden group-hover:inline">Leave</span>
          </>
        ) : (
          "Join"
        )}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

function RightSideBar({ posts, trending, loading }: Props) {
  const postsLoading = loading ?? posts.length === 0;
  const trendingLoading = loading ?? trending.length === 0;

  const questions = useMemo(
    () => posts.filter((p) => p.post_type === "question"),
    [posts]
  );

  // Copy before sorting so the `posts` prop is never mutated
  const popular = useMemo(
    () => [...questions].sort((a, b) => b.score - a.score).slice(0, 3),
    [questions]
  );

  // Filter first, then sort and slice, otherwise the slice can drop
  // unanswered questions before they're ever considered
  const unanswered = useMemo(
    () =>
      questions
        .filter((q) => !q.answered)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 4),
    [questions]
  );

  return (
    <aside className="w-0 xl:w-72 transition-all duration-300 shrink-0 self-start xl:sticky xl:top-16">
      <div className="hidden xl:block space-y-4">
        <SidebarCard title="Trending Communities">
          {trendingLoading ? (
            <TrendingCommunitiesSkeleton count={4} />
          ) : trending.length > 0 ? (
            trending.map((c) => <TrendingItem key={c.id} community={c} />)
          ) : (
            <EmptyNote>No communities are trending yet.</EmptyNote>
          )}
        </SidebarCard>

        <SidebarCard title="Popular Questions">
          {postsLoading ? (
            <PopularPostsSkeleton />
          ) : popular.length > 0 ? (
            popular.map((q) => (
              <QuestionItem
                key={q.id}
                href={postHref(q)}
                title={q.title}
                meta={plural(q.comment_count, "answer", "answers")}
              />
            ))
          ) : (
            <EmptyNote>No questions yet.</EmptyNote>
          )}
        </SidebarCard>

        <SidebarCard title="Unanswered Questions">
          {postsLoading ? (
            <PopularPostsSkeleton />
          ) : unanswered.length > 0 ? (
            unanswered.map((q) => (
              <QuestionItem
                key={q.id}
                href={postHref(q)}
                title={q.title}
                meta={`Posted ${timeAgo(q.created_at)}`}
              />
            ))
          ) : (
            <EmptyNote>Every question has an answer. Nice.</EmptyNote>
          )}
        </SidebarCard>
      </div>
    </aside>
  );
}

export default RightSideBar;