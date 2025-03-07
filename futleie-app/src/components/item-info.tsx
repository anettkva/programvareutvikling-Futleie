import React, { useEffect, useState } from "react";
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
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "./ui/carousel";
import Cookies from "js-cookie";
import { MessageCircle } from "lucide-react";

const ItemInfo: React.FC = () => {
    const navigate = useNavigate();
    const { itemId } = useParams<{ itemId: string }>();
    const [item, setItem] = useState<Item | null>(null);
    const [images, setImages] = useState<Array<string> | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: undefined,
    });
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        // Hent bruker fra cookie
        const userCookie = Cookies.get("user");
        if (userCookie) {
            const parsedUser = JSON.parse(userCookie);
            if (parsedUser.id) {
                setCurrentUserId(parsedUser.id);

                async function fetchIsAdmin() {
                    const query = supabaseClient
                        .from("Users")
                        .select("admin")
                        .eq("id", parsedUser.id);
                    const { data, error } = await query.single();
                    if (error) {
                        console.error("Error fetching user:", error);
                    }
                    if (data) {
                        setIsAdmin(data.admin);
                    }
                }
                fetchIsAdmin();
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

    const fetchBookedDates = async () => {
        if (itemId) {
            const { data, error } = await supabaseClient
                .from("Rentals")
                .select("start_date, end_date")
                .eq("item_id", itemId);

            if (error) {
                console.error("Error fetching booked dates:", error);
                return;
            }

            const dates = data.flatMap(({ start_date, end_date }) => {
                const startDate = new Date(start_date);
                const endDate = new Date(end_date);
                const datesArray = [];
                for (
                    let date = startDate;
                    date <= endDate;
                    date.setDate(date.getDate() + 1)
                ) {
                    datesArray.push(new Date(date));
                }
                return datesArray;
            });

            setBookedDates(dates);
        }
    };

    useEffect(() => {
        fetchBookedDates();
    }, [itemId]);

    const handleBooking = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            alert("Velg en gyldig leieperiode");
            return;
        }

        const today = new Date();
        if (dateRange.from < today || dateRange.to < today) {
            alert("Du kan ikke leie et objekt bakover i tid.");
            return;
        }

        const overlappingDates = bookedDates.some(
            (date) =>
                (dateRange.from &&
                    dateRange.to &&
                    date >= dateRange.from &&
                    date <= dateRange.to) ||
                (dateRange.from &&
                    dateRange.from >= date &&
                    dateRange.from <= date)
        );

        if (overlappingDates) {
            alert(
                "Den valgte perioden overlapper med en eksisterende booking."
            );
            return;
        }

        const userCookie = Cookies.get("user");
        if (!userCookie || userCookie.length === 0) {
            console.error("User not logged in");
            return;
        }

        const renterId = JSON.parse(userCookie).id;

        const { error } = await supabaseClient.from("Rentals").insert([
            {
                item_id: itemId,
                renter_id: renterId,
                start_date: dateRange.from,
                end_date: dateRange.to,
            },
        ]);

        if (error) {
            console.error("Error booking item:", error);
            return;
        }

        alert("Leie forespørsel sendt!");
        setDateRange({ from: undefined, to: undefined });
        fetchBookedDates();
    };

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

    // Function to navigate to messages page with owner ID
    const handleMessageOwner = () => {
        if (!currentUserId) {
            alert("Du må være logget inn for å sende meldinger");
            return;
        }

        if (isOwner) {
            alert("Du kan ikke sende melding til deg selv");
            return;
        }

        // Navigate to messages page with owner ID as a parameter
        navigate(`/messages?receiverId=${item.owner_id}&itemId=${item.id}`);
    };

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
                        {images.length > 1 && (
                            <>
                                <CarouselPrevious />
                                <CarouselNext />
                            </>
                        )}
                    </Carousel>
                    <h1 className="text-3xl font-bold break-words max-w-full whitespace-pre-wrap">
                        {item.title}
                    </h1>
                    <p className="text-xl break-words max-w-full whitespace-pre-wrap">
                        {item.description}
                    </p>
                    <p className="text-lg text-gray-700">
                        <strong>Kategori:</strong> {item.category}
                    </p>
                    <p className="text-lg text-gray-700">
                        <strong>Lokasjon:</strong> {item.location}
                    </p>
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
                        <>
                            <div className="flex flex-col gap-4">
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
                                            numberOfMonths={1}
                                            disabled={bookedDates}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <div className="flex gap-4">
                                    <Button
                                        onClick={handleBooking}
                                        className="flex-1"
                                    >
                                        Send forespørsel
                                    </Button>
                                    <Button
                                        onClick={handleMessageOwner}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <MessageCircle size={18} />
                                        Kontakt utleier
                                    </Button>
                                </div>
                                {isAdmin ? ( // Hvis admin
                                    <Button
                                        variant="destructive"
                                        onClick={deleteAd}
                                    >
                                        Slett annonse
                                    </Button>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemInfo;
