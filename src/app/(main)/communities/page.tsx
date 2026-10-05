"use client";

import React, { useState } from "react";
import CommunityCard from "@/components/main/community/community-card";
import { useCommunities } from "@/hooks/use-communities";
import { CategoryId } from "@/libs/types";
import Link from "next/link";
import { CommunityGridSkeleton } from "@/components/main/laoding-skeletons";



interface TrendingCommunity {
  id: string;
  name: string;
  members: string;
}

const TRENDING: TrendingCommunity[] = [
  { id: "cs", name: "r/ComputerScience", members: "12.4k students" },
  { id: "study", name: "r/StudyTips", members: "8.9k students" },
  { id: "scholarships", name: "r/Scholarships", members: "6.2k students" },
];

const POPULAR_QUESTIONS = [
  { id: "1", title: "Best resources for linear algebra?", answers: 14 },
  { id: "2", title: "Tips for surviving finals week?", answers: 32 },
];

const UNANSWERED_QUESTIONS = [
  { id: "1", title: "Need help with NP-Completeness proof", posted: "2h ago" },
  { id: "2", title: "How to setup React with Tailwind?", posted: "5h ago" },
];

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "academic", label: "Academic" },
  { id: "campus-life", label: "Campus Life" },
  { id: "career", label: "Career" },
];


export default function CommunitiesPage() {
  const [category, setCategory] = useState<CategoryId>("all");

  const { communities } = useCommunities();

  return (
    <>
      <main className="min-w-0 flex-1 space-y-4">
        {/* Header + filter chips */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sticky top-16 z-50">
          <h1 className="text-2xl font-bold text-neutral-900">
            Explore Communities
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active
                    ? "bg-indigo-600 text-white"
                    : "bg-[#eef1f6] text-neutral-600 hover:bg-neutral-200"
                    }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Community grid */}
        {
          communities.length > 0 ?
            <div className="min-h-screen bg-[#f4f6f9] p-0">
              <div className="mx-auto grid max-w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
             {communities.map((c) => (
                <CommunityCard key={c.id} community={c} />
                ))}
              </div>
            </div> :
            <CommunityGridSkeleton count={9} />
        }

      </main>
      {/* Right sidebar */}
      <aside className="hidden w-72 shrink-0 self-start space-y-4 xl:sticky xl:top-16 xl:block">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h3 className="font-semibold text-neutral-900">
            Trending Communities
          </h3>
          <div className="mt-3 space-y-3">
            {TRENDING.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-indigo-600">
                    {c.name}
                  </div>
                  <div className="text-xs text-neutral-400">{c.members}</div>
                </div>
                <button className="rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100">
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h3 className="font-semibold text-neutral-900">
            Popular Questions
          </h3>
          <div className="mt-3 space-y-3">
            {POPULAR_QUESTIONS.map((q) => (
              <div key={q.id}>
                <Link
                  href="#"
                  className="text-sm font-semibold text-neutral-800 hover:text-indigo-600"
                >
                  {q.title}
                </Link>
                <div className="text-xs text-neutral-400">
                  {q.answers} answers
                </div>
              </div>
            ))}
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
    </>
  );
}

