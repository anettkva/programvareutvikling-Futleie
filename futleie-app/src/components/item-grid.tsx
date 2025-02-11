import React, { useEffect, useState } from "react";
import ItemCard from "@/components/item-card";
import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";

const ItemGrid: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabaseClient.from("Items").select(`
          id,
          created_at,
          title,
          description,
          rented,
          owner_id,
          owner: owner_id ( username ),
          Item_images ( image_url )
        `);

      if (error) {
        console.error("Error fetching items:", error);
        return;
      }

      console.log("Fetched items:", data);

      const formattedItems: Item[] = data.map((item) => ({
        ...item,
        images:
          item.Item_images?.map((img) => ({
            image_url: img.image_url,
            alt: item.title,
          })) || [],
      }));

      setItems(formattedItems);
    };

    fetchItems();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 m-5">
        {items.length === 0 ? (
          <p>No items found</p>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              title={item.title}
              imageUrl={item.images[0]?.image_url || ""}
              owner={item.owner.username}
              className="col-span-1"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ItemGrid;
