import React, { useEffect, useRef, useState } from "react";
import ItemCard from "@/components/item-card";
import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";
import { Button } from "@/components/ui/button";
import { useNavigate , useLocation} from "react-router-dom";
import { putImagesInItems, putOwnersInItems } from "./itemfilling";
import Cookie from "js-cookie"
import Cookies from "js-cookie";

const ItemGrid: React.FC = () => {
  const [items, setItems] = useState<Item[] | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Ref-er som brukes for å sørge for at hookene stopper når de skal
  const setImageLimiter = useRef<boolean>(false);
  const setOwnerLimiter = useRef<boolean>(true);

  const handleCreateAd = () => {
    navigate("/create-ad");
  };

  // Hook som henter alle items fra databasen og setter dem i items state
  useEffect(() => {
    const fetchItems = async (id?: number) => {
      if (id) {
        const { data, error } = await supabaseClient.from("Items").select().eq("owner_id", id);
  
        if (error) {
          console.error("Error fetching items:", error);
        } else {
          setItems(data);
        }
        return;
      }
      const { data, error } = await supabaseClient.from("Items").select();
  
        if (error) {
          console.error("Error fetching items:", error);
        } else {
          setItems(data);
        }
        
      };
      
      if (location.pathname === "/profile") {
        const cookie = Cookies.get("user");
        console.log(cookie);
        if (cookie) {
          fetchItems(JSON.parse(cookie).id);
        }
      }
      else {
        fetchItems();
      }
  }, []);

  // Setter bilder inn i itemsene som ble fetchet i hooken ovenfor
  useEffect(() => {
    // Brukes for å hindre at hooken kjører i endeløs loop
    if (setImageLimiter.current) return;

    putImagesInItems(items, setItems);

    // Oppdaterer Ref-en slik at hooken slutter å kjøre når items har fått inn bilder
    if (items && items[0]) {
      if (items[0].images) {
        setImageLimiter.current = true;
        setOwnerLimiter.current = false;
      }
    }
  }, [items]);

  // Setter eiere inn i itemsene som ble fetchet i hooken ovenfor
  useEffect(() => {
    // Brukes for å hindre at hooken kjører i endeløs loop
    if (setOwnerLimiter.current) return;

    // Se dokumentasjon i itemfilling.ts
    putOwnersInItems(items, setItems);

    // Oppdaterer Ref-en slik at hooken slutter å kjøre når items har fått inn eiere
    if (items && items[0]) {
      if (items[0].owner) {
        setOwnerLimiter.current = true;
      }
    }
  }, [items]);

  return (
    <div>
      <div className="flex justify-end px-5 pt-5">
        <Button
          onClick={handleCreateAd}
          className="bg-black hover:bg-gray-800 text-white"
        >
          Opprett annonse
        </Button>
      </div>
      <div className="grid gap-6 m-5 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        {items ? (
          items.map((item) => {
            return (
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                // Tar første bilde som forsidebilde
                imageUrl={
                  item.images && item.images.length > 0
                    ? item.images[0]
                    : ""
                }
                owner={item.owner ? item.owner : ""}
                className="col-span-1"
              />
            );
          })
        ) : (
          <p>No items found</p>
        )}
      </div>
    </div>
  );
};

export default ItemGrid;
