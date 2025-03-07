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
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers not showing
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({
    position,
    setPosition,
}: {
    position: { lat: number; lng: number } | null;
    setPosition: (pos: { lat: number; lng: number }) => void;
}) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
        },
    });

    return position === null ? null : (
        <Marker position={[position.lat, position.lng]} />
    );
}

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
    const [showMap, setShowMap] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([
        63.430515, 10.395087,
    ]);
    const [locationStatus, setLocationStatus] = useState<string>("");

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabaseClient
                .from("Items")
                .select("category")
                .not("category", "is", null);

            if (error) {
                console.error("Error fetching categories:", error);
                return;
            }

            const uniqueCategories = [
                ...new Set(data.map((item) => item.category).filter(Boolean)),
            ];
            setCategories(uniqueCategories);
        };

        fetchCategories();
    }, []);

    // Update map center when user location changes
    useEffect(() => {
        if (userLocation) {
            setMapCenter([userLocation.lat, userLocation.lng]);
        }
    }, [userLocation]);

    const handleSearch = (search: string) => {
        setLocalSearchTerm(search);
        setSearchTerm(search);
    };

    const handleGetLocation = () => {
        setLocationStatus("Henter posisjon...");

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(location);
                    setLocationStatus("Posisjon funnet!");
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationStatus(
                        "Kunne ikke hente posisjon. Sjekk tillatelser."
                    );
                }
            );
        } else {
            setLocationStatus(
                "Geolokalisering støttes ikke i denne nettleseren."
            );
        }
    };

    const handleMapClick = (position: { lat: number; lng: number }) => {
        setUserLocation(position);
        setLocationStatus("Posisjon satt på kartet");
    };

    const handleRadiusChange = (value: number[]) => {
        setLocalRadius(value[0]);
        setRadius(value[0]);
    };

    const handleCategoryChange = (value: string) => {
        // Convert "all" back to empty string for the parent component's state
        setSelectedCategory(value === "all" ? "" : value);
    };

    const toggleMap = () => {
        setShowMap(!showMap);
        if (!showMap && !userLocation) {
            handleGetLocation();
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col gap-6 px-5 py-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-row gap-4">
                        <Input
                            type="text"
                            placeholder="Søk..."
                            className="max-w-md bg-white"
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
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGetLocation}
                                    className="flex items-center gap-1"
                                >
                                    {userLocation ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#22c55e"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="#22c55e"
                                            ></circle>
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="3"
                                                fill="#22c55e"
                                                stroke="none"
                                            ></circle>
                                        </svg>
                                    ) : (
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
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                            ></circle>
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="1"
                                            ></circle>
                                        </svg>
                                    )}
                                    Min posisjon
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleMap}
                                >
                                    {showMap ? "Skjul kart" : "Vis kart"}
                                </Button>
                            </div>
                        </div>

                        {showMap && (
                            <div
                                className="mt-4"
                                style={{ height: "300px", width: "100%" }}
                            >
                                <p className="text-sm mb-2">
                                    Klikk på kartet for å velge posisjon
                                </p>
                                <MapContainer
                                    center={mapCenter}
                                    zoom={13}
                                    scrollWheelZoom={true}
                                    style={{
                                        height: "100%",
                                        width: "100%",
                                        borderRadius: "8px",
                                    }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationMarker
                                        position={userLocation}
                                        setPosition={handleMapClick}
                                    />
                                </MapContainer>
                            </div>
                        )}

                        <Slider
                            id="radius"
                            min={1}
                            max={100}
                            step={1}
                            value={[localRadius]}
                            onValueChange={handleRadiusChange}
                        />

                        <div className="text-xs text-gray-500">
                            {locationStatus ||
                                (userLocation
                                    ? "Posisjon funnet"
                                    : "Posisjon ikke satt")}
                        </div>

                        {userLocation && (
                            <div className="text-xs text-gray-700">
                                Koordinater: {userLocation.lat.toFixed(6)},{" "}
                                {userLocation.lng.toFixed(6)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;
