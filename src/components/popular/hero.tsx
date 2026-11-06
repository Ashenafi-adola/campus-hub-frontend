"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bookmark,
  ChevronDown,
  ChevronUp,
  CircleQuestionMark,
  ImageIcon,
  MessageSquare,
  TrendingUp,
  Trophy,
} from "lucide-react";

import {
  downvotePostForCurrentUser,
  upvotePostForCurrentUser,
} from "@/app/actions/post-votes";
import { PostActionsMenu } from "@/components/main/post-actions";
import { Avatar } from "@/components/shared/ui";
import { saveUnsave } from "@/libs/api";
import { getTimeSince, plural } from "@/libs/format";
import type { Post, PostType } from "@/libs/types";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const TYPE_META: Record<
  PostType,
  { label: string; chip: string; icon: ComponentType<{ className?: string }> }
> = {
  question: { label: "Question", chip: "bg-indigo-50 text-indigo-600", icon: CircleQuestionMark },
  discussion: { label: "Discussion", chip: "bg-emerald-50 text-emerald-600", icon: MessageSquare },
  image: { label: "Image", chip: "bg-amber-50 text-amber-600", icon: ImageIcon },
  poll: { label: "Poll", chip: "bg-violet-50 text-violet-600", icon: BarChart3 },
};

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

export function Hero({ post, rank = 1 }: { post: Post; rank?: number }) {
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [saved, setSaved] = useState<boolean>(post.is_saved);
  const [saving, setSaving] = useState(false);
  const [voting, setVoting] = useState(false);

  if (!post?.author || !post?.community) return null;

  const detailHref = `/posts/detail/${post.id}`;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await saveUnsave(saved, post.id);
      setSaved(!saved);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const vote = async (action: typeof upvotePostForCurrentUser) => {
    if (voting) return;
    setVoting(true);
    try {
      setCurrentPost(await action(post.id));
    } catch (error) {
      console.error(error);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-900 p-5 text-white sm:p-6">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <Trophy className="h-3.5 w-3.5" />#{rank}
          </span>
          <div className="flex items-center gap-1">
            <SaveButton saved={saved} disabled={saving} onClick={handleSave} light />
            {/* Forces the menu's trigger to read on the dark gradient; a `light` prop on PostActionsMenu would be cleaner. */}
            <div className="[&_button:hover]:bg-white/15 [&_button]:text-white">
              <PostActionsMenu post={post} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <MetaLine post={currentPost} light />
        </div>

        <Link
          href={detailHref}
          className="mt-2 block text-2xl font-extrabold leading-snug hover:underline"
        >
          {currentPost.title}
        </Link>
        {currentPost.content && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-indigo-100">
            {currentPost.content}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
          <StatsLine
            post={currentPost}
            detailHref={detailHref}
            voting={voting}
            onUpvote={() => vote(upvotePostForCurrentUser)}
            onDownvote={() => vote(downvotePostForCurrentUser)}
            light
          />
          <div className="flex items-center gap-2.5">
            <Link
              href={`/u/activity/${currentPost.author.username}`}
              aria-label={`View ${currentPost.author.username}'s profile`}
            >
              <Avatar profile={currentPost.author.profile} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

function VoteButton({
  direction,
  active,
  disabled,
  light,
  onClick,
}: {
  direction: "up" | "down";
  active: boolean;
  disabled: boolean;
  light: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  const activeColor =
    direction === "up"
      ? light ? "text-white" : "text-indigo-600"
      : light ? "text-rose-300" : "text-rose-500";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "up" ? "Upvote" : "Downvote"}
      aria-pressed={active}
      className={`rounded-full p-0.5 transition-colors disabled:opacity-60 ${
        light ? "hover:bg-white/15" : "hover:bg-neutral-100"
      } ${active ? activeColor : ""}`}
    >
      <Icon className="h-4 w-4" strokeWidth={active ? 3.5 : 2} />
    </button>
  );
}

function StatsLine({
  post,
  detailHref,
  voting,
  onUpvote,
  onDownvote,
  light = false,
}: {
  post: Post;
  detailHref: string;
  voting: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
  light?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${
        light ? "text-white" : "text-neutral-500"
      }`}
    >
      <span
        className={`flex items-center gap-0.5 font-bold ${light ? "" : "text-neutral-800"}`}
      >
        <VoteButton
          direction="up"
          active={Boolean(post.upvoted)}
          disabled={voting}
          light={light}
          onClick={onUpvote}
        />
        <span className="min-w-4 text-center">{post.upvote}</span>
        <VoteButton
          direction="down"
          active={Boolean(post.downvoted)}
          disabled={voting}
          light={light}
          onClick={onDownvote}
        />
      </span>
      <span
        className={`flex items-center gap-0.5 text-xs font-bold ${
          light ? "text-emerald-300" : "text-emerald-600"
        }`}
      >
        <TrendingUp className="h-3.5 w-3.5" />+{post.score} today
      </span>
      <Link href={detailHref} className="flex items-center gap-1.5 hover:underline">
        <MessageSquare className="h-4 w-4" />
        {plural(post.comment_count, "answer", "answers")}
      </Link>
    </div>
  );
}

function SaveButton({
  saved,
  onClick,
  disabled = false,
  light = false,
}: {
  saved: boolean;
  onClick: () => void;
  disabled?: boolean;
  light?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={saved ? "Remove from saved" : "Save post"}
      aria-pressed={saved}
      className={`rounded-full p-2 transition-colors disabled:opacity-60 ${
        light
          ? "text-white hover:bg-white/15"
          : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
      }`}
    >
      <Bookmark
        className={`h-4 w-4 ${
          saved
            ? light
              ? "fill-white text-white"
              : "fill-indigo-600 text-indigo-600"
            : ""
        }`}
      />
    </button>
  );
}

function MetaLine({ post, light = false }: { post: Post; light?: boolean }) {
  const meta = TYPE_META[post.post_type];
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
      <span
        className={`rounded-full px-2.5 py-1 font-semibold ${
          light ? "bg-white/15 text-white" : meta.chip
        }`}
      >
        {meta.label}
      </span>
      <Link
        href={`/communities/${post.community.slug}`}
        className={`font-semibold hover:underline ${
          light ? "text-indigo-100" : "text-indigo-600"
        }`}
      >
        {post.community.name}
      </Link>
      <span className={light ? "text-indigo-200" : "text-neutral-400"}>
        ·{" "}
        <Link href={`/u/activity/${post.author.username}`} className="hover:underline">
          {post.author.username}
        </Link>{" "}
        · {getTimeSince(post.created_at)}
      </span>
    </div>
  );
}