import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import supabaseClient from "@/supabaseClient";
import { useParams } from "react-router-dom";
import { Item } from "@/Types/Item";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useForm, Controller } from "react-hook-form";
import Cookies from "js-cookie";

const AddItemToGroupButton: React.FC = () => {
  const { groupId } = useParams();
  const [items, setItems] = useState<Item[]>([]);
  const [existingMemberships, setExistingMemberships] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<{ selectedItems: number[] }>({
    defaultValues: { selectedItems: [] },
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      let userId;
      try {
        const user = JSON.parse(userCookie);
        userId = user.id;
      } catch (e) {
        userId = userCookie;
      }

      const { data: itemsData, error: itemsError } = await supabaseClient
        .from("Items")
        .select("*")
        .eq("owner_id", userId);

      if (itemsError) {
        setError(`Failed to fetch items: ${itemsError.message}`);
        setLoading(false);
        return;
      }

      setItems(itemsData);

      // Fetch existing memberships
      const { data: membershipsData, error: membershipsError } =
        await supabaseClient
          .from("Item-membership")
          .select("item_id")
          .eq("group_id", groupId);

      if (membershipsError) {
        setError(`Failed to fetch memberships: ${membershipsError.message}`);
        setLoading(false);
        return;
      }

      setExistingMemberships(
        membershipsData.map((membership) => membership.item_id)
      );
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemsToGroup = async (data: { selectedItems: number[] }) => {
    if (!groupId) {
      setError("No group ID provided");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { data: insertData, error } = await supabaseClient
        .from("Item-membership")
        .insert(
          data.selectedItems.map((itemId) => ({
            item_id: itemId,
            group_id: groupId,
            created_at: new Date().toISOString(),
          }))
        );

      if (error) {
        setError(`Failed to add items to group: ${error.message}`);
        setLoading(false);
        return;
      }

      setSuccess("Items successfully added to group");
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end">
      <Popover onOpenChange={(open) => open && fetchItems()}>
        <PopoverTrigger asChild>
          <Button>{loading ? "Laster inn..." : "Legg til annonser"}</Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 bg-white rounded shadow-lg">
          <form onSubmit={handleSubmit(handleAddItemsToGroup)}>
            <Controller
              name="selectedItems"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <input
                        type="checkbox"
                        value={item.id}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (e.target.checked) {
                            field.onChange([...field.value, value]);
                          } else {
                            field.onChange(
                              field.value.filter((v) => v !== value)
                            );
                          }
                        }}
                        checked={field.value.includes(item.id)}
                        disabled={existingMemberships.includes(item.id)}
                        className="mr-2"
                      />
                      <label
                        className={`ml-2 ${
                          existingMemberships.includes(item.id)
                            ? "text-gray-400"
                            : ""
                        }`}
                      >
                        {item.title}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
            <Button type="submit" disabled={loading} className="mt-4">
              {loading ? "Legger til annonse..." : "Legg til annonser"}
            </Button>
          </form>
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </div>
  );
};

export default AddItemToGroupButton;
