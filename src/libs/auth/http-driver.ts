import { headers } from "next/headers";
import { AuthTokens, AuthUser, LoginInfo, Session } from "./types";
import { AuthApiError } from "../types";


const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

const AUTH = `${API_URL}/auth`;

export const httpDriver = {
    async login(input: LoginInfo): Promise<Session> {
        const tokens = await post<AuthTokens>("/token/", input);
        const user = await httpDriver.me(tokens.access);
        return { ...tokens, user }
    },

    async me(access: string): Promise<AuthUser> {
        const forwarded = await getForwardedHeaders();
        const res = await fetch(`${AUTH}/me/`, {
            headers: {
                Authorization: `Bearer ${access}`,
                ...forwarded,
            },
            cache: "no-cache",
            signal: AbortSignal.timeout(10000),
        });

        if (res.ok) return (await res.json())

        let body: Record<string, unknown>;
        try {
            body = (await res.json()) as Record<string, unknown>;
        } catch {
            body = { detail: `Request faild with ${res.status}`}
        }
        throw new AuthApiError(res.status, body)
    }
}


async function post<T>(path:string, body: unknown): Promise<T> {
    const forwarded = await getForwardedHeaders();
    const res = await fetch(`${AUTH}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...forwarded},
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(10000)
    })

    if (res.ok) return (await res.json()) as T;
    let body_: Record<string, unknown>;
    try {
        body_ = (await res.json()) as Record<string, unknown>;
    } catch {
        body_ = { detail: `Request faild with ${res.status}` };
    }
    throw new AuthApiError(res.status, body_)
}


async function getForwardedHeaders(): Promise<Record<string, string>> {
  try {
    const h = await headers();
    const forwardedFor = h.get("x-forwarded-for") ?? h.get("x-real-ip");
    if (forwardedFor) {
      return { "X-Forwarded-For": forwardedFor };
    }
  } catch {
    // Outside a Next.js server request context
  }
  return {};
}