import React, { useEffect, useState } from "react";
import ItemCard from "@/components/item-card";
import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ItemGrid: React.FC<object> = () => {
  const [items, setItems] = useState<Item[]>([]);
  const navigate = useNavigate();

  const handleCreateAd = () => {
    navigate("/create-ad");
  };

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
      <div className="flex justify-end px-5 pt-5">
        <Button onClick={handleCreateAd} className="bg-black hover:bg-gray-800 text-white">
          Opprett annonse
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 m-5">
        {items.length === 0 ? (
          <p>No items found</p>
        ) : (
          //TODO: Må finne en bedre måte å hente ut bildet på
          items.map((item) => {
            console.log("Item image field:", item.image);
            let imageUrl = "";
            if (
              typeof item.image === "object" &&
              item.image &&
              "image" in (item.image as { image: string })
            ) {
              imageUrl = (item.image as { image: string }).image;
            } else if (typeof item.image === "string") {
              try {
                const imageObject = JSON.parse(item.image);
                imageUrl = imageObject.image;
              } catch (e) {
                console.error("Error parsing image JSON:", e);
              }
            }
            return (
              <ItemCard
                key={item.id}
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
