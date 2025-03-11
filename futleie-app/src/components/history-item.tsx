import {
    RentalHistoryItem,
    updateRentalRating,
} from "@/services/rental-history";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Star } from "lucide-react";
import { useState } from "react";
import supabaseClient from "@/supabaseClient";

const HistoryItem = ({
    item,
    type,
}: {
    item: RentalHistoryItem;
    type: "leid" | "leidUt";
}) => {
    const [rating, setRating] = useState<number | null>(item.rating);
    const [isRated, setIsRated] = useState<boolean>(item.isRated);
    // Function to handle temporary rating selection (before submission)
    const handleRatingSelection = (newRating: number) => {
        setRating(newRating);
    };

    // Function to submit the final rating
    const handleRatingSubmit = async () => {
        try {
            if (!item || rating === null) return;
            if (isRated) return;

            console.log(
                `Submitting rating ${item.rating} for rental ID ${item.id}`
            );

            let ratedUserId: number;
            if (type === "leid") {
                // Når vi har leid rater vi eieren
                const { data, error } = await supabaseClient
                    .from("Items")
                    .select()
                    .eq("id", item.item_id)
                    .single();
                if (error) {
                    console.error("Error fetching item data:", error);
                    return;
                }
                ratedUserId = data.owner_id;
                console.log(`Rating owner (ID: ${ratedUserId}) of item`);
            } else {
                // Når vi er utleier, rater vi leietaker
                ratedUserId = item.renter_id;
                console.log(`Rating renter (ID: ${ratedUserId}) of item`);
            }

            await updateRentalRating(item.id, rating);

            const { data, error } = await supabaseClient
                .from("Users")
                .select("tot_rating, rating_counter")
                .eq("id", ratedUserId)
                .single();

            if (error) {
                console.error("Error fetching user data:", error);
                return;
            }
            const newRating = data.tot_rating + rating;
            const newRatingCount = data.rating_counter + 1;

            await supabaseClient
                .from("Users")
                .update({
                    tot_rating: newRating,
                    rating_counter: newRatingCount,
                })
                .eq("id", ratedUserId);

            // Oppdater status slik at historikk-siden har tilgang til den nye vurderingen
            setIsRated(true);
            item.isRated = true;
            item.rating = rating;

            console.log(
                `Successfully submitted rating for ${type} item ${item.item_id}`
            );
        } catch (err) {
            console.error("Error submitting rating:", err);
        }
    };

    return (
        <Card className="mb-4 w-full h-64 flex flex-col overflow-hidden border-[#FEDEC7]">
            <CardHeader className="flex-shrink-0 pb-2">
                <CardTitle className="text-lg truncate">{item.title}</CardTitle>
                <CardDescription className="truncate">
                    {item.username}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between py-2">
                <div>
                    <p className="text-sm font-medium">Periode:</p>
                    <p className="text-sm text-muted-foreground">
                        {item.period}
                    </p>
                </div>
                <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Vurdering:</p>
                    {!item.isRated && (
                        <p className="text-xs text-muted-foreground mb-1">
                            Ikke vurdert ennå
                        </p>
                    )}
                    <div className="w-full overflow-hidden">
                        <StarRating
                            rating={rating}
                            itemId={item.id}
                            type={type}
                            isRated={isRated}
                            isPast={item.isPast}
                            onRatingChange={handleRatingSelection}
                            onRatingSubmit={handleRatingSubmit}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const StarRating = ({
    rating,
    itemId,
    type,
    isRated,
    isPast,
    onRatingChange,
    onRatingSubmit,
}: {
    rating: number | null;
    itemId: number;
    type: "leid" | "leidUt";
    isRated: boolean;
    isPast: boolean;
    onRatingChange: (
        itemId: number,
        type: "leid" | "leidUt",
        newRating: number
    ) => void;
    onRatingSubmit: (itemId: number, type: "leid" | "leidUt") => void;
}) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    if (!isPast) {
        return (
            <div>
                <div className="flex flex-shrink-0">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={18}
                            className="text-gray-300 mr-1"
                        />
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Kan vurderes etter utleieperioden
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center">
            <div className="flex flex-shrink-0">
                {[...Array(5)].map((_, i) => {
                    const starValue = i + 1;
                    const isFilled = isRated
                        ? rating !== null && starValue <= rating
                        : hoverRating !== null
                        ? starValue <= hoverRating
                        : rating !== null && starValue <= rating;

                    return (
                        <Star
                            key={i}
                            size={18}
                            className={`transition-colors ${
                                isRated ? "" : "cursor-pointer"
                            } ${
                                isFilled
                                    ? "text-primary fill-primary"
                                    : "text-gray-300"
                            } mr-1`}
                            onMouseEnter={() =>
                                !isRated && setHoverRating(starValue)
                            }
                            onMouseLeave={() =>
                                !isRated && setHoverRating(null)
                            }
                            onClick={() =>
                                !isRated &&
                                onRatingChange(itemId, type, starValue)
                            }
                            role={isRated ? undefined : "button"}
                            aria-label={
                                isRated
                                    ? `Rated ${starValue} of 5 stars`
                                    : `Rate ${starValue} of 5 stars`
                            }
                        />
                    );
                })}
            </div>

            {!isRated && (
                <Button
                    size="sm"
                    disabled={rating === null}
                    onClick={(e) => {
                        e.preventDefault();
                        if (rating !== null) {
                            onRatingSubmit(itemId, type);
                        }
                    }}
                    className="ml-2 h-7 text-xs px-2 flex-shrink-0"
                    type="button"
                >
                    Send
                </Button>
            )}

            {isRated && (
                <span className="text-xs text-primary font-medium ml-2 flex-shrink-0">
                    Vurdering sendt
                </span>
            )}
        </div>
    );
};

export default HistoryItem;
