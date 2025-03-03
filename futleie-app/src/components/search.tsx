import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import supabaseClient from "@/supabaseClient";

type SearchProps = {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    radius?: number;
    setRadius?: (radius: number) => void;
    userLocation?: { lat: number; lng: number } | null;
    setUserLocation?: (location: { lat: number; lng: number } | null) => void;
    selectedCategory?: string;
    setSelectedCategory?: (category: string) => void;
};

const Search: React.FC<SearchProps> = ({
    searchTerm,
    setSearchTerm,
    radius = 10,
    setRadius = () => {},
    userLocation = null,
    setUserLocation = () => {},
    selectedCategory = "",
    setSelectedCategory = () => {},
}) => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [localRadius, setLocalRadius] = useState(radius);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        // Fetch categories from the database
        const fetchCategories = async () => {
            const { data, error } = await supabaseClient
                .from("Items")
                .select("category")
                .not("category", "is", null);

            if (error) {
                console.error("Error fetching categories:", error);
                return;
            }

            // Extract unique categories
            const uniqueCategories = [
                ...new Set(data.map((item) => item.category).filter(Boolean)),
            ];
            setCategories(uniqueCategories);
        };

        fetchCategories();
    }, []);

    const handleSearch = (search: string) => {
        setLocalSearchTerm(search);
        setSearchTerm(search);
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert(
                        "Kunne ikke hente din posisjon. Vennligst sjekk tillatelser."
                    );
                }
            );
        } else {
            alert("Geolokalisering er ikke støttet i din nettleser.");
        }
    };

    const handleRadiusChange = (value: number[]) => {
        setLocalRadius(value[0]);
        setRadius(value[0]);
    };

    const handleCategoryChange = (value: string) => {
        // Convert "all" back to empty string for the parent component's state
        setSelectedCategory(value === "all" ? "" : value);
    };

    return (
        <div className="w-full">
            <div className="flex flex-col gap-6 px-5 py-6">
                <h1 className="text-3xl font-bold">Søk etter utstyr</h1>
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-row gap-4">
                        <Input
                            type="text"
                            placeholder="Søk..."
                            className="max-w-md"
                            value={localSearchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2 max-w-md">
                        <Select
                            value={
                                selectedCategory === ""
                                    ? "all"
                                    : selectedCategory
                            }
                            onValueChange={handleCategoryChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Velg kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Kategorier</SelectLabel>
                                    <SelectItem value="all">
                                        Alle kategorier
                                    </SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 max-w-md">
                        <div className="flex justify-between items-center">
                            <label
                                htmlFor="radius"
                                className="text-sm font-medium"
                            >
                                Radius: {localRadius} km
                            </label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGetLocation}
                                className="flex items-center gap-1"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <circle cx="12" cy="12" r="1"></circle>
                                </svg>
                                Min posisjon
                            </Button>
                        </div>
                        <Slider
                            id="radius"
                            min={1}
                            max={50}
                            step={1}
                            value={[localRadius]}
                            onValueChange={handleRadiusChange}
                        />
                        <div className="text-xs text-gray-500">
                            {userLocation
                                ? "Posisjon funnet"
                                : "Posisjon ikke satt"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;
