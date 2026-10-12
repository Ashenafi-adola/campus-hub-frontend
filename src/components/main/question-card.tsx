"use client"
import React, { useState } from 'react';
import Image from "next/image";
import { Post } from '@/libs/types';
import { ArrowBigDown, ArrowBigUp, Bookmark, MessageSquare, Share2 } from 'lucide-react';
import { getInitials, getTimeSince } from '@/libs/format';
import { downvotePostForCurrentUser, upvotePostForCurrentUser } from '@/app/actions/post-votes';
import { PostActionsMenu } from './post-actions';
import Link from 'next/link';
import { CommentThread } from './comment/comment-thread';


function QuestionCard({ post }: { post: Post }) {
  const [votes, setVotes] = useState(post.score);
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [content, setContent] = useState<string>(post.excerpt);
  const [saved, setSaved] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [hasOpenedComments, setHasOpenedComments] = useState<boolean>(false);

  if (!post?.author || !post?.community) return null;

  const panelId = `comment-${post.id}`
  const changeContent = () => {
    if (content.endsWith("...")) setContent(post.content);
    else setContent(post.excerpt);
  }


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
          {currentPost.author.avatar ?
            <Image
              src={currentPost.author.avatar || ""}
              alt={currentPost.author.username}
              width={40}
              height={40}
              unoptimized
              className="h-9 w-9 rounded-full object-cover"
            /> :
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="font-semibold text-white">
                {getInitials(currentPost.author.first_name + " " + currentPost.author.last_name)}
              </span>
            </div>
          }
          <div className="text-sm">
            <span className="font-semibold text-neutral-900">
              {currentPost.author.first_name}
            </span>
            <span className="text-neutral-400"> · {currentPost.post_type}</span>{" "}
            <span className="text-neutral-400">in</span>{" "}
            <Link href={`/communities/${currentPost.community.slug}`} className="font-medium text-indigo-600 hover:underline">
              {currentPost.community.name}
            </Link>
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
      <p
        onClick={() => { if (!content.endsWith("...")) changeContent() }}
        className="mt-1.5 text-sm leading-relaxed text-neutral-500">
        {content}
        {
          content.endsWith("...") && <span onClick={changeContent} className="text-indigo-500 text-sm hover:text-gray-800 hover:cursor-pointer">read more</span>
        }
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
                  className={`rounded-full p-1 hover:bg-neutral-100 ${
                    currentPost.upvoted ? "text-indigo-600" : ""
                  }`}
                  aria-label="Upvote"
                >
                  <ArrowBigUp
                    className={`h-5 w-5 ${currentPost.upvoted ? "fill-indigo-600" : ""}`}
                  />
                </button>
                <span
                  className={`min-w-[1.5rem] text-center text-xs font-bold ${
                    currentPost.upvoted
                      ? "text-indigo-600"
                      : currentPost.downvoted
                      ? "text-rose-500"
                      : "text-neutral-600"
                  }`}
                >
                  {votes}
                </span>
                <button
                  onClick={downVote}
                  className={`rounded-full p-1 hover:bg-neutral-100 ${
                    currentPost.downvoted ? "text-rose-500" : ""
                  }`}
                  aria-label="Downvote"
                >
                  <ArrowBigDown
                    className={`h-5 w-5 ${currentPost.downvoted ? "fill-rose-500" : ""}`}
                  />
                </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <button
            onClick={() => {
              setOpen((wasOpen) => !wasOpen);
              setHasOpenedComments(true);
            }}
            className="flex items-center gap-1.5 hover:text-neutral-800">
            <MessageSquare className="h-4 w-4" />
            {post.comment_count} answers
          </button>
          <button className="flex items-center gap-1.5 hover:text-neutral-800">
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button onClick={() => setSaved((v) => !v)} className="hover:text-neutral-800">
            <Bookmark className={`h-4 w-4 ${saved ? "fill-neutral-900 text-neutral-900" : ""}`} />
          </button>
          <PostActionsMenu isOwner={false} />
        </div>
      </div>

      {/* Animated expand / collapse region */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out ${open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
          }`}
      >
        {hasOpenedComments &&
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-neutral-100 bg-neutral-50/40">
              <CommentThread
                post={post}
                total={post.comment_count}
                enabled={open}
              />
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default QuestionCard