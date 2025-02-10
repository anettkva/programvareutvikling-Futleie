import React, { useEffect, useState } from "react";
import ItemCard from "@/components/item-card";
import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";

const ItemGrid: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  /**
   * Hook som henter alle items fra databasen og setter dem i items state
   * @returns void
   */
  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabaseClient.from("Items").select(`
          id,
          title,
          image,
          owner_id,
          owner: owner_id ( username )
        `);

      if (error) {
        console.error("Error fetching items:", error);
      } else {
        console.log("Fetched items:", data);
        setItems(data);
      }
    };

    fetchItems();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 m-5">
        {items.length === 0 ? (
          <p>No items found</p>
        ) : (
          items.map((item) => {
            const imageUrl =
              typeof item.image === "object" && item.image !== null
                ? (item.image as { image: string }).image
                : item.image;
            return (
              <ItemCard
                id={item.id}
                title={item.title}
                imageUrl={imageUrl}
                owner={item.owner.username}
                className="col-span-1"
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ItemGrid;
