import { getTimeSince, plural } from "@/libs/format";
import { Post, PostType } from "@/libs/types";
import { ChevronUp, MessageSquare, TrendingUp, ImageIcon, BarChart3, CircleQuestionMark, Trophy, Bookmark } from "lucide-react";
import { Avatar } from "../shared/ui";
import Link from "next/link";


export function Hero({
  post,
}: {
  post: Post;
}) {
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
            <Trophy className="h-3.5 w-3.5" />
            #1 {1}
          </span>
          <SaveButton saved={false} onClick={()=>{}} light />
        </div>

        <div className="mt-4">
          <MetaLine post={post} light />
        </div>
        <a
          href="#"
          className="mt-2 block text-2xl font-extrabold leading-snug hover:underline"
        >
          {post.title}
        </a>
        {post.content && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-indigo-100">
            {post.content}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
          <StatsLine post={post} light />
          <div className="flex items-center gap-2.5">
            <Avatar user={post.author} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsLine({ post, light = false }: { post: Post; light?: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${
        light ? "text-white" : "text-neutral-500"
      }`}
    >
      <span
        className={`flex items-center gap-1 font-bold ${
          light ? "" : "text-neutral-800"
        }`}
      >
        <ChevronUp className="h-4 w-4" />
        {post.upvote}
      </span>
      <span
        className={`flex items-center gap-0.5 text-xs font-bold ${
          light ? "text-emerald-300" : "text-emerald-600"
        }`}
      >
        <TrendingUp className="h-3.5 w-3.5" />+{post.score} today
      </span>
      <span className="flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4" />
        {plural(post.comment_count, "answer", "answers")}
      </span>
    </div>
  );
}


function SaveButton({
  saved,
  onClick,
  light = false,
}: {
  saved: boolean;
  onClick: () => void;
  light?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={saved ? "Remove from saved" : "Save post"}
      aria-pressed={saved}
      className={`rounded-full p-2 transition-colors ${
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
        href="#"
        className={`font-semibold hover:underline ${
          light ? "text-indigo-100" : "text-indigo-600"
        }`}
      >
        {post.community.name}
      </Link>
      <span className={light ? "text-indigo-200" : "text-neutral-400"}>
        · {post.author.username} · {getTimeSince(post.created_at)}
      </span>
    </div>
  );
}

const TYPE_META: Record<
  PostType,
  { label: string; chip: string; icon: React.ComponentType<{ className?: string }> }
> = {
  question: { label: "Question", chip: "bg-indigo-50 text-indigo-600", icon: CircleQuestionMark },
  discussion: { label: "Discussion", chip: "bg-emerald-50 text-emerald-600", icon: MessageSquare },
  image: { label: "Image", chip: "bg-amber-50 text-amber-600", icon: ImageIcon },
  poll: { label: "Poll", chip: "bg-violet-50 text-violet-600", icon: BarChart3 },
};