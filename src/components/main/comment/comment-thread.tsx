"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import { CommentNode } from "./comment-node";
import { Comment, NewComment, Post } from "@/libs/types";
import { Composer } from "./comment-composer";
import { ChevronDown } from "lucide-react";
import { getComments, postComment } from "@/libs/api";
import { getAccessToken } from "@/app/actions/post-votes";



type SortId = "best" | "newest" | "oldest";

const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "best", label: "Best" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
];


export function addReply(
  comments: Comment[],
  parentId: number,
  reply: Comment
): Comment[] {
  return comments.map((c) =>
    c.id === parentId
      ? { ...c, replies: [reply, ...c.replies] }
      : { ...c, replies: addReply(c.replies, parentId, reply) }
  );
}

export function CommentThread({
  post,
  total,
  enabled,
}: {
  post: Post;
  total: number;
  enabled: boolean;
}) {
  const [sort, setSort] = useState<SortId>("best");
  const [sortOpen, setSortOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const requestedSlug = useRef<number | null>(null);
  const commentsVersion = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    if (requestedSlug.current === post.id) return;
    requestedSlug.current = post.id;
    const requestVersion = commentsVersion.current;
    getComments(post.id)
      .then((res) => {
        if (
          requestedSlug.current === post.id &&
          commentsVersion.current === requestVersion
        ) {
          setComments(res.sort((a, b) => a.score - b.score));
        }
      })
      .catch((error) => {
        if (requestedSlug.current === post.id) {
          requestedSlug.current = null;
          console.error(error);
        }
  });
}, [enabled, post.id]);


  const newComment = async (text: string, parent?: number): Promise<Comment> => {
    const newComment: NewComment = {
      post: post.id,
      content: text,
    }
    const access = await getAccessToken()
    const res = await postComment(parent ? { ...newComment, parent: parent } : { ...newComment }, access)
    return res
  };

  const handleAdd = async (text: string) => {
    const comment = await newComment(text)
    commentsVersion.current += 1;
    setComments((prev) => [comment, ...prev]);
  }
  const handleReply = async (parentId: number, text: string) => {
    const comment = await newComment(text, parentId)
    commentsVersion.current += 1;
    setComments((prev) => addReply(prev, parentId, comment));
  }

  const sorted = useMemo(() => {
    const copy = [...comments];
    if (sort === "best") copy.sort((a, b) => b.score - a.score);
    if (sort === "newest") copy.sort((a, b) => new Date(a.created_at).getMinutes() - new Date(b.created_at).getMinutes());
    if (sort === "oldest") copy.sort((a, b) => new Date(b.created_at).getMinutes() - new Date(a.created_at).getMinutes());
    return copy;
  }, [comments, sort]);

  return (
    <div className="p-0 mt-5 dark:bg-neutral-900">
      <Composer
        placeholder="Share your answer or ask a follow-up..."
        onSubmit={handleAdd}
      />

      <div className="mt-5 flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {total} {total === 1 ? "comment" : "comments"}
        </h2>

        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Sort by:{" "}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {SORT_OPTIONS.find((s) => s.id === sort)?.label}
            </span>
            <ChevronDown className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSort(s.id);
                    setSortOpen(false);
                  }}
                  className={`block w-full px-3.5 py-2 text-left text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 ${sort === s.id ? "text-indigo-600" : "text-neutral-700 dark:text-neutral-200"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        {sorted.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-900">
            No answers yet. Be the first to help.
          </p>
        ) : (
          sorted.map((c) => (
            <CommentNode key={c.id} comment={c} depth={0} onReply={handleReply} />
          ))
        )}
      </div>
    </div>
  );
}
