import { NextResponse } from "next/server";
import { AuthApiError } from "../types";


export function rejectCrossOrigin(request: Request): NextResponse | null {
    const origin = request.headers.get("origin");
    if (!origin) return null;

    const host = request.headers.get("host");
    try {
        if (new URL(origin).host === host) return null;
    } catch {

    }
    return NextResponse.json({ detail: "Request blocked."}, { status: 403});
}

export function errorResponse(error: unknown): NextResponse {
    if (error instanceof SyntaxError){
        return NextResponse.json(
            { detail: "Invalid JSON in the request body"},
            { status: 400 },

        )
    }
    if (error instanceof AuthApiError) {
        return NextResponse.json(
            { detail: error.detail, code: error.code, fieldErrors: error.fieldErrors},
            { status: error.status },
        )
    }
    return NextResponse.json(
        { detail: "Campus-hub is having trouble right now. Try again shortly" },
        { status: 502 },
    )
}