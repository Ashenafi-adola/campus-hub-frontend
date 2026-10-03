import { getCommunities } from "@/libs/api";
import { Community } from "@/libs/types";
import { useEffect, useState } from "react";


export function useCommunities(){
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
            const controller = new AbortController();
    
            const loadPosts = async () => {
                setLoading(true);
                setError(null);
    
                try {
                    const data = await getCommunities(controller.signal);
                    if (controller.signal.aborted) return;
                    setCommunities(data);
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
        
        return {communities, loading, error};
}