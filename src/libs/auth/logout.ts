import { refreshOnce } from "./refresh-lock";
import { refreshToken } from "./tokens";
import { AuthDriver } from "./types";



export async function revokeRefreshToken(
    driver: AuthDriver,
    refresh: string,
    access?: string,
): Promise<void> {
    if (access) return driver.logout(access, refresh);

    const minted = await refreshOnce(refresh, () => refreshToken(refresh));
    return driver.logout(minted.access, minted.refresh ?? refresh);
}   