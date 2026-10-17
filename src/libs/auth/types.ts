

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
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name?: string;
    is_verified: string;
    avatar?: string;
    bio?: string;
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