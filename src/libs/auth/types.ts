

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
}