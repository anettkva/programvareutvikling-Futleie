import React, { useEffect, useRef, useState } from "react";
import ItemCard from "@/components/item-card";
import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { putImagesInItems, putOwnersInItems } from "./itemfilling";

const ItemGrid: React.FC<object> = () => {
  const [items, setItems] = useState<Item[] | null>(null);
  const navigate = useNavigate();

  //Ref-er som brukes for å sørge for at hookene stopper når de skal
  const setImageLimiter = useRef<boolean>(false);
  const setOwnerLimiter = useRef<boolean>(false);

  const handleCreateAd = () => {
    navigate("/create-ad");
  };

  //Hook som henter alle items fra databasen og setter dem i items state
  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabaseClient.from("Items").select();

      if (error) {
        console.error("Error fetching items:", error);
      } else {
        setItems(data);
      }
    };

    fetchItems();
  }, []);

  //Setter bilder inn i itemsene som ble fetchet i hooken ovenfor
  useEffect(() => {
    //Brukes for å hindre at hooken kjører i endeløs loop
    if (setImageLimiter.current) return;

    putImagesInItems(items, setItems);

    //Oppdaterer Ref-en slik at hooken slutter å kjøre når items har fått inn bilder
    if (items && items[0].images) {
      setImageLimiter.current = true;
    }
  }, [items]);

  //Setter eiere inn i itemsene som ble fetchet i hooken ovenfor
  useEffect(() => {
    //Brukes for å hindre at hooken kjører i endeløs loop
    if (setOwnerLimiter.current) return;

    //Se dokumentasjon i itemfilling.ts
    putOwnersInItems(items, setItems);

    //Oppdaterer Ref-en slik at hooken slutter å kjøre når items har fått inn eiere
    if (items && items[0].owner) {
      setOwnerLimiter.current = true;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 m-5">
        {items ? (
          items.map((item) => {
            return (
              <ItemCard
                key={item.id}
                title={item.title}
                //Tar første bilde som forsidebilde
                imageUrl={item.images ? item.images[0] : ""}
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
