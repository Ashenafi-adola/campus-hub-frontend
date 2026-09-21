import { health } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getHelath(): Promise<health>{
    const res = await fetch(`${API_URL}/health`)
    if (!res.ok){
        throw new Error(`faild health chek ${res.status}`)
    }
    return res.json()
}