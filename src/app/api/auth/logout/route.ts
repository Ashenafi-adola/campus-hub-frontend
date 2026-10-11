import { httpDriver } from "@/libs/auth/http-driver";
import { revokeRefreshToken } from "@/libs/auth/logout";
import { rejectCrossOrigin } from "@/libs/auth/route-helper";
import { clearSessionCookies, readSession } from "@/libs/auth/session";
import { NextResponse } from "next/server";



export async function POST(request: Request) {
    const blocked = rejectCrossOrigin(request)
    if (blocked) return blocked;

    const { access, refresh} = await readSession();

    if (refresh){
        try{
            await revokeRefreshToken(httpDriver, refresh, access)
        }catch(error){
            console.error("[auth] couldn't blacklist the refresh token", error)
        }
    }
    const res = NextResponse.json({ok: true });
    clearSessionCookies(res);
    return res;
}