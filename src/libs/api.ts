import {
    Category,
    Comment,
    Community,
    CommunityDetail,
    NewComment,
    NewCommunity,
    NewPost,
    Post,
    Profile,
    SavedPost,
    UserRegistrationData,
} from "./types";
import { getAccessToken } from "@/app/actions/post-votes";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DEFAULT_ERROR = "Something went wrong. Please try again.";
const VALIDATION_ERROR = "Validation failed. Please check your inputs.";

/* -------------------------------------------------------------------------- */
/*  Errors                                                                    */
/* -------------------------------------------------------------------------- */

type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
    status: number;
    fieldErrors: FieldErrors;

    constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.fieldErrors = fieldErrors;
    }
}

/** Pulls the most useful human-readable message out of a DRF-style error body. */
function extractApiError(data: unknown): string {
    if (!data || typeof data !== "object") return DEFAULT_ERROR;
    const record = data as Record<string, unknown>;

    for (const key of ["detail", "message", "error"]) {
        const value = record[key];
        if (typeof value === "string" && value.trim()) return value;
    }

    const nonFieldErrors = record.non_field_errors ?? record.nonFieldErrors;
    if (Array.isArray(nonFieldErrors) && nonFieldErrors.length > 0) {
        return String(nonFieldErrors[0]);
    }

    for (const value of Object.values(record)) {
        if (Array.isArray(value) && value.length > 0) return String(value[0]);
        if (typeof value === "string" && value.trim()) return value;
    }

    return VALIDATION_ERROR;
}

/** Normalises `{ field: "msg" | ["msg", ...] }` into `{ field: ["msg", ...] }`. */
function toFieldErrors(data: unknown): FieldErrors {
    const fieldErrors: FieldErrors = {};
    if (!data || typeof data !== "object") return fieldErrors;

    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            fieldErrors[key] = value.map(String);
        } else if (typeof value === "string") {
            fieldErrors[key] = [value];
        }
    }
    return fieldErrors;
}

/* -------------------------------------------------------------------------- */
/*  Request helper                                                            */
/* -------------------------------------------------------------------------- */

// Endpoints without a response type yet. Replace with real types as you add them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedResponse = any;

type QueryValue = string | number | boolean | undefined;

interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    /** FormData is sent as-is; any other object is sent as JSON. */
    body?: FormData | object;
    query?: Record<string, QueryValue>;
    signal?: AbortSignal;
    /** Explicit access token. Falls back to the session token when omitted. */
    token?: string | null;
    /** Set to false for public endpoints (login, register, ...). */
    auth?: boolean;
    /**
     * Message used when the request fails. When omitted, the message is
     * taken from the server's response body instead.
     */
    errorMessage?: string;
}

async function parseJson(res: Response): Promise<unknown> {
    if (res.status === 204) return null;
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

async function request<T = UntypedResponse>(path: string, options: RequestOptions = {}): Promise<T> {
    if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    const { method = "GET", body, query, signal, token, auth = true, errorMessage } = options;

    const headers = new Headers();
    if (auth) {
        const accessToken = token ?? (await getAccessToken());
        if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let requestBody: BodyInit | undefined;
    if (body instanceof FormData) {
        // Let the browser set the multipart boundary.
        requestBody = body;
    } else if (body !== undefined) {
        headers.set("Content-Type", "application/json");
        requestBody = JSON.stringify(body);
    }

    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined) search.set(key, String(value));
    }
    const queryString = search.size > 0 ? `?${search}` : "";

    const res = await fetch(`${API_URL}${path}${queryString}`, {
        method,
        headers,
        body: requestBody,
        signal,
    });

    const data = await parseJson(res);

    if (!res.ok) {
        const message = errorMessage ? `${errorMessage} (${res.status})` : extractApiError(data);
        throw new ApiError(message, res.status, toFieldErrors(data));
    }

    return data as T;
}

/** Appends `items` as `key[0]`, `key[1]`, ... */
function appendIndexed(formData: FormData, key: string, items?: string[]) {
    items?.forEach((item, index) => formData.append(`${key}[${index}]`, item));
}

/* -------------------------------------------------------------------------- */
/*  Auth                                                                      */
/* -------------------------------------------------------------------------- */

export function postRegistrationData(payload: UserRegistrationData): Promise<UserRegistrationData> {
    const formData = new FormData();
    formData.append("first_name", payload.first_name);
    formData.append("last_name", payload.last_name);
    formData.append("username", payload.username);
    formData.append("email", payload.email);
    if (payload.password) formData.append("password", payload.password);

    return request<UserRegistrationData>("/auth/register/", {
        method: "POST",
        body: formData,
        auth: false,
    });
}

export function verifyEmail(payload: { email: string; action: string; code?: string }) {
    const formData = new FormData();
    formData.append("action", payload.action);
    formData.append("email", payload.email);
    if (payload.code) formData.append("code", payload.code);

    return request("/auth/verify/", { method: "POST", body: formData, auth: false });
}

export function forgotPasswordRequest(payload: Record<string, string>) {
    const formData = new FormData();
    formData.append("email", payload.email);

    return request("/auth/password-reset/", { method: "POST", body: formData, auth: false });
}

export function resetPasswordRequest(payload: Record<string, string>) {
    const formData = new FormData();
    formData.append("new_password", payload.password);
    formData.append("token", payload.token);

    return request("/auth/password-reset/confirm/", { method: "POST", body: formData, auth: false });
}

/* -------------------------------------------------------------------------- */
/*  Posts                                                                     */
/* -------------------------------------------------------------------------- */

export function getPosts(signal?: AbortSignal, access?: string, myPosts?: boolean): Promise<Post[]> {
    return request<Post[]>("/posts/", {
        signal,
        token: access,
        query: { my_posts: myPosts ? true : undefined },
        errorMessage: "Failed to load posts",
    });
}

export function getPost(id: number, access?: string, signal?: AbortSignal ): Promise<Post> {
    return request<Post>(`/posts/${id}/`, {
        signal,
        token: access,
        errorMessage: "Failed to load posts",
    });
}

export function createPost(payload: NewPost): Promise<Post> {
    const formData = new FormData();
    formData.append("content", payload.content);
    formData.append("title", payload.title);
    formData.append("post_type", payload.post_type);
    formData.append("community_id", String(payload.community_id));
    appendIndexed(formData, "tags", payload.tags);

    if (payload.post_type === "image") {
        payload.images?.forEach((image, index) => formData.append(`image${index + 1}`, image));
    }

    if (payload.post_type === "poll") {
        formData.append("poll_length", String(payload.poll_length));
        appendIndexed(formData, "polls", payload.polls);
    }

    return request<Post>("/posts/", {
        method: "POST",
        body: formData,
        errorMessage: "Couldn't create a post",
    });
}

export function updatePost(payload: NewPost, id: number): Promise<Post> {
    const formData = new FormData();
    formData.append("content", payload.content);
    formData.append("title", payload.title);
    formData.append("post_type", payload.post_type);
    formData.append("community_id", String(payload.community_id));
    appendIndexed(formData, "tags", payload.tags);

    if (payload.post_type === "image") {
        payload.images?.forEach((image, index) => formData.append(`image${index + 1}`, image));
    }

    if (payload.post_type === "poll") {
        formData.append("poll_length", String(payload.poll_length));
        appendIndexed(formData, "polls", payload.polls);
    }

    return request<Post>(`/posts/${id}/`, {
        method: "PUT",
        body: formData,
        errorMessage: "Couldn't update the post",
    });
}

export function deletePost(id: number) {
    return request(`/posts/${id}/`, {
        method: "DELETE",
    })
}

export function getUserPosts(username: string): Promise<Post[]> {
    return request(`/posts/user-posts/${username}/`, {
        method: "GET"
    })
}
export function getUserProfile(username: string): Promise<Profile> {
    return request(`/auth/profile/${username}/`)
}

export function upvotePost(id: number, access: string) {
    return request(`/posts/${id}/upvote/`, {
        method: "POST",
        body: {},
        token: access,
        errorMessage: "Couldn't upvote the post",
    });
}

export function downvotePost(id: number, access: string) {
    return request(`/posts/${id}/downvote/`, {
        method: "POST",
        body: {},
        token: access,
        errorMessage: "Couldn't downvote the post",
    });
}

/* -------------------------------------------------------------------------- */
/*  Polls                                                                     */
/* -------------------------------------------------------------------------- */

export function votePoll(id: number) {
    return request(`/polls/${id}/vote/`, {
        method: "POST",
        body: {},
        errorMessage: "Couldn't vote on the poll",
    });
}

export function getPollVotes(id: number) {
    return request(`/polls/${id}/`, { errorMessage: "Couldn't get the poll votes" });
}

/* -------------------------------------------------------------------------- */
/*  Communities & categories                                                  */
/* -------------------------------------------------------------------------- */

export function getCommunities(signal?: AbortSignal, my?: boolean): Promise<Community[]> {
    return request<Community[]>("/communities/", {
        signal,
        query: { my_communities: my ? true : undefined },
        errorMessage: "Failed to load communities",
    });
}

export function getCommunity(slug: string | undefined, signal?: AbortSignal): Promise<CommunityDetail> {
    return request<CommunityDetail>(`/communities/${slug}/`, {
        signal,
        errorMessage: "Failed to load community",
    });
}

export function createCommunity(payload: NewCommunity, token: string): Promise<Community> {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("is_private", String(payload.is_private));
    formData.append("category_id", String(payload.category_id));
    if (payload.icon !== null) formData.append("icon", payload.icon);
    if (payload.banner !== null) formData.append("banner", payload.banner);
    appendIndexed(formData, "rules", payload.rules);

    return request<Community>("/communities/", {
        method: "POST",
        body: formData,
        token,
        errorMessage: "Couldn't create a community",
    });
}

/** Pass `isMember = true` to leave the community, `false` to join it. */
export function joinLeaveCommunity(isMember: boolean, slug: string) {
    const action = isMember ? "leave" : "join";
    return request(`/communities/${slug}/${action}/`, {
        method: "POST",
        errorMessage: `Failed to ${action} the community`,
    });
}

export function getCategories(signal?: AbortSignal): Promise<Category[]> {
    return request<Category[]>("/categories/", {
        signal,
        errorMessage: "Failed to load categories",
    });
}

/* -------------------------------------------------------------------------- */
/*  Comments                                                                  */
/* -------------------------------------------------------------------------- */

export function getComments(postId: number): Promise<Comment[]> {
    return request<Comment[]>("/comments/", {
        query: { post_id: postId },
        errorMessage: "Couldn't fetch comments",
    });
}

export function postComment(comment: NewComment, token: string): Promise<Comment> {
    return request<Comment>("/comments/", {
        method: "POST",
        body: comment,
        token,
        errorMessage: "Couldn't post the comment",
    });
}

export function upvoteComment(id: number, access: string) {
    return request(`/comments/${id}/upvote/`, {
        method: "POST",
        body: {},
        token: access,
        errorMessage: "Couldn't upvote the comment",
    });
}

export function downvoteComment(id: number, access: string) {
    return request(`/comments/${id}/downvote/`, {
        method: "POST",
        body: {},
        token: access,
        errorMessage: "Couldn't downvote the comment",
    });
}

/* -------------------------------------------------------------------------- */
/*  Bookmarks                                                                 */
/* -------------------------------------------------------------------------- */

export function getSavedPosts(): Promise<SavedPost[]> {
    return request<SavedPost[]>("/bookmarks/", { errorMessage: "Couldn't fetch saved posts" });
}

/** Pass `isSaved = true` to remove the bookmark, `false` to create it. */
export function saveUnsave(isSaved: boolean, postId: number) {
    if (isSaved) {
        return request(`/bookmarks/${postId}/`, {
            method: "DELETE",
            errorMessage: "Couldn't delete the saved post",
        });
    }

    const formData = new FormData();
    formData.append("post", String(postId));
    formData.append("post_id", String(postId));

    return request("/bookmarks/", {
        method: "POST",
        body: formData,
        errorMessage: "Couldn't save the post",
    });
}

export async function saveProfile(payload: Profile): Promise<Profile> {
    const formData = new FormData();
    formData.append("first_name", payload.first_name);
    formData.append("last_name", payload.last_name);
    if (typeof File !== "undefined" && payload.avatar instanceof File) {
        formData.append("avatar", payload.avatar);
    }
    formData.append("university", payload.university);
    formData.append("bio", payload.bio);

    return request(`/auth/profile/${payload.id}/`, {
        method: "PATCH",
        body: formData,
        errorMessage: "Couldn't update profile"
    })
}

export async function ChangePassword(payload:{old_password: string, new_password: string}) {
    return request("/auth/change-password/",  {
        method: "POST",
        body: payload,
        errorMessage: "Couldn't change password"
    })
}