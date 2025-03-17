import SearchableItemGrid from "@/components/searchable-item-grid";

/**
 * @component Search
 * @description Søkeside som lar brukere søke etter tilgjengelig utstyr.
 * Viser en overskrift og et søkbart rutenett med utstyr.
 * @returns {JSX.Element} En søkeside med tittel og søkbart rutenett av elementer
 */
export default function Search() {
    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold mb-6 px-5">Søk etter utstyr</h1>
            <SearchableItemGrid />
        </div>
    );
}
