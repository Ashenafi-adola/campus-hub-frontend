"use client";

import React, { useState } from "react";
import CommunityCard from "@/components/main/community/community-card";
import { useCommunities } from "@/hooks/use-communities";
import { CategoryId } from "@/libs/types";
import { CommunityGridSkeleton } from "@/components/main/laoding-skeletons";
import { usePosts } from "@/hooks/use-posts";
import RightSideBar from "@/components/main/layout/right-side-bar";


const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "academic", label: "Academic" },
  { id: "campus-life", label: "Campus Life" },
  { id: "career", label: "Career" },
];


export default function CommunitiesPage() {
  const [category, setCategory] = useState<CategoryId>("all");
  const { posts } = usePosts();
  const { communities } = useCommunities();

  return (
    <>
      <main className="min-w-0 flex-1 space-y-4">
        {/* Header + filter chips */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sticky top-16">
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
      <RightSideBar trending={communities.sort((a, b) => b.member_count - a.member_count).slice(0, 4)} posts={posts} />
    </>
  );
}

