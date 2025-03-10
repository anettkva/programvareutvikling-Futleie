import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabaseClient from "@/supabaseClient";
import { Button } from "@/components/ui/button";
import ItemGrid from "@/components/item-grid";
import { Item } from "@/Types/Item";

// Define types
type Group = {
  id: number;
  name: string;
  description: string;
  owner_id: string;
  code: string;
  created_at: string;
};

// We'll use the existing Item type from the app

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

        // For now, we'll fetch all ads since we don't have a group-ads relationship yet
        // In a real implementation, you would fetch only ads related to this group
        const { data, error: adsError } = await supabaseClient
          .from("Items")
          .select(`
            *,
            Item_images(image_url),
            Users:owner_id(username)
          `)

        if (adsError) {
          console.error("Error fetching ads:", adsError);
          setError(`Failed to fetch ads: ${adsError.message}`);
        } else {
          // Transform the data to match the Item type structure
          const formattedResults = data.map((item) => ({
            ...item,
            images: item.Item_images.map(
              (img: { image_url: string }) => img.image_url
            ),
            owner: item.Users?.username || "",
          }));
          setItems(formattedResults || []);
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
        <Button 
          variant="outline" 
          onClick={handleBackToGroups}
          className="mr-4"
        >
          ← Tilbake til grupper
        </Button>
        <h1 className="text-2xl font-bold">{group?.name} - Annonser</h1>
      </div>

      <div className="bg-[#FDEDE7] border border-[#F26416] text-[#F26416] px-4 py-3 rounded mb-6">
        <p><strong>Gruppekode:</strong> {group?.code}</p>
        <p className="text-sm mt-1">{group?.description}</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Ingen annonser å vise ennå for denne gruppen.</p>
        </div>
      ) : (
        <ItemGrid inputItems={items} />
      )}
    </div>
  );
}
