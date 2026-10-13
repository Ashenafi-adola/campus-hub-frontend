"use client";

import { PostFeedSkeleton } from "@/components/main/laoding-skeletons";
import RightSideBar from "@/components/main/layout/right-side-bar";
import QuestionCard from "@/components/main/question-card";
import { usePosts } from "@/hooks/use-posts";
import { getCommunities } from "@/libs/api";
import { Community } from "@/libs/types";
import {
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";



const USER_AVATAR = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=faces";


export default function CampusHubFeed() {
  const [trending, setTrending] = useState<Community[]>([]);
  useEffect(() => {
    getCommunities()
      .then(res => setTrending(res.length > 4 ? res.sort((a, b) => b.member_count - a.member_count).slice(0, 4) : res.sort((a, b) => b.member_count - a.member_count)))
  }, [])
  const { posts } = usePosts();
  return (
    <>
      {/* Main feed */}
      <main className="min-w-0 flex-1 space-y-4">
        {/* Ask question composer */}
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 sticky top-16 z-20">
          <Image
            width={40}
            height={40}
            src={USER_AVATAR}
            alt="You"
            unoptimized
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
          <input
            type="text"
            placeholder="Ask the community a question..."
            className="flex-1 rounded-full bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 placeholder:text-neutral-400 focus:outline-none"
          />
          <button className="shrink-0 rounded-full p-2.5 text-neutral-400 hover:bg-neutral-100">
            <ImageIcon className="h-5 w-5" />
          </button>
          <button className="shrink-0 rounded-full bg-indigo-600 px-5 py-2.5 hidden lg:block text-sm font-semibold text-white hover:bg-indigo-700">
            Ask Question
          </button>
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
