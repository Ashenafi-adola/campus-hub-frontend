"use client"
import React, { useState } from 'react';
import Image from "next/image";
import { Post } from '@/libs/types';
import { ArrowDown, ArrowUp, Bookmark, MessageSquare, MoreHorizontal, Share2 } from 'lucide-react';
import { getTimeSince } from '@/libs/format';
import { downvotePostForCurrentUser, upvotePostForCurrentUser } from '@/app/actions/post-votes';


function QuestionCard({ post }: { post: Post }) {
  const [votes, setVotes] = useState(post.score);
  const [currentPost, setCurrentPost] = useState<Post>(post);
  
  if (!post?.author || !post?.community) return null;

  const upVote = async () => {
      const res = await upvotePostForCurrentUser(post.slug);
      setVotes(res.score);
      setCurrentPost(res);
    }
  
  const downVote = async () => {
      const res = await downvotePostForCurrentUser(post.slug);
      setVotes(res.score);
      setCurrentPost(res);
    }
  

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src={currentPost.author.avatar || ""}
            alt={currentPost.author.username}
            width={40}
            height={40}
            unoptimized
            className="h-9 w-9 rounded-full object-cover"
          />
          <div className="text-sm">
            <span className="font-semibold text-neutral-900">
              {currentPost.author.first_name}
            </span>
            <span className="text-neutral-400"> · {currentPost.post_type}</span>{" "}
            <span className="text-neutral-400">in</span>{" "}
            <a href="#" className="font-medium text-indigo-600 hover:underline">
              {currentPost.community.name}
            </a>
            <div className="text-xs text-neutral-400">{getTimeSince(currentPost.created_at)}</div>
          </div>
        </div>
        {currentPost.status && (
          <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            Unanswered
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-bold text-neutral-900">
        {currentPost.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
        {currentPost.content}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {/* {currentPost.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
          >
            {tag}
          </span>
        ))} */}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3.5">
        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl">
          <button
            onClick={upVote}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-semibold ${currentPost.upvoted ? "bg-indigo-100 text-indigo-600" : "text-neutral-500 hover:bg-neutral-50"
              }`}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
            {votes}
          <button 
          onClick={downVote}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-semibold ${currentPost.downvoted ? "bg-indigo-100 text-indigo-600" : "text-neutral-500 hover:bg-neutral-50"
              }`}
            >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <button className="flex items-center gap-1.5 hover:text-neutral-800">
            <MessageSquare className="h-4 w-4" />
            {12} answers
          </button>
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