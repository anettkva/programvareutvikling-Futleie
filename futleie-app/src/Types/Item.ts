export type Item = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  rented: boolean;
  owner_id: number;
  renter_id: number;
  return_date: string;
  image: string;
  owner: {
    username: string;
  };
};
