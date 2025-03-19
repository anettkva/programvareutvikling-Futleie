import React, { useState, useEffect } from "react";
import ItemGrid from "@/components/item-grid";
import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";

const GalleryItemGrid: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Henter alle items fra databasen og setter de i state
     * @returns
     */
    const fetchAllItems = async () => {
      try {
        setLoading(true);

        const { data: memberships, error: membershipsError } =
          await supabaseClient.from("Item-membership").select("item_id");

        if (membershipsError) {
          setError(`Failed to fetch memberships: ${membershipsError.message}`);
          setLoading(false);
          return;
        }

        const membershipItemIds = memberships.map(
          (membership) => membership.item_id
        );

        let query = supabaseClient.from("Items").select(`
                    *,
                    Item_images(image_url),
                    Users:owner_id(username, tot_rating, rating_counter)
                `);

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching items:", error);
          setError(`Failed to fetch items: ${error.message}`);
          setLoading(false);
          return;
        }

        const formattedResults = data
          .filter((item) => !membershipItemIds.includes(item.id))
          .map((item) => ({
            ...item,
            images: item.Item_images.map(
              (img: { image_url: any }) => img.image_url
            ),
            owner: item.Users?.username || "",
            ownerTotRating: item.Users?.tot_rating || 0,
            ownerRatingCounter: item.Users?.rating_counter || 0,
          }));

        setItems(formattedResults);
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <ItemGrid inputItems={items} />
    </div>
  );
};

export default GalleryItemGrid;
