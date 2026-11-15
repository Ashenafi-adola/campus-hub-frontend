"use client"
import { Suspense } from "react";
import { PostFeedSkeleton } from "@/components/main/laoding-skeletons";
import { PostFilterOptions, PostSort, usePostFilters } from "@/components/main/posts/filter";
import { PostList } from "@/components/main/posts/post-list";
import { Chip, EmptyState, PageHeader } from "@/components/shared/ui";
import { usePosts } from "@/hooks/use-posts";
import { HelpCircle, Plus } from "lucide-react";

// Module-level so the reference stays stable between renders.
const FILTER_OPTIONS: PostFilterOptions = {
  defaults: { sort: "new" },
  fixed: { type: "question" }, // this page only ever shows questions
};

const SORTS: { id: PostSort; label: string }[] = [
  { id: "new", label: "Newest" },
  { id: "votes", label: "Most votes" },
  { id: "answers", label: "Most answers" },
];

function QuestionsContent() {
  const { filters, setFilters } = usePostFilters(FILTER_OPTIONS);
  const { posts, loading, loadingMore, error, hasMore, loadMore, retry } = usePosts(filters);

  return (
    <>
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
          <Chip active={filters.answered === "all"} onClick={() => setFilters({ answered: "all" })}>
            All
          </Chip>
          <Chip active={filters.answered === "unanswered"} onClick={() => setFilters({ answered: "unanswered" })}>
            Unanswered
          </Chip>
          <Chip active={filters.answered === "answered"} onClick={() => setFilters({ answered: "answered" })}>
            Answered
          </Chip>
        </div>

        <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilters({ sort: s.id })}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                filters.sort === s.id
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <PostList
        posts={posts}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRetry={retry}
        emptyState={
          <EmptyState
            icon={HelpCircle}
            title="No questions found"
            text={
              filters.answered === "all"
                ? "Be the first to ask a question."
                : `No ${filters.answered} questions right now.`
            }
          />
        }
      />
    </>
  );
}

export default function QuestionsPage() {
  return (
    <div className="space-y-4 w-full pb-18 pt-3 md:pb-5">
      {/* useSearchParams (inside usePostFilters) requires a Suspense boundary */}
      <Suspense fallback={<PostFeedSkeleton />}>
        <QuestionsContent />
      </Suspense>
    </div>
  );
}