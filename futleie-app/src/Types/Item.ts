export type Item = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  rented: boolean;
  owner_id: number;
  owner?: {
    username: string;
  };
  images?: {
    image_url: string;
    url: string;
    alt: string;
  }[];
};
