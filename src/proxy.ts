import { jwtDecode } from "jwt-decode";
import { NextResponse, type NextRequest } from "next/server";
import { refreshToken, TokenRefreshError } from "@/libs/auth/tokens";

const SECURE_COOKIES = process.env.NODE_ENV === "production";
const PREFIX = SECURE_COOKIES ? "__Host-" : "";
const ACCESS_COOKIE = `${PREFIX}campus_hub_access`;
const REFRESH_COOKIE = `${PREFIX}campus_hub_refresh`;

function accessNeedsRefresh(token: string | undefined): boolean {
    if (!token) return true;
    try {
        const { exp } = jwtDecode<{ exp?: number }>(token);
        return typeof exp !== "number" || exp * 1000 <= Date.now() + 30_000;
    } catch {
        return true;
    }
}

export async function proxy(request: NextRequest) {
    const access = request.cookies.get(ACCESS_COOKIE)?.value;
    const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
    if (!refresh || !accessNeedsRefresh(access)) return NextResponse.next();

    try {
        const tokens = await refreshToken(refresh);
        request.cookies.set(ACCESS_COOKIE, tokens.access);
        request.cookies.set(REFRESH_COOKIE, tokens.refresh);

        const response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set(ACCESS_COOKIE, tokens.access, {
            httpOnly: true,
            secure: SECURE_COOKIES,
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60,
        });
        response.cookies.set(REFRESH_COOKIE, tokens.refresh, {
            httpOnly: true,
            secure: SECURE_COOKIES,
            sameSite: "lax",
            path: "/",
            maxAge: 14 * 24 * 60 * 60,
        });
        return response;
    } catch (error) {
        if (error instanceof TokenRefreshError && (error.status === 401 || error.status === 403)) {
            request.cookies.delete(ACCESS_COOKIE);
            request.cookies.delete(REFRESH_COOKIE);
            const response = NextResponse.next({ request: { headers: request.headers } });
            response.cookies.delete(ACCESS_COOKIE);
            response.cookies.delete(REFRESH_COOKIE);
            return response;
        }
        return NextResponse.next();
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};