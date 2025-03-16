import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabaseClient from "@/supabaseClient";
import { Button } from "@/components/ui/button";
import ItemGrid from "@/components/item-grid";
import { Item } from "@/Types/Item";
import AddItemToGroupButton from "@/components/add-item-to-group-button";

// Define types
type Group = {
  id: number;
  name: string;
  description: string;
  owner_id: string;
  code: string;
  created_at: string;
};

export default function GroupAds() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGroupAndAds() {
      if (!groupId) {
        setError("No group ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch group details
        const { data: groupData, error: groupError } = await supabaseClient
          .from("Groups")
          .select("*")
          .eq("id", groupId)
          .single();

        if (groupError) {
          console.error("Error fetching group:", groupError);
          setError(`Failed to fetch group: ${groupError.message}`);
          setLoading(false);
          return;
        }

        setGroup(groupData);

        // Fetch item memberships related to this group
        const { data: memberships, error: membershipsError } =
          await supabaseClient
            .from("Item-membership")
            .select("item_id")
            .eq("group_id", groupId);

        if (membershipsError) {
          console.error("Error fetching item memberships:", membershipsError);
          setError(
            `Failed to fetch item memberships: ${membershipsError.message}`
          );
          setLoading(false);
          return;
        }

        if (memberships.length === 0) {
          setError("Ingen annonser tilknyttet denne gruppen.");
          setLoading(false);
          return;
        }

        // Fetch items based on item_ids from memberships
        const itemIds = memberships.map((membership) => membership.item_id);
        console.log(itemIds);
        const { data: itemsData, error: itemsError } = await supabaseClient
          .from("Items")
          .select(
            `
            *,
            Item_images(image_url),
            Users:owner_id(username, tot_rating, rating_counter)
          `
          )
          .in("id", itemIds);
        console.log(itemsData);

        if (itemsError) {
          console.error("Error fetching items:", itemsError);
          setError(`Failed to fetch items: ${itemsError.message}`);
          setLoading(false);
          return;
        }

        // Transform the data to match the Item type structure
        const formattedResults = itemsData.map((item) => ({
          ...item,
          images: item.Item_images.map(
            (img: { image_url: string }) => img.image_url
          ),
          owner: item.Users?.username || "",
          ownerTotRating: item.Users?.tot_rating || 0,
          ownerRatingCounter: item.Users?.rating_counter || 0,
        }));
        console.log(formattedResults);
        setItems(formattedResults || []);

        if (formattedResults.length === 0) {
          setError("Ingen annonser tilknyttet denne gruppen.");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchGroupAndAds();
  }, [groupId]);

  const handleBackToGroups = () => {
    navigate("/grupper");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white rounded-lg shadow p-6 flex justify-center">
          <p>Laster...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={handleBackToGroups}>Tilbake til grupper</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={handleBackToGroups} className="mr-4">
          ← Tilbake til grupper
        </Button>
        <h1 className="text-2xl font-bold">{group?.name} - Annonser</h1>
      </div>

      <div className="bg-[#FDEDE7] border border-[#F26416] text-[#F26416] px-4 py-3 rounded mb-6">
        <p>
          <strong>Gruppekode:</strong> {group?.code}
        </p>
        <p className="text-sm mt-1">{group?.description}</p>
      </div>
      <AddItemToGroupButton />
      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">
            Ingen annonser å vise ennå for denne gruppen.
          </p>
        </div>
      ) : (
        <ItemGrid inputItems={items} />
      )}
    </div>
  );
}
