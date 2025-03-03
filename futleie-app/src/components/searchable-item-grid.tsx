import React, { useState, useEffect } from "react";
import Search from "@/components/search";
import ItemGrid from "@/components/item-grid";
import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";

const SearchableItemGrid: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Item[]>([]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchTerm.trim() === "") {
                const { data, error } = await supabaseClient
                    .from("Items")
                    .select(
                        `
                      *,
                      Item_images(image_url),
                      Users:owner_id(username)
                      `
                    );
                if (error) {
                    console.error("Error fetching search results:", error);
                } else {
                    // Transform the data to match your Item type structure
                    const formattedResults = data.map((item) => ({
                        ...item,
                        images: item.Item_images.map(
                            (img: { image_url: any }) => img.image_url
                        ),
                        owner: item.Users?.username || "",
                    }));
                    setSearchResults(formattedResults);
                }
                return;
            }

            const { data, error } = await supabaseClient
                .from("Items")
                .select(
                    `
          *,
          Item_images(image_url),
          Users:owner_id(username)
        `
                )
                .or(
                    `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
                );

            if (error) {
                console.error("Error fetching search results:", error);
            } else {
                // Transform the data to match your Item type structure
                const formattedResults = data.map((item) => ({
                    ...item,
                    images: item.Item_images.map(
                        (img: { image_url: any }) => img.image_url
                    ),
                    owner: item.Users?.username || "",
                }));
                setSearchResults(formattedResults);
            }
        };

        fetchSearchResults();
    }, [searchTerm]);

    return (
        <div>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <ItemGrid inputItems={searchResults} />
        </div>
    );
};

export default SearchableItemGrid;
