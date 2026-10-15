"use client";

import { PostFeedSkeleton } from "@/components/main/laoding-skeletons";
import RightSideBar from "@/components/main/layout/right-side-bar";
import QuestionCard from "@/components/main/question-card";
import { Avatar } from "@/components/shared/ui";
import { usePosts } from "@/hooks/use-posts";
import { getCommunities } from "@/libs/api";
import { Community } from "@/libs/types";
import {
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth-context";



export default function CampusHubFeed() {
  const [trending, setTrending] = useState<Community[]>([]);
  useEffect(() => {
    getCommunities()
      .then(res => setTrending(res.length > 4 ? res.sort((a, b) => b.member_count - a.member_count).slice(0, 4) : res.sort((a, b) => b.member_count - a.member_count)))
  }, [])
  const { posts } = usePosts();
  const { user } = useContext(AuthContext);
  return (
    <>
      {/* Main feed */}
      <main className="min-w-0 flex-1 space-y-4">
        {/* Ask question composer */}
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 sticky top-15 z-50">
          <Avatar user={user} />
          <Link
            href={"/posts/new"}
            className="flex-1 rounded-full bg-[#eef1f6] px-4 py-2.5 text-left text-sm text-neutral-500 hover:bg-neutral-200/70"
          >
            Ask the community a question...
          </Link>
          <Link
            href={"/posts/new"}
            aria-label="Create image post"
            className="rounded-full p-2.5 text-neutral-400 hover:bg-neutral-100"
          >
            <ImageIcon className="h-5 w-5" />
          </Link>
          <Link
            href={"/posts/new"}
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Create Post
          </Link>
        </div>

        {/* Question list */}
        {
          posts.length > 0 ? posts.map((p) => (
            <QuestionCard key={p.id} post={p} />
          )) : <PostFeedSkeleton />
        }
      </main>

      {/* Right sidebar */}
      <RightSideBar posts={posts} trending={trending} />
    </>
  );
}
