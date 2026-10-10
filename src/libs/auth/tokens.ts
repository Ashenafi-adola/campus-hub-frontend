import type { AuthTokens } from "./types";

const API_URL =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000";

type RefreshPayload = {
    access?: unknown;
    refresh?: unknown;
    detail?: unknown;
};

export class TokenRefreshError extends Error {
    constructor(readonly status: number, message: string) {
        super(message);
        this.name = "TokenRefreshError";
    }
}

export async function refreshToken(refresh: string): Promise<AuthTokens> {
    const response = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
    });

    const payload = (await response.json().catch(() => ({}))) as RefreshPayload;
    if (!response.ok) {
        throw new TokenRefreshError(
            response.status,
            typeof payload.detail === "string" ? payload.detail : "Refresh token is invalid.",
        );
    }
    if (typeof payload.access !== "string") {
        throw new Error("Refresh response did not include an access token.");
    }

    return {
        access: payload.access,
        refresh: typeof payload.refresh === "string" ? payload.refresh : refresh,
    };
}
