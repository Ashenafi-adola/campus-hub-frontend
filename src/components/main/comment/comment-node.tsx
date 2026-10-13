"use client"

import { ArrowBigDown, ArrowBigUp, CheckCircle2, ChevronDown, MessageSquare, Minus, MoreHorizontal, Plus, Share2, Shield } from "lucide-react";
import { Composer } from "./comment-composer";
import { useState } from "react";
import { getInitials, getTimeSince } from "@/libs/format";
import { Comment, User } from "@/libs/types";
import { downvoteComment, upvoteComment } from "@/libs/api";
import { getAccessToken } from "@/app/actions/post-votes";
import Image from "next/image";


const MAX_DEPTH = 5;

const AVATAR_COLORS = [
  "bg-indigo-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-sky-600",
  "bg-violet-600",
];


function colorFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function Avatar({
  user,
  size = "h-8 w-8",
  dim = false,
}: {
  user: User;
  size?: string;
  dim?: boolean;
}) {
  const full_name = user.first_name + " " + user.last_name;
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white transition-opacity ${colorFor(
        full_name
      )} ${dim ? "opacity-50" : ""}`}
    >
      {user.avatar ? <Image
        src={user.avatar || ""}
        alt={user.username}
        width={40}
        height={40}
        unoptimized
        className="h-8 w-9 rounded-full object-cover"
      /> :
        <span className="font-semibold text-white">
          {getInitials(full_name)}
        </span>
      }
    </div>
  );
}


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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [replies, setReplies] = useState<Comment[]>(comment.replies.sort((a,b)=> a.score - b.score));

  const score = currentComment.score + vote;
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
        <Avatar user={currentComment.author} dim={collapsed} />
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse thread"
            className="group mt-1 w-4 flex-1 cursor-pointer"
          >
            <span className="mx-auto block h-full w-0.5 rounded bg-neutral-200 transition-colors group-hover:bg-indigo-500" />
          </button>
        )}
      </div>

      <div className="min-w-0 flex-1 pb-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span
            className={`font-semibold ${collapsed ? "text-neutral-500" : "text-neutral-900"
              }`}
          >
            {currentComment.author.first_name}
          </span>
          {currentComment.isOP && (
            <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-600">
              OP
            </span>
          )}
          {currentComment.isModerator && (
            <span className="flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600">
              <Shield className="h-3 w-3" />
              MOD
            </span>
          )}
          {/* <span className="text-neutral-400">· {currentComment.school}</span> */}
          <span className="text-neutral-400">· {getTimeSince(currentComment.created_at)}</span>
          {currentComment.isAccepted && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accepted answer
            </span>
          )}

          {/* Explicit expand / collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand comment" : "Collapse comment"}
            className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-neutral-400 hover:bg-neutral-100 hover:text-indigo-600"
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
          <p className="mt-1 line-clamp-1 text-sm text-neutral-400">
            {currentComment.content}
          </p>
        )}

        {!collapsed && (
          <>
            <p
              className={`mt-1.5 text-[15px] leading-relaxed text-neutral-700 ${currentComment.isAccepted
                ? "rounded-lg border-l-2 border-emerald-500 bg-emerald-50/40 py-2 pl-3 pr-2"
                : ""
                }`}
            >
              {currentComment.content}
            </p>

            {/* Actions */}
            <div className="mt-2 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
              <div className="flex items-center">
                <button
                  onClick={upVote}
                  className={`rounded-full p-1 hover:bg-neutral-100 ${currentComment.upvoted ? "text-indigo-600" : ""
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
                      : "text-neutral-600"
                    }`}
                >
                  {score}
                </span>
                <button
                  onClick={downVote}
                  className={`rounded-full p-1 hover:bg-neutral-100 ${currentComment.downvoted ? "text-rose-500" : ""
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
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold hover:bg-neutral-100"
              >
                <MessageSquare className="h-4 w-4" />
                Reply
              </button>
              <button className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold hover:bg-neutral-100">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="rounded-full p-1.5 hover:bg-neutral-100">
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
