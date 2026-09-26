import { FieldErrors } from "../types";

export type AuthResponse<T> = 
  | {
    ok: true; data: T
} | {
    ok: false; status: number; detail?: string, code?: string; fieldErrors: FieldErrors
}

export async function postAuth<T>(
    path: string, 
    body: Record<string, unknown>
): Promise<AuthResponse<T>> {
    let res: Response;
    try {
        res = await fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body),
        });
    } catch {
        return {
            ok: false,
            status: 0,
            detail: "Couldn't reach campus-hub. Check your connection and tryp again.",
            fieldErrors: {},
        }
    }

    const payload = (await res.json().catch(()=>({}))) as {
        detail?: string,
        code?: string,
        fieldErrors?: FieldErrors
    }

    if (res.ok) return {ok: true, data: payload as T};

    return {
        ok: false,
        status: res.status,
        detail: payload.detail ?? fallbackMessage(res.status), 
        code: payload.code,
        fieldErrors: payload.fieldErrors ?? {}
    }
}

function fallbackMessage(status: number): string | undefined{
    if (status === 429 ) return "Too many attempts. Wait a moment and try again.";
    if (status >= 500) return "Campus hub is having trouble right now. Tryp again shortly.";
    return undefined
}