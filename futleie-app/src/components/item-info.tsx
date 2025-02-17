import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useParams, useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
    const { itemId } = useParams<{ itemId: string }>();
    const [item, setItem] = useState<Item | null>(null);
    const [images, setImages] = useState<Array<string> | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: undefined,
    });
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        // Hent bruker fra cookie
        const userCookie = Cookies.get("user");
        if (userCookie) {
            const parsedUser = JSON.parse(userCookie);

            if (parsedUser.id) {
                setCurrentUserId(parsedUser.id);
            }
        }
    }, []);

    useEffect(() => {
        const fetchItem = async () => {
            const { data, error } = await supabaseClient
                .from("Items")
                .select()
                .eq("id", itemId)
                .single();

            if (error) {
                console.error("Error fetching item:", error);
            } else {
                setItem(data as Item);
            }
        };

        if (itemId) {
            fetchItem();
        }
    }, [itemId]);

    useEffect(() => {
        const fetchImages = async () => {
            if (item) {
                const { data, error } = await supabaseClient
                    .from("Item_images")
                    .select("image_url")
                    .eq("item_id", itemId);

                if (error) {
                    console.log("Error fetching images");
                    return;
                }
                const fetchedImages = data.map((image) => image.image_url);
                console.log(fetchedImages);
                setImages(fetchedImages);
            }
        };
        fetchImages();
    }, [itemId, item]);

    if (!item || !images) {
        return <p>Loading...</p>;
    }

    const isOwner = item.owner_id === currentUserId;

    function deleteAd() {
        const deleteItem = async () => {
            const { error } = await supabaseClient
                .from("Items")
                .delete()
                .eq("id", itemId);

            if (error) {
                console.error("Error deleting item:", error);
            } else {
                navigate("/");
            }
        };

        deleteItem();
    }

    return (
        <div className="flex flex-col items-center gap-6 m-5">
            <div className="flex flex-col gap-6 w-full max-w-2xl">
                <div className="flex flex-col gap-4">
                    <Carousel className="w-full max-w-4xl mx-auto">
                        <CarouselContent>
                            {images.map((imageUrl, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                                        <img
                                            src={imageUrl}
                                            alt={`Item Image ${index}`}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                    <h1 className="text-3xl font-bold">{item.title}</h1>
                    <p className="text-xl">{item.description}</p>

                    {isOwner ? (
                        // Hvis eier
                        <div className="flex gap-4">
                            <Button
                                onClick={() =>
                                    navigate(`/change-ad/${item.id}`)
                                }
                                variant="outline"
                            >
                                Endre annonse
                            </Button>
                            <Button variant="destructive" onClick={deleteAd}>
                                Slett annonse
                            </Button>
                        </div>
                    ) : (
                        // Hvis ikke eier
                        <>
                            <label className="text-lg text-gray-600">
                                Leieperiode:
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(
                                                        dateRange.from,
                                                        "LLL dd, y"
                                                    )}{" "}
                                                    -{" "}
                                                    {format(
                                                        dateRange.to,
                                                        "LLL dd, y"
                                                    )}
                                                </>
                                            ) : (
                                                format(
                                                    dateRange.from,
                                                    "LLL dd, y"
                                                )
                                            )
                                        ) : (
                                            <span>Velg en dato</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
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
                            <Button>Send forespørsel</Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemInfo;
