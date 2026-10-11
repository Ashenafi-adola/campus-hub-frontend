import { NextResponse } from "next/server";
import { AuthTokens, AuthUser } from "./types";
import { cookies } from "next/headers";
import { httpDriver } from "./http-driver";
import { cache } from "react";

const SECURE_COOKIES = process.env.NODE_ENV === "production";
const PREFIX = SECURE_COOKIES ? "__Host-" : "";

export const ACCESS_COOKIES = `${PREFIX}campus_hub_access`;
export const REFRESH_COOKIES = `${PREFIX}campus_hub_refresh`;

function options(maxAge: number) {
    return {
        httpOnly: true,
        secure: SECURE_COOKIES,
        sameSite: "lax" as const,
        path: "/",
        maxAge,
    };
}

export function setSessionCookies(res: NextResponse, tokens: AuthTokens): void {
    res.cookies.set(ACCESS_COOKIES, tokens.access, options(15 * 60));
    res.cookies.set(REFRESH_COOKIES, tokens.refresh, options(14 * 24 * 60 * 60));
}


export function clearSessionCookies(res: NextResponse): void {
    res.cookies.set(ACCESS_COOKIES, "", options(0));
    res.cookies.set(REFRESH_COOKIES, "", options(0));
}

export async function readSession(): Promise<{access?: string, refresh?: string}> {
    const jar = await cookies();
    return {
        access: jar.get(ACCESS_COOKIES)?.value,
        refresh: jar.get(REFRESH_COOKIES)?.value,
    }
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
    const {access} = await readSession();
    if (!access) return null;
    return httpDriver.me(access).catch(()=>null);
})