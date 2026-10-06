"use client";

import { PostFeedSkeleton } from "@/components/main/laoding-skeletons";
import QuestionCard from "@/components/main/question-card";
import { usePosts } from "@/hooks/use-posts";
import {
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";



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

const USER_AVATAR = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=faces";


export default function CampusHubFeed() {

  const { posts } = usePosts();
  return (
    <>
      {/* Main feed */}
      <main className="min-w-0 flex-1 space-y-4">
        {/* Ask question composer */}
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 sticky top-16 z-50">
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
          <button className="shrink-0 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
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
