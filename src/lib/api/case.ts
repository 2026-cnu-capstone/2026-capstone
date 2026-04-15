import type {Case} from '@/types/Case';
import {fetchJSON} from '@/lib/apiClient';

export async function getCases():Promise<Case[]>{
    return fetchJSON<Case[]>('/cases');
}

export async function getCase(id:string):Promise<Case>{
    return fetchJSON<Case>(`/cases/${id}`);
}

export async function createCase(data:{name:string; description:string}):Promise<Case>{
    return fetchJSON<Case>('/cases',{
        method:'POST',
        body:JSON.stringify(data),
    });
}