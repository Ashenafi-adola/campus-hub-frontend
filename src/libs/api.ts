import { health, UserRegistrationData } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export class ApiError extends Error {
    status: number;
    fieldErrors: Record<string, string[]>;

    constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.fieldErrors = fieldErrors;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractApiError(data: any): string {
    if (!data || typeof data !== "object") return "Something went wrong. Please try again.";

    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;

    const nonFieldErrors = data.non_field_errors ?? data.nonFieldErrors;
    if (Array.isArray(nonFieldErrors) && nonFieldErrors.length > 0) {
        return String(nonFieldErrors[0]);
    }

    for (const key of Object.keys(data)) {
        const value = data[key];
        if (Array.isArray(value) && value.length > 0) {
            return String(value[0]);
        }
        if (typeof value === "string" && value.trim()) {
            return value;
        }
    }

    return "Validation failed. Please check your inputs.";
}

export async function getHelath(): Promise<health>{
    const res = await fetch(`${API_URL}/health`)
    if (!res.ok){
        throw new Error(`faild health chek ${res.status}`)
    }
    return res.json()
}

export async function postRegistrationData(payload: UserRegistrationData): Promise<UserRegistrationData> {
    const formData = new FormData()
    formData.append("first_name", payload.first_name);
    formData.append("last_name", payload.last_name);
    formData.append("username", payload.username);
    formData.append("email", payload.email);
    if (payload.password) formData.append("password", payload.password);

    const res = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let payload: any = {};
        try {
            payload = await res.json();
        } catch {
            payload = {};
        }

        const fieldErrors: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(payload || {})) {
            if (Array.isArray(value)) {
                fieldErrors[key] = value.map((item) => String(item));
            } else if (typeof value === "string") {
                fieldErrors[key] = [value];
            }
        }

        throw new ApiError(extractApiError(payload), res.status, fieldErrors);
    }

    return res.json()
}