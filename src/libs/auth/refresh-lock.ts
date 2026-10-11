import { createHash } from "crypto";
import { RefreshResult } from "./types";


const RESULT_TTL_MS = 10_000;
const STUCK_MS = 60_000;

type Entry = {
    promise: Promise<RefreshResult>;
    startedAt: number;
    completedAt?: number;
}


const store = globalThis as typeof globalThis & {
    __campushubRefreshLock?: Map<string, Entry>;
}

const inflight = (store.__campushubRefreshLock ??= new Map<string, Entry>());

function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

function sweep(now: number): void {
    for (const [key, entry] of inflight) {
        const expired = 
            entry.completedAt !== undefined
                ? now - entry.completedAt > RESULT_TTL_MS
                : now - entry.startedAt > STUCK_MS;
        if (expired) inflight.delete(key);
    }
}

export function refreshOnce(
    token: string,
    refresh: () => Promise<RefreshResult>,
): Promise<RefreshResult> {
    const key = hashToken(token);
    const now = Date.now();

    sweep(now);
    const existing = inflight.get(key);
    if (existing) return existing.promise;

    const entry: Entry = {
        startedAt: now,
        promise: refresh().then(
            (result) => {
                entry.completedAt = Date.now();
                return result;
            }, 
            (error: unknown) => {
                inflight.delete(key);
                throw error;
            }
        )
    }
    inflight.set(key, entry);
    return entry.promise;
}