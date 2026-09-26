import { httpDriver } from "@/libs/auth/http-driver";
import { errorResponse, rejectCrossOrigin } from "@/libs/auth/route-helper";
import { setSessionCookies } from "@/libs/auth/session";
import { LoginInfo } from "@/libs/auth/types";
import { AuthApiError } from "@/libs/types";
import { NextResponse } from "next/server";



export async function POST(request: Request) {
    const blocked = rejectCrossOrigin(request);
    if (blocked) return blocked    

    try {
        const input = (await request.json()) as LoginInfo;
        const { access, refresh, user } = await httpDriver.login({
            email: input.email.trim() ?? "",
            password: input.password ?? "",
        });
        if (!user.is_verified) {
            throw new AuthApiError(403, {"detail": "Verify your account to singin."})
        }
        const res = NextResponse.json({ user });
        setSessionCookies(res, {access, refresh });
        return res
    } catch(error){
        return errorResponse(error)
    }
}