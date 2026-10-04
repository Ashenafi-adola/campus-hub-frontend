"use client"
import React, { useState } from 'react';
import Image from "next/image";
import { Post } from '@/libs/types';
import { Bookmark, ChevronDown, ChevronUp, MessageSquare, MoreHorizontal, Share2 } from 'lucide-react';
import { getTimeSince } from '@/libs/formatters';


function QuestionCard({ post }: { post: Post }) {
  const [votes, setVotes] = useState(()=>post.score);
  const [voted, setVoted] = useState(false);
  console.log(post.author)

  const toggleVote = () => {
    setVoted((v) => !v);
    setVotes((v) => (voted ? v - 1 : v + 1));
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src={post?.author.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces"}
            alt={post?.author.username}
            width={40}
            height={40}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div className="text-sm">
            <span className="font-semibold text-neutral-900">
              {post?.author.first_name}
            </span>
            <span className="text-neutral-400"> · {post?.post_type}</span>{" "}
            <span className="text-neutral-400">in</span>{" "}
            <a href="#" className="font-medium text-indigo-600 hover:underline">
              {post?.community.name}
            </a>
            <div className="text-xs text-neutral-400">{getTimeSince(post?.created_at)}</div>
          </div>
        </div>
        {post?.status && (
          <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            Unanswered
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-bold text-neutral-900">
        {post?.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
        {post?.content}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {/* {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
          >
            {tag}
          </span>
        ))} */}
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
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            {12} answers
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

export default QuestionCard