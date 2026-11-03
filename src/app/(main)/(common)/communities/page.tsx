"use client";

import { useEffect, useMemo, useState } from "react";
import CommunityCard from "@/components/main/community/community-card";
import { CommunityGridSkeleton } from "@/components/main/laoding-skeletons";
import { useCommunities } from "@/hooks/use-communities";
import { getCategories } from "@/libs/api";
import { Category } from "@/libs/types";

const ALL_CATEGORY: Category = {
  id: 0,
  name: "All",
  description: "All communities",
  slug: "all",
};

export default function CommunitiesPage() {
  const [selectedId, setSelectedId] = useState(ALL_CATEGORY.id);
  const [fetchedCategories, setFetchedCategories] = useState<Category[]>([]);
  const { communities } = useCommunities();

  useEffect(() => {
    const controller = new AbortController();

    getCategories(controller.signal)
      .then(setFetchedCategories)
      .catch((error) => {
        if (error?.name !== "AbortError") {
          console.error("Error fetching categories:", error);
        }
      });

    return () => controller.abort();
  }, []);

  // "All" is always available, even before categories have loaded.
  const categories = useMemo(
    () => [ALL_CATEGORY, ...fetchedCategories],
    [fetchedCategories],
  );

  const visibleCommunities = useMemo(() => {
    if (selectedId === ALL_CATEGORY.id) return communities;
    return communities.filter((c) => c.category?.id === selectedId);
  }, [selectedId, communities]);

  let content;
  if (communities.length === 0) {
    content = <CommunityGridSkeleton count={9} />;
  } else if (visibleCommunities.length === 0) {
    content = (
      <p className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        No communities in this category yet.
      </p>
    );
  } else {
    content = (
      <div className="grid max-w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>
    );
  }

  return (
    <main className="min-w-0 flex-1 space-y-4 pb-20 md:pb-5">
      {/* Header + filter chips */}
      <div className="sticky top-3 z-10 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-neutral-100">
          Explore Communities
        </h1>
        <div
          role="group"
          aria-label="Filter by category"
          className="scrollbar-none mt-4 flex max-w-full gap-2 overflow-x-auto pb-1  sm:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((c) => {
            const active = c.id === selectedId;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedId(c.id)}
                className={`max-w-48 shrink-0 truncate rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
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

      {content}
    </main>
  );
}