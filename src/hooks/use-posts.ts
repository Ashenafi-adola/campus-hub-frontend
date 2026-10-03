import { getPosts } from "@/libs/api";
import { Post } from "@/libs/types";
import { useEffect, useState } from "react";


export function usePosts(){
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadPosts = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getPosts(controller.signal);
                if (controller.signal.aborted) return;
                setPosts(data);
            } catch {
                if (controller.signal.aborted) return;
                setError("Couldn't load posts. Check your connection and try again.");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        void loadPosts();

        return () => controller.abort();
    }, []);

    return {posts, loading, error};
}