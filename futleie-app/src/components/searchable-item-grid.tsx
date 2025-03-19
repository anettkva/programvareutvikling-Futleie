import React, { useState, useEffect } from "react";
import Search from "@/components/search";
import ItemGrid from "@/components/item-grid";
import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";
import CreateAdButton from "./create-ad-button";

const SearchableItemGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [radius, setRadius] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Henter items fra database basert på søketerm, kategori og radius
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const { data: memberships, error: membershipsError } =
          await supabaseClient.from("Item-membership").select("item_id");

        if (membershipsError) {
          setError(`Failed to fetch memberships: ${membershipsError.message}`);
          return;
        }

        const membershipItemIds = memberships.map(
          (membership) => membership.item_id
        );
        let query = supabaseClient.from("Items").select(`
                    *,
                    Item_images(image_url),
                    Users:owner_id(username, tot_rating, rating_counter)
                `);

        if (searchTerm.trim() !== "") {
          query = query.or(
            `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
          );
        }

        if (selectedCategory) {
          query = query.eq("category", selectedCategory);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching search results:", error);
          return;
        }

        let formattedResults = data
          .filter((item) => !membershipItemIds.includes(item.id))
          .map((item) => ({
            ...item,
            images: item.Item_images.map(
              (img: { image_url: any }) => img.image_url
            ),
            owner: item.Users?.username || "",
            ownerTotRating: item.Users?.tot_rating || 0,
            ownerRatingCounter: item.Users?.rating_counter || 0,
          }));

        if (userLocation && radius > 0 && radius < 100) {
          formattedResults = formattedResults.filter((item) => {
            if (!item.lat || !item.lng) return false;

            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              item.lat,
              item.lng
            );
            return distance <= radius;
          });
        }

        setSearchResults(formattedResults);
      } catch (err) {
        console.error("An unexpected error occurred", err);
      }
    };

    fetchSearchResults();
  }, [searchTerm, userLocation, radius, selectedCategory]);

  /**
   * Regner ut distansen mellom to punkter på kartet
   * @param lat1
   * @param lon1
   * @param lat2
   * @param lon2
   * @returns Distanse mellom to punkter i km
   */
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

  /**
   * Konverterer grader til radianer
   * @param deg
   * @returns
   */
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
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <CreateAdButton />
      <ItemGrid inputItems={searchResults} />
    </div>
  );
};

export default SearchableItemGrid;
