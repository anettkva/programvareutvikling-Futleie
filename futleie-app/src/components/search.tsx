import React from "react";
import { Input } from "@/components/ui/input";

type SearchProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

const Search: React.FC<SearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 px-5 py-6">
        <h1 className="text-3xl font-bold">Søk etter utstyr</h1>
        <Input
          type="text"
          placeholder="Søk..."
          className="max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Search;
