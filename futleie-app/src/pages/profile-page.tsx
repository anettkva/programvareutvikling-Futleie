import ItemGrid from "@/components/item-grid";
import Profile from "@/components/profile";
import supabaseClient from "@/supabaseClient";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Item } from "@/Types/Item";
import { User } from "@/Types/User";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        const userCookie = Cookies.get("user");
        if (!userCookie) {
            return;
        }
        const user = JSON.parse(userCookie);

        let query = supabaseClient
            .from("Items")
            .select(
                `
            *,
            Item_images(image_url),
            Users:owner_id(username)
        `
            )
            .eq("owner_id", user?.id);

        const fetchItems = async () => {
            const { data, error } = await query;

            if (error) {
                console.error("Error fetching items:", error);
                return;
            }
            let formattedResults = data.map((item) => ({
                ...item,
                images: item.Item_images.map(
                    (img: { image_url: any }) => img.image_url
                ),
                owner: item.Users?.username || "",
            }));
            setItems(formattedResults as Item[]);
        };
        fetchItems();
    }, []);

    return (
        <div className="flex flex-col 2xl:flex-row w-full gap-4">
            <div className="2xl:w-1/2 w-full">
                <Profile />
            </div>
            <div className="2xl:w-1/2 w-full">
                <h1 className="text-3xl font-bold mb-6 px-5">Mine annonser</h1>
                <ItemGrid inputItems={items} />
            </div>
        </div>
    );
}
