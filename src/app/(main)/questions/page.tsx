"use client"
import QuestionCard from "@/components/main/posts/post-card";
import { Chip, EmptyState, PageHeader } from "@/components/shared/ui";
import { usePosts } from "@/hooks/use-posts";
import { HelpCircle, Plus } from "lucide-react";
import { useMemo, useState } from "react";


type QFilter = "all" | "unanswered" | "answered";
type QSort = "newest" | "votes" | "answers";

export default function QuestionsPage() {
  const [filter, setFilter] = useState<QFilter>("all");
  const [sort, setSort] = useState<QSort>("newest");
  const { posts } = usePosts();

  const questions = useMemo(
    () => posts.filter((p) => p.post_type === "question"),
    [posts]
  );

  const counts = {
    all: questions.length,
    unanswered: questions.filter((q) => q.comment_count === 0).length,
    answered: questions.filter((q) => q.comment_count > 0).length,
  };

  const visible = useMemo(() => {
    const list = questions.filter((q) =>
      filter === "all"
        ? true
        : filter === "unanswered"
        ? q.comment_count === 0
        : q.comment_count > 0
    );
    if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sort === "votes") list.sort((a, b) => b.upvote - a.upvote);
    if (sort === "answers") list.sort((a, b) => b.comment_count - a.comment_count);
    return list;
  }, [questions, filter, sort]);

  const SORTS: { id: QSort; label: string }[] = [
    { id: "newest", label: "Newest" },
    { id: "votes", label: "Most votes" },
    { id: "answers", label: "Most answers" },
  ];

  return (
    <div className="space-y-4 w-full pb-18 pt-3 md:pb-5">
      <PageHeader
        icon={HelpCircle}
        title="Questions"
        subtitle="Browse what students are asking, and help someone out"
        right={
          <button
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Ask Question
          </button>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Chip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={counts.all}
          >
            All
          </Chip>
          <Chip
            active={filter === "unanswered"}
            onClick={() => setFilter("unanswered")}
            count={counts.unanswered}
          >
            Unanswered
          </Chip>
          <Chip
            active={filter === "answered"}
            onClick={() => setFilter("answered")}
            count={counts.answered}
          >
            Answered
          </Chip>
        </div>

        <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                sort === s.id
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {visible.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions here"
          text="Nothing matches this filter right now."
        />
      ) : (
        visible.map((p) => (
          <QuestionCard
            key={p.id}
            post={p}
          />
        ))
      )}
    </div>
  );
}
