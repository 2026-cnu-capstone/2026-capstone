const API_BASE = process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000/api';

export async function fetchJSON<T>(url:string, options?:RequestInit): Promise<T>{
    const res = await fetch(`${API_BASE}${url}`,{
        headers: {'Content-Type':'application/json', ...options?.headers},
        ...options,
    });
    if(!res.ok){
        const error = await res.text();
        throw new Error(`API Error ${res.status}:${error}`);
    }
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text);
}
