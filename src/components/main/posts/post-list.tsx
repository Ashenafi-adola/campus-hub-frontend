"use client";

import { ReactNode, useEffect, useRef } from "react";
import { CircleQuestionMark } from "lucide-react";
import { PostFeedSkeleton } from "@/components/main/laoding-skeletons";
import QuestionCard from "@/components/main/posts/post-card";
import { EmptyState } from "@/components/shared/ui";
import { Post } from "@/libs/types";

interface PostListProps {
    posts: Post[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    onLoadMore: () => void;
    onRetry: () => void;
    /** "infinite" loads on scroll; "button" shows a "See more" button. */
    mode?: "infinite" | "button";
    /** Custom layout for the loaded posts (default: one QuestionCard each). */
    renderPosts?: (posts: Post[]) => ReactNode;
    /** Shown when loading finished and nothing matched. */
    emptyState?: ReactNode;
}

const defaultRender = (posts: Post[]) => posts.map((p) => <QuestionCard key={p.id} post={p} />);

/* Same look as the error banner on the profile page and the buttons in the post form. */
function ErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
            <p>{message}</p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-3 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-neutral-900 dark:text-red-300 dark:hover:bg-red-950"
            >
                Try again
            </button>
        </div>
    );
}

export function PostList({
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    onLoadMore,
    onRetry,
    mode = "infinite",
    renderPosts = defaultRender,
    emptyState,
}: PostListProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Load the next page when the sentinel gets near the viewport.
    // Re-attaches after every page so it also fires if the sentinel is still visible.
    useEffect(() => {
        if (mode !== "infinite" || !hasMore || loading || loadingMore || error) return;
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) onLoadMore();
            },
            { rootMargin: "400px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [mode, hasMore, loading, loadingMore, error, onLoadMore, posts.length]);

    if (loading && posts.length === 0) return <PostFeedSkeleton />;

    if (error && posts.length === 0) {
        return <ErrorNotice message={error} onRetry={onRetry} />;
    }

    if (posts.length === 0) {
        return (
            emptyState ?? (
                <EmptyState
                    title="No posts found"
                    icon={CircleQuestionMark}
                    text="Try changing your filters, or check back later."
                />
            )
        );
    }

    return (
        <>
            {renderPosts(posts)}

            {loadingMore && <PostFeedSkeleton />}

            {error && <ErrorNotice message={error} onRetry={onRetry} />}

            {!error && hasMore && !loadingMore && mode === "button" && (
                <div className="flex justify-center py-4">
                    <button
                        type="button"
                        onClick={onLoadMore}
                        className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                        See more
                    </button>
                </div>
            )}

            {mode === "infinite" && hasMore && <div ref={sentinelRef} aria-hidden className="h-1" />}

            {!hasMore && (
                <p className="py-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
                    You&apos;re all caught up.
                </p>
            )}
        </>
    );
}