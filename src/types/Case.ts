export interface Case{
    id: string;
    name: string;
    description: string;
    created_at:string;
    status: 'open' | 'closed';
}