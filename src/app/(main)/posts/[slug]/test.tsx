"use client"
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Bookmark,
  MessageSquare,
  Share2,
  MoreHorizontal,
  ArrowBigUp,
  ArrowBigDown,
  CheckCircle2,
  Shield,
  Minus,
  ArrowLeft,
  Eye,
  Check,
} from "lucide-react";

/* ================================================================= */
/*  Types & sample data                                              */
/* ================================================================= */

interface Comment {
  id: string;
  author: string;
  school: string;
  postedAt: string;
  ageMin: number;
  body: string;
  score: number;
  isOP?: boolean;
  isModerator?: boolean;
  replies: Comment[];
}

type SortId = "best" | "newest" | "oldest";

const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "best", label: "Best" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
];

const ME = "Sophia Martinez"; // the viewer, who is also the post's author

const POST = {
  author: "Sophia Martinez",
  school: "Stanford University",
  community: "r/ComputerScience",
  postedAt: "2 hours ago",
  views: "1,248",
  title: "How can I understand recursion in Python?",
  blocks: [
    {
      type: "p" as const,
      text: "I've been trying to wrap my head around call stacks and base cases. Every time I write a recursive function, I end up with a stack overflow error or returning None.",
    },
    {
      type: "code" as const,
      text: `def countdown(n):
    print(n)
    countdown(n - 1)   # RecursionError: maximum recursion depth exceeded

countdown(3)`,
    },
    {
      type: "p" as const,
      text: "I understand the idea in theory, but I can't picture what Python is actually doing when a function calls itself. Are there any mental models or drawings that help?",
    },
  ],
  tags: ["Python", "Recursion", "Beginner"],
  upvotes: 42,
};

const INITIAL_COMMENTS: Comment[] = [
  {
    id: "1",
    author: "Dr. Amara Bekele",
    school: "Stanford University",
    postedAt: "1 hour ago",
    ageMin: 60,
    body: "Think of each recursive call as a new sheet of paper stacked on top of the last. Every sheet has its own copy of the variables, and when a call returns you throw that sheet away and go back to the one underneath. Stack overflow just means you never reached a sheet that says \"stop\", so your base case is wrong or unreachable. In your countdown, add `if n <= 0: return` before the recursive call.",
    score: 48,
    isModerator: true,
    replies: [
      {
        id: "1-1",
        author: "Sophia Martinez",
        school: "Stanford University",
        postedAt: "52 min ago",
        ageMin: 52,
        body: "The stack of paper analogy finally made this click, thank you! Do you have an example of a base case that's easy to get wrong?",
        score: 12,
        isOP: true,
        replies: [
          {
            id: "1-1-1",
            author: "Dr. Amara Bekele",
            school: "Stanford University",
            postedAt: "40 min ago",
            ageMin: 40,
            body: "Classic one: a factorial that checks `n == 0` but gets called with a negative number. It never hits the base case and recurses forever. Always ask what inputs can reach your function that you didn't plan for.",
            score: 21,
            isModerator: true,
            replies: [],
          },
        ],
      },
      {
        id: "1-2",
        author: "Daniel Kim",
        school: "UCLA",
        postedAt: "35 min ago",
        ageMin: 35,
        body: "Also worth tracing the first few calls by hand. Writing out fib(4) as a tree helped me more than any video.",
        score: 9,
        replies: [],
      },
    ],
  },
  {
    id: "2",
    author: "Marcus Aurelius",
    school: "MIT",
    postedAt: "45 min ago",
    ageMin: 45,
    body: "Python's default recursion limit is 1000 frames, so even correct recursion can blow up on large inputs. For those cases convert it to a loop with an explicit stack, or use memoization with functools.lru_cache.",
    score: 17,
    replies: [
      {
        id: "2-1",
        author: "Lily Chen",
        school: "UC Berkeley",
        postedAt: "30 min ago",
        ageMin: 30,
        body: "lru_cache saved my life on the DP assignment. One thing to watch: arguments have to be hashable, so lists won't work as parameters.",
        score: 6,
        replies: [],
      },
    ],
  },
  {
    id: "3",
    author: "Ethan Wright",
    school: "MIT",
    postedAt: "20 min ago",
    ageMin: 20,
    body: "Visualizer tools like Python Tutor let you step through the call stack one line at a time. Highly recommend pasting your broken function in there.",
    score: 4,
    replies: [],
  },
];

const RULES = [
  "No direct answer sharing for active coursework",
  "Keep discussions academic and respectful",
  "Format code blocks properly",
];

const RELATED = [
  { id: "r1", title: "Recursion vs iteration: when should I use which?", answers: 14 },
  { id: "r2", title: "Why does my fibonacci function take forever?", answers: 9 },
  { id: "r3", title: "How do I set the recursion limit in Python safely?", answers: 5 },
];

/* ================================================================= */
/*  Helpers                                                          */
/* ================================================================= */

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

function getInitials(name: string) {
  return name
    .replace(/^Dr\.\s*/i, "")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({
  name,
  size = "h-8 w-8",
  dim = false,
}: {
  name: string;
  size?: string;
  dim?: boolean;
}) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white transition-opacity ${colorFor(
        name
      )} ${dim ? "opacity-50" : ""}`}
    >
      {getInitials(name)}
    </div>
  );
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function countAll(comments: Comment[]): number {
  return comments.reduce((sum, c) => sum + 1 + countAll(c.replies), 0);
}

function addReply(
  comments: Comment[],
  parentId: string,
  reply: Comment
): Comment[] {
  return comments.map((c) =>
    c.id === parentId
      ? { ...c, replies: [...c.replies, reply] }
      : { ...c, replies: addReply(c.replies, parentId, reply) }
  );
}

function SideCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

/* ================================================================= */
/*  Composer                                                         */
/* ================================================================= */

function Composer({
  placeholder,
  autoFocus = false,
  onSubmit,
  onCancel,
  submitLabel = "Comment",
  rows = 3,
}: {
  placeholder: string;
  autoFocus?: boolean;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
  rows?: number;
}) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
      <textarea
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y bg-transparent px-3.5 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
      />
      <div className="flex items-center justify-between bg-neutral-50 px-3 py-2">
        <span className="text-xs text-neutral-400">Ctrl + Enter to post</span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-500 hover:bg-neutral-100"
            >
              Cancel
            </button>
          )}
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================= */
/*  Answer / comment node (recursive)                                */
/* ================================================================= */

const MAX_DEPTH = 5;

function CommentNode({
  comment,
  depth,
  isAuthor,
  acceptedId,
  onAccept,
  onReply,
}: {
  comment: Comment;
  depth: number;
  isAuthor: boolean;
  acceptedId: string | null;
  onAccept: (id: string) => void;
  onReply: (parentId: string, text: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [vote, setVote] = useState<-1 | 0 | 1>(0);

  const isAnswer = depth === 0;
  const accepted = acceptedId === comment.id;
  const score = comment.score + vote;
  const replyCount = countAll(comment.replies);

  const handleReply = (text: string) => {
    onReply(comment.id, text);
    setReplying(false);
    setCollapsed(false);
  };

  return (
    <div className="flex gap-3">
      <div className="flex w-8 shrink-0 flex-col items-center">
        <Avatar name={comment.author} dim={collapsed} />
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
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span
            className={`font-semibold ${
              collapsed ? "text-neutral-500" : "text-neutral-900"
            }`}
          >
            {comment.author}
          </span>
          {comment.isOP && (
            <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-600">
              OP
            </span>
          )}
          {comment.isModerator && (
            <span className="flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600">
              <Shield className="h-3 w-3" />
              MOD
            </span>
          )}
          <span className="text-neutral-400">· {comment.school}</span>
          <span className="text-neutral-400">· {comment.postedAt}</span>
          {accepted && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accepted answer
            </span>
          )}

          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand comment" : "Collapse comment"}
            className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-neutral-400 hover:bg-neutral-100 hover:text-indigo-600"
          >
            {collapsed ? (
              <>
                <Plus className="h-3.5 w-3.5" />
                {replyCount > 0 ? plural(replyCount, "reply", "replies") : "Expand"}
              </>
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {collapsed && (
          <p className="mt-1 line-clamp-1 text-sm text-neutral-400">
            {comment.body}
          </p>
        )}

        {!collapsed && (
          <>
            <p
              className={`mt-1.5 text-[15px] leading-relaxed text-neutral-700 ${
                accepted
                  ? "rounded-lg border-l-2 border-emerald-500 bg-emerald-50/40 py-2 pl-3 pr-2"
                  : ""
              }`}
            >
              {comment.body}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
              <div className="flex items-center">
                <button
                  onClick={() => setVote(vote === 1 ? 0 : 1)}
                  className={`rounded-full p-1 hover:bg-neutral-100 ${
                    vote === 1 ? "text-indigo-600" : ""
                  }`}
                  aria-label="Upvote"
                >
                  <ArrowBigUp
                    className={`h-5 w-5 ${vote === 1 ? "fill-indigo-600" : ""}`}
                  />
                </button>
                <span
                  className={`min-w-[1.5rem] text-center text-xs font-bold ${
                    vote === 1
                      ? "text-indigo-600"
                      : vote === -1
                      ? "text-rose-500"
                      : "text-neutral-600"
                  }`}
                >
                  {score}
                </span>
                <button
                  onClick={() => setVote(vote === -1 ? 0 : -1)}
                  className={`rounded-full p-1 hover:bg-neutral-100 ${
                    vote === -1 ? "text-rose-500" : ""
                  }`}
                  aria-label="Downvote"
                >
                  <ArrowBigDown
                    className={`h-5 w-5 ${vote === -1 ? "fill-rose-500" : ""}`}
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

              {/* Only the post's author can accept, and only top-level answers */}
              {isAnswer && isAuthor && (
                <button
                  onClick={() => onAccept(comment.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    accepted
                      ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {accepted ? "Accepted" : "Mark as accepted"}
                </button>
              )}

              <button className="rounded-full p-1.5 hover:bg-neutral-100">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {replying && (
              <div className="mt-3">
                <Composer
                  autoFocus
                  placeholder={`Reply to ${comment.author}...`}
                  submitLabel="Reply"
                  onSubmit={handleReply}
                  onCancel={() => setReplying(false)}
                />
              </div>
            )}

            {comment.replies.length > 0 && (
              <div className="mt-4">
                {depth >= MAX_DEPTH ? (
                  <button className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline">
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                    Continue this thread ({plural(replyCount, "reply", "replies")})
                  </button>
                ) : (
                  comment.replies.map((reply) => (
                    <CommentNode
                      key={reply.id}
                      comment={reply}
                      depth={depth + 1}
                      isAuthor={isAuthor}
                      acceptedId={acceptedId}
                      onAccept={onAccept}
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

/* ================================================================= */
/*  Page                                                             */
/* ================================================================= */

export default function PostDetailPage() {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [acceptedId, setAcceptedId] = useState<string | null>("1");
  const [sort, setSort] = useState<SortId>("best");
  const [sortOpen, setSortOpen] = useState(false);

  const [votes, setVotes] = useState(POST.upvotes);
  const [voted, setVoted] = useState<-1 | 0 | 1>(0);
  const [saved, setSaved] = useState(false);
  const [joined, setJoined] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const answersRef = useRef<HTMLDivElement>(null);

  const isAuthor = POST.author === ME;
  const answerCount = comments.length;
  const replyCount = useMemo(
    () => countAll(comments) - comments.length,
    [comments]
  );

  const sorted = useMemo(() => {
    const copy = [...comments];
    if (sort === "best") copy.sort((a, b) => b.score - a.score);
    if (sort === "newest") copy.sort((a, b) => a.ageMin - b.ageMin);
    if (sort === "oldest") copy.sort((a, b) => b.ageMin - a.ageMin);
    // the accepted answer is always pinned to the top
    const idx = copy.findIndex((c) => c.id === acceptedId);
    if (idx > 0) copy.unshift(copy.splice(idx, 1)[0]);
    return copy;
  }, [comments, sort, acceptedId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const castVote = (dir: 1 | -1) => {
    const next = voted === dir ? 0 : dir;
    setVotes(POST.upvotes + next);
    setVoted(next);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      /* clipboard can be blocked; still confirm */
    }
    setToast("Link copied");
  };

  const newComment = (text: string): Comment => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    author: ME,
    school: "Stanford University",
    postedAt: "just now",
    ageMin: 0,
    body: text,
    score: 1,
    isOP: true,
    replies: [],
  });

  const handleAnswer = (text: string) => {
    setComments((prev) => [newComment(text), ...prev]);
    setToast("Answer posted");
  };

  const handleReply = (parentId: string, text: string) =>
    setComments((prev) => addReply(prev, parentId, newComment(text)));

  const handleAccept = (id: string) => {
    setAcceptedId((prev) => (prev === id ? null : id));
    setToast(acceptedId === id ? "Answer unaccepted" : "Answer accepted");
  };

  const status =
    acceptedId !== null
      ? { label: "Answered", cls: "bg-emerald-50 text-emerald-600" }
      : answerCount === 0
      ? { label: "Unanswered", cls: "bg-orange-50 text-orange-600" }
      : { label: "Open", cls: "bg-indigo-50 text-indigo-600" };

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="mx-auto flex max-full gap-6 px-6 py-6">
        {/* Main column */}
        <main className="min-w-0 flex-1 space-y-4">
          {/* Back + breadcrumb */}
          <div className="flex items-center gap-3 text-sm">
            <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold text-neutral-600 hover:bg-neutral-100">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <span className="text-neutral-300">/</span>
            <a href="#" className="font-medium text-indigo-600 hover:underline">
              {POST.community}
            </a>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-500">Question</span>
          </div>

          {/* Post */}
          <article className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Avatar name={POST.author} size="h-10 w-10" />
                <div className="text-sm">
                  <span className="font-semibold text-neutral-900">
                    {POST.author}
                  </span>
                  <span className="text-neutral-400"> · {POST.school}</span>
                  <div className="text-xs text-neutral-400">
                    Asked {POST.postedAt}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}
                >
                  {acceptedId !== null && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {status.label}
                </span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                  Question
                </span>
              </div>
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-snug text-neutral-900">
              {POST.title}
            </h1>

            <div className="mt-1.5 flex items-center gap-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                Viewed {POST.views} times
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {POST.blocks.map((block, i) =>
                block.type === "p" ? (
                  <p
                    key={i}
                    className="text-[15px] leading-relaxed text-neutral-700"
                  >
                    {block.text}
                  </p>
                ) : (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900"
                  >
                    <div className="border-b border-neutral-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                      python
                    </div>
                    <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-neutral-100">
                      <code>{block.text}</code>
                    </pre>
                  </div>
                )
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {POST.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action bar */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
              <div className="flex items-center rounded-full bg-neutral-50">
                <button
                  onClick={() => castVote(1)}
                  aria-label="Upvote"
                  className={`rounded-full p-2 hover:bg-neutral-100 ${
                    voted === 1 ? "text-indigo-600" : "text-neutral-500"
                  }`}
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <span
                  className={`min-w-[2rem] text-center text-sm font-bold ${
                    voted === 1
                      ? "text-indigo-600"
                      : voted === -1
                      ? "text-rose-500"
                      : "text-neutral-700"
                  }`}
                >
                  {votes}
                </span>
                <button
                  onClick={() => castVote(-1)}
                  aria-label="Downvote"
                  className={`rounded-full p-2 hover:bg-neutral-100 ${
                    voted === -1 ? "text-rose-500" : "text-neutral-500"
                  }`}
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-1 text-sm text-neutral-500">
                <button
                  onClick={() =>
                    answersRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium hover:bg-neutral-100 hover:text-neutral-800"
                >
                  <MessageSquare className="h-4 w-4" />
                  {plural(answerCount, "answer", "answers")}
                </button>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium hover:bg-neutral-100 hover:text-neutral-800"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  onClick={() => {
                    setSaved((v) => !v);
                    setToast(saved ? "Removed from saved" : "Post saved");
                  }}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium hover:bg-neutral-100 hover:text-neutral-800"
                >
                  <Bookmark
                    className={`h-4 w-4 ${
                      saved ? "fill-indigo-600 text-indigo-600" : ""
                    }`}
                  />
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  aria-label="More actions"
                  className="rounded-full p-2 hover:bg-neutral-100 hover:text-neutral-800"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>

          {/* Answers */}
          <section
            ref={answersRef}
            className="scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  {plural(answerCount, "Answer", "Answers")}
                </h2>
                {replyCount > 0 && (
                  <p className="text-xs text-neutral-400">
                    {plural(replyCount, "reply", "replies")} in discussion
                  </p>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  Sort by:{" "}
                  <span className="font-semibold text-neutral-900">
                    {SORT_OPTIONS.find((s) => s.id === sort)?.label}
                  </span>
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                </button>
                {sortOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setSortOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                      {SORT_OPTIONS.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSort(s.id);
                            setSortOpen(false);
                          }}
                          className={`block w-full px-3.5 py-2 text-left text-sm font-medium hover:bg-neutral-50 ${
                            sort === s.id ? "text-indigo-600" : "text-neutral-700"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Write an answer */}
            <div className="mt-4">
              <Composer
                rows={4}
                placeholder="Write your answer. Explain your reasoning so others can learn from it..."
                submitLabel="Post answer"
                onSubmit={handleAnswer}
              />
            </div>

            {/* Thread */}
            <div className="mt-6 border-t border-neutral-100 pt-6">
              {sorted.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-400">
                  No answers yet. Be the first to help.
                </p>
              ) : (
                sorted.map((c) => (
                  <CommentNode
                    key={c.id}
                    comment={c}
                    depth={0}
                    isAuthor={isAuthor}
                    acceptedId={acceptedId}
                    onAccept={handleAccept}
                    onReply={handleReply}
                  />
                ))
              )}
            </div>
          </section>
        </main>

        {/* Right sidebar */}
        <aside className="hidden w-72 shrink-0 space-y-4 xl:block">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white">
                CS
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-neutral-900">
                  {POST.community}
                </div>
                <div className="text-xs text-neutral-400">
                  12,450 students enrolled
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              Computer Science, engineering, mathematics, and programming
              assistance. Moderated by university research assistants and
              professors.
            </p>
            <div className="mt-3 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
              Created Sept 14, 2023
            </div>
            <button
              onClick={() => setJoined((v) => !v)}
              className={`mt-3 w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
                joined
                  ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {joined ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  Joined
                </span>
              ) : (
                "Join Community"
              )}
            </button>
          </div>

          <SideCard title="Community Rules">
            <ol className="space-y-3">
              {RULES.map((rule, i) => (
                <li key={rule} className="flex gap-2.5 text-sm text-neutral-600">
                  <span className="font-semibold text-neutral-400">
                    {i + 1}.
                  </span>
                  {rule}
                </li>
              ))}
            </ol>
          </SideCard>

          <SideCard title="Related Questions">
            {RELATED.map((q) => (
              <div key={q.id}>
                <a
                  href="#"
                  className="text-sm font-semibold text-neutral-800 hover:text-indigo-600"
                >
                  {q.title}
                </a>
                <div className="text-xs text-neutral-400">
                  {plural(q.answers, "answer", "answers")}
                </div>
              </div>
            ))}
          </SideCard>
        </aside>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
          {toast}
        </div>
      )}
    </div>
  );
}
