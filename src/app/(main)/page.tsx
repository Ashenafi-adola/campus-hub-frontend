"use client"

import React, { useState } from "react";
import {
  ChevronDown,
  Bookmark,
  Image as ImageIcon,
  ChevronUp,
  MessageSquare,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";


interface Question {
  id: string;
  author: string;
  authorAvatar: string;
  affiliation: string;
  community: string;
  postedAt: string;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  answers: number;
  unanswered?: boolean;
}

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

const QUESTIONS: Question[] = [
  {
    id: "1",
    author: "Sophia Martinez",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
    affiliation: "Stanford University",
    community: "r/ComputerScience",
    postedAt: "2 hours ago",
    title: "How can I understand recursion in Python?",
    body: "I've been trying to wrap my head around call stacks and base cases. Every time I write a recursive function, I end up with a stack overflow error or returning None. Are there any mental models or drawings that help?",
    tags: ["Python", "Recursion", "Beginner"],
    upvotes: 42,
    answers: 8,
    unanswered: true,
  },
  {
    id: "2",
    author: "Ethan Wright",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces",
    affiliation: "MIT",
    community: "r/Mathematics",
    postedAt: "4 hours ago",
    title: "Best resources for linear algebra?",
    body: "My professor is moving extremely fast and the textbook is super abstract. Are there any online series, visual guides, or supplementary problem sheets you'd highly recommend for someone who needs geometric intuitio...",
    tags: ["LinearAlgebra", "StudyResources", "MIT"],
    upvotes: 89,
    answers: 15,
  },
  {
    id: "3",
    author: "Lily Chen",
    authorAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=faces",
    affiliation: "UC Berkeley",
    community: "r/StudyTips",
    postedAt: "1 day ago",
    title: "Tips for surviving finals week?",
    body: "Facing three back-to-back exams next week and the stress is setting in. How do you guys block out your study days, organize summaries, and keep your sanity without burning out entirely by Wednesday?",
    tags: ["Finals", "Productivity", "MentalHealth"],
    upvotes: 112,
    answers: 24,
  },
];

function QuestionCard({ question }: { question: Question }) {
  const [votes, setVotes] = useState(question.upvotes);
  const [voted, setVoted] = useState(false);

  const toggleVote = () => {
    setVoted((v) => !v);
    setVotes((v) => (voted ? v - 1 : v + 1));
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={question.authorAvatar}
            alt={question.author}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div className="text-sm">
            <span className="font-semibold text-neutral-900">
              {question.author}
            </span>
            <span className="text-neutral-400"> · {question.affiliation}</span>{" "}
            <span className="text-neutral-400">in</span>{" "}
            <a href="#" className="font-medium text-indigo-600 hover:underline">
              {question.community}
            </a>
            <div className="text-xs text-neutral-400">{question.postedAt}</div>
          </div>
        </div>
        {question.unanswered && (
          <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            Unanswered
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-bold text-neutral-900">
        {question.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
        {question.body}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3.5">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleVote}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-semibold ${voted ? "bg-indigo-50 text-indigo-600" : "text-neutral-500 hover:bg-neutral-50"
              }`}
          >
            <ChevronUp className="h-4 w-4" />
            {votes}
          </button>
          <button className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-50">
            <ChevronDown className="h-4 w-4 rotate-180" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            {question.answers} answers
          </span>
          <button className="flex items-center gap-1.5 hover:text-neutral-800">
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button className="hover:text-neutral-800">
            <Bookmark className="h-4 w-4" />
          </button>
          <button className="hover:text-neutral-800">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CampusHubFeed() {

  return (
    <>
      {/* Main feed */}
      <main className="min-w-0 flex-1 md:ml-60 space-y-4">
        {/* Ask question composer */}
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3">
          <Image
            width={40}
            height={40}
            src=""
            alt="You"
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
        {QUESTIONS.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </main>

      {/* Right sidebar */}
      <aside className="w-72 shrink-0 hidden lg:block space-y-4 sticky">
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
