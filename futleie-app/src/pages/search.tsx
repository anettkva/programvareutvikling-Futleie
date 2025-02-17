import ItemGrid from "@/components/item-grid";
import { Input } from "@/components/ui/input";

export default function Search() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 px-5 py-6">
        <h1 className="text-3xl font-bold">Søk etter utstyr</h1>
        <Input
          type="text"
          placeholder="Søk..."
          className="max-w-md"
        />
      </div>
      <ItemGrid />
    </div>
  );
}
