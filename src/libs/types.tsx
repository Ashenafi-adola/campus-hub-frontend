export type UserRegistrationData = {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password?: string;
    confirm_password?: string;
}

export type FieldErrors = Record<string, string[]>;

export class AuthApiError extends Error {
    readonly status: number;
    readonly fieldErrors: FieldErrors;
    readonly detail?: string;
    readonly code?: string;

    constructor(status: number, body: Record<string, unknown>){
        const detail = typeof body.detail === "string" ? body.detail : undefined;
        const code = typeof body.code === "string" ? body.code : undefined;

        const fieldErrors: FieldErrors = {};
        for (const [key, value] of Object.entries(body)) {
            if (key === "detail" || key === "code") continue;
            if (Array.isArray(value)) fieldErrors[key] = value.map(String);
            else if (typeof value === "string") fieldErrors[key] = [value];
        }

        super(detail ?? "Request failed");
        this.name = "AuthApiError";
        this.status = status;
        this.detail = detail;
        this.code = code;
        this.fieldErrors = fieldErrors;
    }
}

export type CategoryId = "all" | "academic" | "campus-life" | "career";

export interface Community {
  id?: number;
  name: string;
  slug: string;
  description: string;
  icon: string | null | File;
  banner: string | null | File;
  creator?: User;
  created_at?: string;
  updated_at?: string;
  is_private: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  member_limit?: number | null;
  member_count: number;
  is_member?: boolean;
  can_manage?: boolean;
}

export interface NewCommunity {
    name: string,
    description: string,
    is_private: boolean,
    banner: File | null,
    icon: File | null,
}

export interface Question {
  id: string;
  author: string;
  authorAvatar: string;
  affiliation: string;
  community: string;
  postedAt: string;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  answers: number;
  unanswered?: boolean;
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    avatar?: string | null;
}

export interface Post {
    id: number;
    author: User;
    content: string;
    title: string;
    slug: string;
    post_type: string;
    community: Community;
    image?: File | string | null;
    score: number;
    upvote: number;
    downvote: number;
    created_at: string;
    status: string;
    upvoted: boolean;
    downvoted: boolean;
    excerpt: string;
    comment_count: number;
}

export interface CommunityDetail {
    community: Community;
    posts: Post[];
}

export interface NewComment {
    post: number;
    content: string;
    parent?: number;
}

export interface Comment {
  id: number;
  author: User;
  created_at: string;
  content: string;
  score: number;
  upvote?: number;
  downvote?: number;
  upvoted: number;
  downvoted: number;
  parent?: number;
  post: number;
  isOP?: boolean;
  isModerator?: boolean;
  isAccepted?: boolean;
  replies: Comment[];
}
