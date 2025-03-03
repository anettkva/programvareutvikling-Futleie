import React, { useState, useEffect } from "react";
import ItemGrid from "@/components/item-grid";
import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";

const GalleryItemGrid: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        const fetchAllItems = async () => {
            // Basic query to fetch all items with related data
            let query = supabaseClient.from("Items").select(`
                *,
                Item_images(image_url),
                Users:owner_id(username)
            `);

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching items:", error);
                return;
            }

            // Transform the data to match the Item type structure
            const formattedResults = data.map((item) => ({
                ...item,
                images: item.Item_images.map(
                    (img: { image_url: any }) => img.image_url
                ),
                owner: item.Users?.username || "",
            }));

            setItems(formattedResults);
        };

        fetchAllItems();
    }, []);

    return (
        <div>
            <ItemGrid inputItems={items} />
        </div>
    );
};

export default GalleryItemGrid;
