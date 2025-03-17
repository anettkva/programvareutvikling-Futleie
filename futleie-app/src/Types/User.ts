export type User = {
    id?: number;
    username: string;
    created_at?: string;
    email?: string;
    admin: boolean;
    password_hash: string;
    tot_rating?: number;
    rating_counter?: number;
};