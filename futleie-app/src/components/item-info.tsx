import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

const ItemInfo: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const [item, setItem] = useState<
    (Item & { image: { image: string } | string }) | null
  >(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });

  /*
   * Hook som henter item fra databasen basert på itemId og setter item state
   * @returns void
   */
  useEffect(() => {
    const fetchItem = async () => {
      console.log("Fetching item with ID:", itemId);
      const { data, error } = await supabaseClient
        .from("Items")
        .select(
          `
          id,
          title,
          description,
          rented,
          owner_id,
          renter_id,
          return_date,
          image,
          owner: owner_id ( username )
        `
        )
        .eq("id", itemId)
        .single();

      if (error) {
        console.error("Error fetching item:", error);
      } else {
        console.log("Fetched item:", data);
        setItem(data);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  if (!item) {
    return <p>Loading...</p>;
  }

  const images = Array.isArray(item.image) ? item.image : [item.image];

  return (
    <div className="flex flex-col items-center gap-6 m-5">
      <Carousel>
        <CarouselContent>
          {images.map((imageUrl, index) => (
            <CarouselItem key={index}>
              <img
                //TODO: Ikke testet om dette fungerer grunnet manglende data
                src={`data:image/jpeg;base64,${imageUrl}`}
                alt={`Item Image ${index}`}
                className="w-full h-auto"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex flex-col gap-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold">{item.title}</h1>
        <p className="text-xl">{item.description}</p>
        <p className="text-lg text-gray-600">Eier: {item.owner.username}</p>
        <div className="flex flex-col gap-4">
          <label className="text-lg text-gray-600">Leieperiode:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Velg en dato</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={3}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button>Send forespørsel</Button>
      </div>
    </div>
  );
};

export default ItemInfo;
