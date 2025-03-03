import React from "react";
import SearchableItemGrid from "@/components/searchable-item-grid";

export default function Search() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 px-5">Søk etter utstyr</h1>
      <SearchableItemGrid />
    </div>
  );
}
