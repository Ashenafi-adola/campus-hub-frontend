"use client";

import { Suspense } from "react";
import { PostFeedSkeleton } from "@/components/main/laoding-skeletons";
import { PostFiltersBar, usePostFilters } from "@/components/main/posts/filter";
import { PostList } from "@/components/main/posts/post-list";
import { usePosts } from "@/hooks/use-posts";

function Feed() {
  const { filters, setFilters, resetFilters } = usePostFilters();
  const { posts, loading, loadingMore, error, hasMore, loadMore, retry } = usePosts(filters);

  return (
    <>
      <PostFiltersBar filters={filters} onChange={setFilters} onReset={resetFilters} />
      <PostList
        posts={posts}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRetry={retry}
        mode="infinite" // switch to "button" for a "See more" button
      />
    </>
  );
}

    
export default function CampusHubFeed() {
  return (
    <main className="min-w-0 flex-1 space-y-4 px-0 pt-2 pb-20">
      {/* useSearchParams (inside usePostFilters) requires a Suspense boundary */}
      <Suspense fallback={<PostFeedSkeleton />}>
        <Feed />
      </Suspense>
    </main>
  );
}