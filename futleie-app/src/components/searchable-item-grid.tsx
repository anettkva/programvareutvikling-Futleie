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
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabaseClient
        .from("Items")
        .select("*")
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      if (error) {
        console.error("Error fetching search results:", error);
      } else {
        console.log("Search results:", data);
        setSearchResults(data);
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
