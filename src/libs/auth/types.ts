import { Profile } from "../types";


export type LoginInfo = {
    email: string;
    password: string;
}

export type AuthTokens = {
    access: string;
    refresh: string;
}

export type Session = AuthTokens & {user: AuthUser};

export type AuthUser = {
    id: number;
    username: string;
    email: string;
    is_verified: string;
    profile: Profile;
}

export type LoginInput = {
    email: string;
    password: string;
}

export type RefreshResult = {
    access: string;
    refresh?: string;
}


export type AuthDriver = {
    login(input: LoginInput): Promise<Session>;
    logout(accessToken: string, refreshToken: string): Promise<void>;
    me(accessToken: string): Promise<AuthUser>
}