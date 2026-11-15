import { useCallback, useEffect, useRef, useState } from "react";
import { getPopularPosts, getPostsPage } from "@/libs/api";
import { Post } from "@/libs/types";
import { filtersToQuery, PostFilters } from "@/components/main/posts/filter";

const PAGE_SIZE = 10;
const LOAD_ERROR = "Couldn't load posts. Check your connection and try again.";

/** Offset pagination can shift while the user scrolls, so drop repeats. */
function mergeUnique(prev: Post[], next: Post[]) {
    const seen = new Set(prev.map((p) => p.id));
    return [...prev, ...next.filter((p) => !seen.has(p.id))];
}

/**
 * Fetches posts page by page.
 * `filters` must be referentially stable (usePostFilters memoizes it);
 * when it changes, the list resets and page 1 is fetched again.
 */
export function usePosts(filters: PostFilters, pageSize = PAGE_SIZE) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true); // first page / filter change
    const [loadingMore, setLoadingMore] = useState(false); // later pages
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const nextPage = useRef(1);
    const inFlight = useRef(false);
    const controllerRef = useRef<AbortController | null>(null);

    const fetchPage = useCallback(
        async (reset: boolean) => {
            controllerRef.current?.abort();
            const controller = new AbortController();
            controllerRef.current = controller;
            inFlight.current = true;

            const page = reset ? 1 : nextPage.current;
            if (reset) setLoading(true);
            else setLoadingMore(true);
            setError(null);

            try {
                const data = await getPostsPage(
                    { ...filtersToQuery(filters), page, pageSize },
                    controller.signal
                );
                if (controller.signal.aborted) return;

                setPosts((prev) => (reset ? data.results : mergeUnique(prev, data.results)));
                nextPage.current = page + 1;
                setHasMore(data.next !== null);
            } catch {
                if (controller.signal.aborted) return;
                setError(LOAD_ERROR);
            } finally {
                if (!controller.signal.aborted) {
                    inFlight.current = false;
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        },
        [filters, pageSize]
    );

    // (Re)start from page 1 whenever the filters change.
    useEffect(() => {
        nextPage.current = 1;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasMore(true);
        void fetchPage(true);
        return () => controllerRef.current?.abort();
    }, [fetchPage]);

    const loadMore = useCallback(() => {
        if (inFlight.current || !hasMore) return;
        void fetchPage(false);
    }, [fetchPage, hasMore]);

    /** Retries whatever failed: the first page, or the next page. */
    const retry = useCallback(() => {
        void fetchPage(posts.length === 0);
    }, [fetchPage, posts.length]);

    return { posts, loading, loadingMore, error, hasMore, loadMore, retry };
}

export function usePopularPosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError(null);

        getPopularPosts(controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) setPosts(data.results);
            })
            .catch(() => {
                if (!controller.signal.aborted) setError(LOAD_ERROR);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, []);

    return { posts, loading, error };
}