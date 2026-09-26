import { NextResponse } from "next/server";
import { AuthTokens } from "./types";

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