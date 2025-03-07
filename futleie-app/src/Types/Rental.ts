export type Rental = {
  id: number;
  start_date: Date;
  end_date: Date;
  item_id: number;
  renter_id: number;
  status: "accepted" | "declined" | "pending";
};
