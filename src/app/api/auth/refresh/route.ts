import { errorResponse, rejectCrossOrigin } from "@/libs/auth/route-helper";
import { ACCESS_COOKIES, REFRESH_COOKIES, setSessionCookies } from "@/libs/auth/session";
import { refreshToken, TokenRefreshError } from "@/libs/auth/tokens";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";


export async function POST(request: Request): Promise<NextResponse> {
    const blocked = rejectCrossOrigin(request);
    if (blocked) return blocked;

    const cookieStore = await cookies();
    const currentRefresh = cookieStore.get(REFRESH_COOKIES)?.value;
    if (!currentRefresh) {
        return NextResponse.json({ detail: "Refresh token is missing." }, { status: 401 });
    }

    try {
        const tokens = await refreshToken(currentRefresh);
        const response = NextResponse.json({ access: tokens.access });
        setSessionCookies(response, tokens);
        return response;
    } catch(error){
        if (error instanceof TokenRefreshError) {
            const response = NextResponse.json({ detail: error.message }, { status: error.status });
            if (error.status === 401 || error.status === 403) {
                response.cookies.delete(ACCESS_COOKIES);
                response.cookies.delete(REFRESH_COOKIES);
            }
            return response;
        }
        return errorResponse(error);
    }
}
