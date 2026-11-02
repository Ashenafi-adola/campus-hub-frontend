"use client"

import { ArrowBigDown, ArrowBigUp, CheckCircle2, ChevronDown, MessageSquare, Minus, MoreHorizontal, Plus, Share2, Shield } from "lucide-react";
import { Composer } from "./comment-composer";
import { useState } from "react";
import { getTimeSince } from "@/libs/format";
import { Comment } from "@/libs/types";
import { downvoteComment, upvoteComment } from "@/libs/api";
import { getAccessToken } from "@/app/actions/post-votes";
import { Avatar } from "@/components/shared/ui";


const MAX_DEPTH = 5;

               
function countAll(comments: Comment[]): number {
  return comments.reduce((sum, c) => sum + 1 + countAll(c.replies), 0);
}


export function CommentNode({
  comment,
  depth,
  onReply,
}: {
  comment: Comment;
  depth: number;
  onReply: (parentId: number, text: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [vote, setVote] = useState<number>(comment.score);
  const [currentComment, setCurrentComment] = useState<Comment>(comment);

  const replies: Comment[] = comment.replies.sort((a,b)=> a.score - b.score);
  const replyCount = countAll(comment.replies);


  const upVote = async () => {
    const access = await getAccessToken()
    if (currentComment.id) {
      const res = await upvoteComment(currentComment.id, access);
      setVote(res.score);
      setCurrentComment(res);
    }

  }

  const downVote = async () => {
    const access = await getAccessToken()
    if (currentComment.id) {
      const res = await downvoteComment(currentComment.id, access);
      setVote(res.score);
      setCurrentComment(res);
    }
  }

  const handleReply = (text: string) => {
    if (currentComment.id !== undefined && currentComment.id !== null) {
      onReply(currentComment.id, text);
    }
    setReplying(false);
    setCollapsed(false);
  };

  return (
    <div className="flex gap-3">
      {/* Left rail: avatar + clickable thread line */}
      <div className="flex w-8 shrink-0 flex-col items-center">
        <Avatar profile={currentComment.author.profile} dim={collapsed} />
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse thread"
            className="group mt-1 w-4 flex-1 cursor-pointer"
          >
            <span className="mx-auto block h-full w-0.5 rounded bg-neutral-200 transition-colors group-hover:bg-indigo-500 dark:bg-neutral-700" />
          </button>
        )}
      </div>

      <div className="min-w-0 flex-1 pb-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span
            className={`font-semibold ${collapsed ? "text-neutral-500 dark:text-neutral-400" : "text-neutral-900 dark:text-neutral-100"
              }`}
          >
            {currentComment.author.profile?.first_name}
          </span>
          {currentComment.isOP && (
            <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              OP
            </span>
          )}
          {currentComment.isModerator && (
            <span className="flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <Shield className="h-3 w-3" />
              MOD
            </span>
          )}
          {/* <span className="text-neutral-400">· {currentComment.school}</span> */}
          <span className="text-neutral-400 dark:text-neutral-500">· {getTimeSince(currentComment.created_at)}</span>
          {currentComment.isAccepted && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accepted answer
            </span>
          )}

          {/* Explicit expand / collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand comment" : "Collapse comment"}
            className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-neutral-400 hover:bg-neutral-100 hover:text-indigo-600 dark:text-neutral-500 dark:hover:bg-neutral-800"
          >
            {collapsed ? (
              <>
                <Plus className="h-3.5 w-3.5" />
                {replyCount > 0
                  ? `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                  : "Expand"}
              </>
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Collapsed: one-line preview */}
        {collapsed && (
          <p className="mt-1 line-clamp-1 text-sm text-neutral-400 dark:text-neutral-500">
            {currentComment.content}
          </p>
        )}

        {!collapsed && (
          <>
            <p
              className={`mt-1.5 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300 ${currentComment.isAccepted
                ? "rounded-lg border-l-2 border-emerald-500 bg-emerald-50/40 py-2 pl-3 pr-2 dark:bg-emerald-950/30"
                : ""
                }`}
            >
              {currentComment.content}
            </p>

            {/* Actions */}
            <div className="mt-2 flex flex-wrap items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center">
                <button
                  onClick={upVote}
                  className={`rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${currentComment.upvoted ? "text-indigo-600" : ""
                    }`}
                  aria-label="Upvote"
                >
                  <ArrowBigUp
                    className={`h-5 w-5 ${currentComment.upvoted ? "fill-indigo-600" : ""}`}
                  />
                </button>
                <span
                  className={`min-w-[1.5rem] text-center text-xs font-bold ${currentComment.upvoted
                    ? "text-indigo-600"
                    : currentComment.downvoted
                      ? "text-rose-500"
                      : "text-neutral-600 dark:text-neutral-300"
                    }`}
                >
                  {vote}
                </span>
                <button
                  onClick={downVote}
                  className={`rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${currentComment.downvoted ? "text-rose-500" : ""
                    }`}
                  aria-label="Downvote"
                >
                  <ArrowBigDown
                    className={`h-5 w-5 ${currentComment.downvoted ? "fill-rose-500" : ""}`}
                  />
                </button>
              </div>

              <button
                onClick={() => setReplying((v) => !v)}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <MessageSquare className="h-4 w-4" />
                Reply
              </button>
              <button className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {replying && (
              <div className="mt-3">
                <Composer
                  autoFocus
                  placeholder={`Reply to ${currentComment.author}...`}
                  submitLabel="Reply"
                  onSubmit={handleReply}
                  onCancel={() => setReplying(false)}
                />
              </div>
            )}

            {replies.length > 0 && (
              <div className="mt-4">
                {depth >= MAX_DEPTH ? (
                  <button className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline">
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                    Continue this thread ({replyCount}{" "}
                    {replyCount === 1 ? "reply" : "replies"})
                  </button>
                ) : (
                  replies.map((reply) => (
                    <CommentNode
                      key={reply.id}
                      comment={reply}
                      depth={depth + 1}
                      onReply={onReply}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
