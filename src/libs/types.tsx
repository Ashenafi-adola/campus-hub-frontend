export interface health {
    health: string;
}

export type UserRegistrationData = {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password?: string;
    confirm_password?: string;
}

export type FieldErrors = Record<string, string[]>;

export class AuthApiError extends Error {
    readonly status: number;
    readonly fieldErrors: FieldErrors;
    readonly detail?: string;
    readonly code?: string;

    constructor(status: number, body: Record<string, unknown>){
        const detail = typeof body.detail === "string" ? body.detail : undefined;
        const code = typeof body.code === "string" ? body.code : undefined;

        const fieldErrors: FieldErrors = {};
        for (const [key, value] of Object.entries(body)) {
            if (key === "detail" || key === "code") continue;
            if (Array.isArray(value)) fieldErrors[key] = value.map(String);
            else if (typeof value === "string") fieldErrors[key] = [value];
        }

        super(detail ?? "Request failed");
        this.name = "AuthApiError";
        this.status = status;
        this.detail = detail;
        this.code = code;
        this.fieldErrors = fieldErrors;
    }
}

