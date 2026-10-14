import { Comment, Community, CommunityDetail, NewComment, NewCommunity, Post, UserRegistrationData } from "./types"
import { getAccessToken } from "@/app/actions/post-votes";

const API_URL = process.env.NEXT_PUBLIC_API_URL

export class ApiError extends Error {
    status: number;
    fieldErrors: Record<string, string[]>;

    constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.fieldErrors = fieldErrors;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractApiError(data: any): string {
    if (!data || typeof data !== "object") return "Something went wrong. Please try again.";

    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;

    const nonFieldErrors = data.non_field_errors ?? data.nonFieldErrors;
    if (Array.isArray(nonFieldErrors) && nonFieldErrors.length > 0) {
        return String(nonFieldErrors[0]);
    }

    for (const key of Object.keys(data)) {
        const value = data[key];
        if (Array.isArray(value) && value.length > 0) {
            return String(value[0]);
        }
        if (typeof value === "string" && value.trim()) {
            return value;
        }
    }

    return "Validation failed. Please check your inputs.";
}

export async function postRegistrationData(payload: UserRegistrationData): Promise<UserRegistrationData> {
    const formData = new FormData()
    formData.append("first_name", payload.first_name);
    formData.append("last_name", payload.last_name);
    formData.append("username", payload.username);
    formData.append("email", payload.email);
    if (payload.password) formData.append("password", payload.password);

    const res = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let payload: any = {};
        try {
            payload = await res.json();
        } catch {
            payload = {};
        }

        const fieldErrors: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(payload || {})) {
            if (Array.isArray(value)) {
                fieldErrors[key] = value.map((item) => String(item));
            } else if (typeof value === "string") {
                fieldErrors[key] = [value];
            }
        }

        throw new ApiError(extractApiError(payload), res.status, fieldErrors);
    }

    return res.json()
}

export async function verifyEmail(payload : {email: string, action: string, code?: string}) {
    const formData = new FormData();
    formData.append("action", payload.action);
    if(payload.code) formData.append("code", payload.code);
    formData.append("email", payload.email);

    const res = await fetch(`${API_URL}/auth/verify/`, {
        method: "POST",
        body: formData
    })

    if (!res.ok){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let payload: any = {};
        try {
            payload = await res.json();
        } catch {
            payload = {};
        }
        console.log(payload)
        throw new ApiError(extractApiError(payload), res.status, payload);
    }
    return res.json()
}

export async function forgotPasswordRequest(payload:Record<string, string>) {
    const formData = new FormData();
    formData.append("email", payload.email);
    const res = await fetch(`${API_URL}/auth/password-reset/`, {
        method: "POST",
        body: formData
    });
    if (!res.ok){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let payload: any = {};
        try {
            payload = await res.json();
        } catch {
            payload = {};
        }
        console.log(payload)
        throw new ApiError(extractApiError(payload), res.status, payload);
    }
    return res.json()
}

export async function resetPasswordRequest(payload:Record<string, string>) {
    const formData = new FormData();
    formData.append("new_password", payload.password);
    formData.append("token", payload.token);
    const res = await fetch(`${API_URL}/auth/password-reset/confirm/`, {
        method: "POST",
        body: formData
    })

    if (!res.ok){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let payload: any = {};
        try {
            payload = await res.json();
        } catch {
            payload = {};
        }
        console.log(payload)
        throw new ApiError(extractApiError(payload), res.status, payload);
    }
    return res.json()
}

export async function getPosts(signal?: AbortSignal, access?: string, myPosts?: false | boolean): Promise<Post[]> {
    let res;
    if(myPosts){
        res = await fetch(`${API_URL}/posts/?my_posts=${true}`, { 
            signal,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${await getAccessToken()}`
            }
        })
    } else {
        res = await fetch(`${API_URL}/posts/`, { 
            signal,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access}`
            }
        })
    }
    
    if (!res.ok){
        throw new Error(`Faild to load posts ${res.status}`);
    }
    return res.json();
}

export async function getCommunities(signal?: AbortSignal, my?: boolean): Promise<Community[]> {
    let res;
    const access = await getAccessToken();
    if (my) {
        res = await fetch(`${API_URL}/communities/?my_communities=${true}`, {
            signal,
            headers: {
                Authorization: `Bearer ${access}`
            }
        })
    }else{
        res = await fetch(`${API_URL}/communities/`, {
            signal,
            headers: {
                Authorization: `Bearer ${access}`
            }
        })
    }
    if (!res.ok){
        throw new Error(`Faild to load communities ${res.status}`);
    }
    return res.json();
}

export async function joinLeaveCommunity(status: boolean, c_slug: string) {
    const access = await getAccessToken();
    const res = await fetch(`${API_URL}/communities/${c_slug}/${status?"leave":"join"}/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${access}`
        }
    })
    if (!res.ok){
        throw new Error(`Faild to ${status?"leave":"join"} the community`);
    }
    return res.json();
}

export async function getCommunity(slug: string | undefined, signal?: AbortSignal): Promise<CommunityDetail> {
    const res = await fetch(`${API_URL}/communities/${slug}`, { 
        signal,
        headers: {
            Authorization: `Bearer ${await getAccessToken()}`
        }
     })

    if (!res.ok){
        throw new Error(`Faild to load community ${res.status}`);
    }
    return res.json();
}


export async function upvotePost(slug:string, access: string) {
    const res = await fetch(`${API_URL}/posts/${slug}/upvote/`, {
        method:"POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`
        },
        body: JSON.stringify({})
    })
    if(!res.ok){
        throw new Error(`Couldn't upvote the post ${res.status}`)
    }
    return res.json();
}
export async function downvotePost(slug:string, access: string) {
    const res = await fetch(`${API_URL}/posts/${slug}/downvote/`, {
        method:"POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`
        },
        body: JSON.stringify({})
    })
    if(!res.ok){
        throw new Error(`Couldn't downvote the post ${res.status}`)
    }
    return res.json();
}

export async function createCommunity(payload: NewCommunity, token: string): Promise<Community> {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    if (payload.icon !== null) formData.append("icon", payload.icon);
    if (payload.banner !== null) formData.append("banner", payload.banner);
    formData.append("is_private", String(payload.is_private));
    
    const res = await fetch(`${API_URL}/communities/`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData,
    })

    if (!res.ok){
        throw new Error(`Couldn't create a community ${res.status}`)
    }
    return res.json();
}

export async function getComments(post_slug: string): Promise<Comment[]> {
    const res = await fetch(`${API_URL}/comments/?post_slug=${post_slug}`, {
        headers: {
            Authorization: `Bearer ${await getAccessToken()}`
        }
    });
    if (!res.ok){
        throw new Error(`Couldn't fetch comments${res.status}`);
    }
    return res.json();
}

export async function postComment(comment: NewComment, token: string): Promise<Comment> {
    const res = await fetch(`${API_URL}/comments/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(comment)
    });
    if(!res.ok){
        throw new Error(`Couldn't post the comment ${res.status}`);
    }
    return res.json();
}


export async function upvoteComment(id:number, access: string) {
    const res = await fetch(`${API_URL}/comments/${id}/upvote/`, {
        method:"POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`
        },
        body: JSON.stringify({})
    })
    if(!res.ok){
        throw new Error(`Couldn't upvote the comment ${res.status}`)
    }
    return res.json();
}
export async function downvoteComment(id:number, access: string) {
    const res = await fetch(`${API_URL}/comments/${id}/downvote/`, {
        method:"POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`
        },
        body: JSON.stringify({})
    })
    if(!res.ok){
        throw new Error(`Couldn't downvote the comment ${res.status}`)
    }
    return res.json();
}