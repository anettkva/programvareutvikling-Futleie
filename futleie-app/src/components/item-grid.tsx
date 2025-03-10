import React, { useEffect, useRef, useState } from "react";
import ItemCard from "@/components/item-card";
import { Item } from "@/Types/Item";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type ItemGridProps = {
    inputItems: Item[];
};

const ItemGrid: React.FC<ItemGridProps> = ({ inputItems = [] }) => {
    const [items, setItems] = useState<Item[] | null>(inputItems);
    const navigate = useNavigate();

    const handleCreateAd = () => {
        navigate("/create-ad");
    };

    useEffect(() => {
        setItems(inputItems);
    }, [inputItems]);

    return (
        <div>
            <div className="flex justify-end px-5 pt-5">
                <Button onClick={handleCreateAd}>Opprett annonse</Button>
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
                                ownerTotRating={item.ownerTotRating}
                                ownerRatingCounter={item.ownerRatingCounter}
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
