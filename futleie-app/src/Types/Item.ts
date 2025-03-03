export type Item = {
    id: number;
    created_at: string;
    title: string;
    description: string;
    rented: boolean;
    owner_id: number;
    owner: string;
    images: string[];
    category: string;
    location: string;
};
