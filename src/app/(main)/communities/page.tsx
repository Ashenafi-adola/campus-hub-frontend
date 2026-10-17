"use client";

import React, { useEffect, useMemo, useState } from "react";
import CommunityCard from "@/components/main/community/community-card";
import { useCommunities } from "@/hooks/use-communities";
import { Category } from "@/libs/types";
import { CommunityGridSkeleton } from "@/components/main/laoding-skeletons";
import { usePosts } from "@/hooks/use-posts";
import RightSideBar from "@/components/main/layout/right-side-bar";
import { getCategories } from "@/libs/api";

const allCategories: Category = {
  id: 0,
  name: "All",
  description: "All communities",
  slug: "all",
}

export default function CommunitiesPage() {
  const [category, setCategory] = useState<Category>(allCategories);
  const [categories, setCategories] = useState<Category[]>([]);
  const { posts } = usePosts();
  const { communities } = useCommunities();
  
  useEffect(() =>{
      getCategories()
        .then((data) => setCategories([allCategories, ...data]))
        .catch((error) => console.error("Error fetching categories:", error));
  },[]);

  const coms = useMemo(()=>{
    if (category.id === 0) return communities;
    return communities.filter((c) => c.category && c.category.id === category.id);
  }, [category, communities])
    
  return (
    <>
      <main className="min-w-0 flex-1 space-y-4">
        {/* Header + filter chips */}
        <div className="sticky top-16 z-10 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Explore Communities
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-4 py-2 text-sm w-40 truncate font-semibold transition-colors animate-marquee ${active
                    ? "bg-indigo-600 text-white"
                    : "bg-[#eef1f6] text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Community grid */}
        {
          coms.length > 0 ?
            <div className="min-h-screen bg-[#f4f6f9] p-0 dark:bg-neutral-950">
              <div className="mx-auto grid max-w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {coms.map((c) => (
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
