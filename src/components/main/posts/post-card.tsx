"use client"
import React, { useState } from 'react';
import Image from "next/image";
import { Post } from '@/libs/types';
import { ArrowBigDown, ArrowBigUp, Bookmark, MessageSquare, Share2 } from 'lucide-react';
import { getTimeSince } from '@/libs/format';
import { downvotePostForCurrentUser, upvotePostForCurrentUser } from '@/app/actions/post-votes';
import { PostActionsMenu } from '../post-actions';
import Link from 'next/link';
import { CommentThread } from '../comment/comment-thread';
import { Avatar, PollBlock } from '@/components/shared/ui';
import { saveUnsave } from '@/libs/api';
import ImageLightbox from '../posts/image-light-box';


function QuestionCard({ post }: { post: Post }) {
  const [votes, setVotes] = useState(post.score);
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [content, setContent] = useState<string>(post.excerpt);
  const [saved, setSaved] = useState<boolean>(post.is_saved);
  const [open, setOpen] = useState<boolean>(false);
  const [hasOpenedComments, setHasOpenedComments] = useState<boolean>(false);
  // Index of the image being viewed in the lightbox, or null when it's closed
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const unanswered = post.post_type === "question" && post.comment_count === 0;
  if (!post?.author || !post?.community) return null;

  const panelId = `comment-${post.id}`
  const changeContent = () => {
    if (content.endsWith("...")) setContent(post.content);
    else setContent(post.excerpt);
  }

  const handleSave = () => {
    if (saved){
      saveUnsave(saved, post.id).then(()=>setSaved(!saved)).catch(error=>console.log(error))
    }else{
      saveUnsave(saved, post.id).then(()=>setSaved(!saved)).catch(error=>console.log(error))
    }
  }

  const upVote = async () => {
    const res = await upvotePostForCurrentUser(post.id);
    setVotes(res.score);
    setCurrentPost(res);
  }

  const downVote = async () => {
    const res = await downvotePostForCurrentUser(post.id);
    setVotes(res.score);
    setCurrentPost(res);
  }

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            href={`/u/activity/${currentPost.author.username}`}
          >
            <Avatar profile={currentPost.author.profile}/>
          </Link>
          <div className="text-sm">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {currentPost.author.profile?.first_name}
            </span>
            <span className="text-neutral-400 dark:text-neutral-500"> · {currentPost.post_type}</span>{" "}
            <span className="text-neutral-400 dark:text-neutral-500">in</span>{" "}
            <Link href={`/communities/${currentPost.community.slug}`} className="font-medium text-indigo-600 hover:underline">
              {currentPost.community.name}
            </Link>
            <div className="text-xs text-neutral-400 dark:text-neutral-500">{getTimeSince(currentPost.created_at)}</div>
          </div>
        </div>
        {unanswered && (
          <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-950/50 dark:text-orange-300">
            Unanswered
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">
        <Link
          href={`/posts/detail/${post.id}`}
        >
          {currentPost.title}
        </Link>
      </h3>
      <p
        onClick={() => { if (!content.endsWith("...")) changeContent() }}
        className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        {content}
        {
          content.endsWith("...") && <span onClick={changeContent} className="cursor-pointer text-sm text-indigo-500 hover:text-gray-800 dark:hover:text-neutral-100">read more</span>
        }
      </p>
      {post.images && post.images.length > 0 && (
        post.images.length === 1 ? (
          // Single image: keep the natural aspect ratio, never crop. Click to open the viewer.
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            aria-label="View image full screen"
            className="group relative mt-3 flex w-full cursor-zoom-in justify-center overflow-hidden rounded-xl bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:bg-neutral-800"
          >
            <Image
              src={post.images[0]}
              alt={currentPost.title}
              width={800}
              height={600}
              unoptimized
              className="h-auto max-h-[32rem] w-auto max-w-full object-contain"
            />
            <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </button>
        ) : (
          // Multiple images: uniform tiles, up to 4 shown, "+N" on the last one.
          // Each tile opens the viewer at that image.
          <div className="mt-3 grid grid-cols-2 gap-2 overflow-hidden rounded-xl">
            {post.images.slice(0, 4).map((src, i) => {
              const extra = post.images!.length - 4;
              const isLast = i === 3 && extra > 0;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={isLast
                    ? `View all ${post.images!.length} images`
                    : `View image ${i + 1} of ${post.images!.length}`}
                  className={`group relative block aspect-[4/3] cursor-zoom-in overflow-hidden bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500 dark:bg-neutral-800 ${post.images!.length === 3 && i === 0 ? "col-span-2 aspect-[16/9]" : ""
                    }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 50vw, 400px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  {isLast && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xl font-semibold text-white">
                      +{extra}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )
      )}


      {currentPost.post_type === "poll" && currentPost.polls && <PollBlock options={currentPost.polls} />}
      <div className="mt-3 flex mb-2 flex-wrap gap-2">
        {currentPost.tags && currentPost.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3.5 dark:border-neutral-800">
        <div className="flex items-center gap-1 rounded-2xl bg-gray-100 dark:bg-neutral-800">
          <button
            onClick={upVote}
            className={`rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 ${currentPost.upvoted ? "text-indigo-600" : ""
              }`}
            aria-label="Upvote"
          >
            <ArrowBigUp
              className={`h-5 w-5 ${currentPost.upvoted ? "fill-indigo-600" : ""}`}
            />
          </button>
          <span
            className={`min-w-6 text-center text-xs font-bold ${currentPost.upvoted
                ? "text-indigo-600"
                : currentPost.downvoted
                  ? "text-rose-500"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
          >
            {votes}
          </span>
          <button
            onClick={downVote}
            className={`rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 ${currentPost.downvoted ? "text-rose-500" : ""
              }`}
            aria-label="Downvote"
          >
            <ArrowBigDown
              className={`h-5 w-5 ${currentPost.downvoted ? "fill-rose-500" : ""}`}
            />
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          {post.comment_count > 5 ?
            <Link href={`/posts/detail/${post.id}`}
              className="flex items-center gap-1.5 hover:text-neutral-800 dark:hover:text-neutral-100">
              <MessageSquare className="h-4 w-4" />
              {post.comment_count} answers
            </Link> :
            <button
              onClick={() => {
                setOpen((wasOpen) => !wasOpen);
                setHasOpenedComments(true);
              }}
              className="flex items-center gap-1.5 hover:text-neutral-800 dark:hover:text-neutral-100">
              <MessageSquare className="h-4 w-4" />
              {post.comment_count} answers
            </button>
          }
          <button className="flex items-center gap-1.5 hover:text-neutral-800 dark:hover:text-neutral-100">
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button onClick={() => handleSave()} className="hover:text-neutral-800 dark:hover:text-neutral-100">
            <Bookmark className={`h-4 w-4 ${saved ? "fill-neutral-900 text-neutral-900 dark:fill-neutral-100 dark:text-neutral-100" : ""}`} />
          </button>
          <PostActionsMenu post={post} />
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
            <div className="border-t border-neutral-100 bg-neutral-50/40 dark:border-neutral-800 dark:bg-neutral-950/40">
              <CommentThread
                post={post}
                total={post.comment_count}
                enabled={open}
              />
            </div>
          </div>
        }
      </div>

      {/* Full-screen image viewer */}
      {lightboxIndex !== null && post.images && post.images.length > 0 && (
        <ImageLightbox
          images={post.images}
          startIndex={lightboxIndex}
          title={currentPost.title}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

export default QuestionCard