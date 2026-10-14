"use client";

import React, { useState } from 'react'
import { joinLeaveCommunity } from '@/libs/api';
import { Community, Post } from '@/libs/types'
import Link from 'next/link';
import { PopularPostsSkeleton, TrendingCommunitiesSkeleton } from '../laoding-skeletons';



const UNANSWERED_QUESTIONS = [
    { id: "1", title: "Need help with NP-Completeness proof", posted: "2h ago" },
    { id: "2", title: "How to setup React with Tailwind?", posted: "5h ago" },
];

type Props = {
    posts: Post[];
    trending: Community[];
}

function RightSideBar({ posts, trending }: Props) {
    return (
        <aside className="hidden w-72 shrink-0 self-start space-y-4 xl:sticky xl:top-16 xl:block">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-semibold text-neutral-900">
                    Trending Communities
                </h3>
                <div className="mt-3 space-y-3">
                    { trending.length > 0 ?
                    trending.map((c) => (
                        <Trending key={c.id} community={c} />
                    )) : <TrendingCommunitiesSkeleton count={4}/>
                    }
                </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-semibold text-neutral-900">
                    Popular Questions
                </h3>
                <div className="mt-3 space-y-3">
                    { posts.length > 0 ?
                    posts.filter(p => p.post_type == "question").sort((a, b) => b.score - a.score).slice(0, 3).map((q) => (
                        <div key={q.id}>
                            <Link
                                href="#"
                                className="text-sm font-semibold text-neutral-800 hover:text-indigo-600"
                            >
                                {q.title}
                            </Link>
                            <div className="text-xs text-neutral-400">
                                {q.comment_count} answers
                            </div>
                        </div>
                    )) : <PopularPostsSkeleton/>
                    }
                </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h3 className="font-semibold text-neutral-900">
                    Unanswered Questions
                </h3>
                <div className="mt-3 space-y-3">
                    {UNANSWERED_QUESTIONS.map((q) => (
                        <div key={q.id}>
                            <Link
                                href="#"
                                className="text-sm font-semibold text-neutral-800 hover:text-indigo-600"
                            >
                                {q.title}
                            </Link>
                            <div className="text-xs text-neutral-400">
                                Posted {q.posted}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    )
}

export default RightSideBar


function Trending({ community }: { community: Community }) {
    const [joined, setJoined] = useState<boolean>(Boolean(community.is_member));

    return (
        <div key={community.id} className="flex items-center justify-between">
            <div>
                <Link href={`/communities/${community.slug}`} className="text-sm font-semibold text-indigo-600 w-40 block truncate">
                    c/{community.name}
                </Link>
                <div className="text-xs text-neutral-400">{community.member_count} students</div>
            </div>
            <button
                onClick={async () => { await joinLeaveCommunity(Boolean(community.is_member), community.slug); setJoined(!joined) }}
                className={`flex-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${joined
                    ? "bg-red-100 text-black hover:bg-red-200"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    }`}
            >
                {joined ? (
                    <span className="flex items-center justify-center gap-1.5">
                        leave
                    </span>
                ) : (
                    "join"
                )}
            </button>
        </div>
    )
}