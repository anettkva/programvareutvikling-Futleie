import React, { useState, useEffect } from "react";
import Search from "@/components/search";
import ItemGrid from "@/components/item-grid";
import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";

const SearchableItemGrid: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Item[]>([]);
    const [radius, setRadius] = useState(10);
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            // Basic query to fetch all items or items matching search term
            let query = supabaseClient.from("Items").select(`
                    *,
                    Item_images(image_url),
                    Users:owner_id(username)
                `);

            // Add search filter if searchTerm exists
            if (searchTerm.trim() !== "") {
                query = query.or(
                    `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
                );
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching search results:", error);
                return;
            }

            // Transform the data to match your Item type structure
            let formattedResults = data.map((item) => ({
                ...item,
                images: item.Item_images.map(
                    (img: { image_url: any }) => img.image_url
                ),
                owner: item.Users?.username || "",
            }));

            // Filter by location if userLocation is provided
            if (userLocation && radius > 0) {
                formattedResults = formattedResults.filter((item) => {
                    // Skip items without location data
                    if (!item.lat || !item.lng) return false;

                    // Calculate distance between user and item
                    const distance = calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        item.lat,
                        item.lng
                    );

                    // Include the item if it's within the radius
                    return distance <= radius;
                });
            }

            setSearchResults(formattedResults);
        };

        fetchSearchResults();
    }, [searchTerm, userLocation, radius]);

    // Haversine formula to calculate distance between two points on Earth
    const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon1 - lon2);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) *
                Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    };

    const deg2rad = (deg: number): number => {
        return deg * (Math.PI / 180);
    };

    return (
        <div>
            <Search
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                radius={radius}
                setRadius={setRadius}
                userLocation={userLocation}
                setUserLocation={setUserLocation}
            />
            <ItemGrid inputItems={searchResults} />
        </div>
    );
};

export default SearchableItemGrid;
