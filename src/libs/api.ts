import { health, UserRegistrationData } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

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
    formData.append("password", payload.password);

    const res = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        body: formData,
    });
    if(!res.ok){
        throw new Error(`faild to register user ${res.status}`)
    }
    return res.json()
}