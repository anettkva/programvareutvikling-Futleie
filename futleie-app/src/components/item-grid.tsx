import React, { useEffect, useRef, useState } from "react";
import ItemCard from "@/components/item-card";
import { Item } from "@/Types/Item";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { putImagesInItems, putOwnersInItems } from "./itemfilling";

type ItemGridProps = {
  inputItems: Item[];
};

const ItemGrid: React.FC<ItemGridProps> = ({ inputItems = [] }) => {
  const [items, setItems] = useState<Item[] | null>(inputItems);
  const navigate = useNavigate();

  // Ref-er som brukes for å sørge for at hookene stopper når de skal
  const setImageLimiter = useRef<boolean>(false);
  const setOwnerLimiter = useRef<boolean>(false);

  const handleCreateAd = () => {
    navigate("/create-ad");
  };

  useEffect(() => {
    setItems(inputItems);
    setImageLimiter.current = false;
    setOwnerLimiter.current = false;
  }, [inputItems]);

  // Setter bilder inn i itemsene som ble fetchet i hooken ovenfor
  useEffect(() => {
    if (!items) return;

    // Brukes for å hindre at hooken kjører i endeløs loop
    if (setImageLimiter.current) return;

    putImagesInItems(items, setItems);

    // Oppdaterer Ref-en slik at hooken slutter å kjøre når items har fått inn bilder
    if (items && items[0] && items[0].images) {
      setImageLimiter.current = true;
    }
  }, [items]);

  // Setter eiere inn i itemsene som ble fetchet i hooken ovenfor
  useEffect(() => {
    if (!items) return;

    // Brukes for å hindre at hooken kjører i endeløs loop
    if (setOwnerLimiter.current) return;

    // Se dokumentasjon i itemfilling.ts
    putOwnersInItems(items, setItems);

    // Oppdaterer Ref-en slik at hooken slutter å kjøre når items har fått inn eiere
    if (items && items[0] && items[0].owner) {
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
                  item.images && item.images.length > 0 ? item.images[0] : ""
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
