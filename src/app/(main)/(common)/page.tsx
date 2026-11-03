"use client";

import { PostFeedSkeleton } from "@/components/main/laoding-skeletons";
import QuestionCard from "@/components/main/post-card";
import { usePosts } from "@/hooks/use-posts";


export default function CampusHubFeed() {
  const { posts } = usePosts();
  return (
    <>
      {/* Main feed */}
      <main className="min-w-0 flex-1 space-y-4 px-0 pt-2 pb-20">
        
        {
          posts.length > 0 ? posts.map((p) => (
            <QuestionCard key={p.id} post={p} />
          )) : <PostFeedSkeleton />
        }
      </main>
    </>
  );
}
