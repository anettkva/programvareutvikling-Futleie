import SearchableItemGrid from "@/components/searchable-item-grid";

export default function Gallery() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 px-5">Finn noe å låne!</h1>
      <SearchableItemGrid />
    </div>
  );
}
