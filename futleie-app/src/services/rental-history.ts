import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";

export type RentalHistoryItem = {
    id: number;
    title: string;
    address: string; // This will be constructed from item location
    username: string; // This will be constructed from item
    period: string; // This will be constructed from start_date and end_date
    rating: number | null;
    isRated: boolean;
    isPast: boolean; // Whether the rental period has ended
    item_id: number;
    renter_id: number;
    original_item?: Item;
    end_date: string; // Raw end date for calculations
};

/**
 * Fetches rental history for a user
 * @param userId The ID of the user
 * @param pastOnly If true, only returns rentals that have ended (past rentals)
 * @returns Object containing items rented by the user and items rented out by the user
 */
export const fetchRentalHistory = async (
    userId: number,
    pastOnly: boolean = false
) => {
    try {
        // Get current date in ISO format
        const currentDate = new Date().toISOString().split("T")[0];

        // Query for items rented BY the user (where user is the renter)
        let rentedByUserQuery = supabaseClient
            .from("Rentals")
            .select(
                `
        *,
        Items(*, Users(*))
      `
            )
            .eq("renter_id", userId);

        // Query for items rented OUT by the user (where user is the owner of the item)
        let rentedOutByUserQuery = supabaseClient
            .from("Rentals")
            .select(
                `
        *,
        Items!inner(*),
        Users(*)
      `
            )
            .eq("Items.owner_id", userId);

        // Add filter for past rentals if needed
        if (pastOnly) {
            rentedByUserQuery = rentedByUserQuery.lt("end_date", currentDate);
            rentedOutByUserQuery = rentedOutByUserQuery.lt(
                "end_date",
                currentDate
            );
        }

        // Execute both queries in parallel
        const [rentedByUserResult, rentedOutByUserResult] = await Promise.all([
            rentedByUserQuery,
            rentedOutByUserQuery,
        ]);

        // Handle errors
        if (rentedByUserResult.error) {
            console.error(
                "Error fetching rentals by user:",
                rentedByUserResult.error
            );
            throw new Error(rentedByUserResult.error.message);
        }

        if (rentedOutByUserResult.error) {
            console.error(
                "Error fetching rentals out by user:",
                rentedOutByUserResult.error
            );
            throw new Error(rentedOutByUserResult.error.message);
        }

        // Format the data into the expected format
        const leidItems = formatRentedItems(rentedByUserResult.data || []);
        const leidUtItems = formatRentedOutItems(
            rentedOutByUserResult.data || []
        );

        return { leidItems, leidUtItems };
    } catch (error) {
        console.error("Error in fetchRentalHistory:", error);
        return { leidItems: [], leidUtItems: [] };
    }
};

/**
 * Format items rented by the user
 */
const formatRentedItems = (rentals: any[]): RentalHistoryItem[] => {
    const currentDate = new Date().toISOString().split("T")[0];

    return rentals.map((rental) => {
        const item = rental.Items;
        const endDate = rental.end_date;
        const isPast = endDate < currentDate;

        return {
            id: rental.id,
            title: item.title,
            address: item.location || "Ukjent adresse",
            username: item.Users.username,
            period: formatDatePeriod(rental.start_date, rental.end_date),
            rating: rental.rating,
            isRated: rental.rating !== null,
            isPast: isPast,
            item_id: rental.item_id,
            renter_id: rental.renter_id,
            original_item: item,
            end_date: endDate,
        };
    });
};

/**
 * Format items rented out by the user
 */
const formatRentedOutItems = (rentals: any[]): RentalHistoryItem[] => {
    const currentDate = new Date().toISOString().split("T")[0];

    return rentals.map((rental) => {
        const item = rental.Items;
        const endDate = rental.end_date;
        const isPast = endDate < currentDate;

        return {
            id: rental.id,
            title: item.title,
            address: item.location || "Ukjent adresse",
            username: rental.Users.username,
            period: formatDatePeriod(rental.start_date, rental.end_date),
            rating: rental.rating,
            isRated: rental.rating !== null,
            isPast: isPast,
            item_id: rental.item_id,
            renter_id: rental.renter_id,
            original_item: item,
            end_date: endDate,
        };
    });
};

/**
 * Format date period string
 */
const formatDatePeriod = (startDate: string, endDate: string): string => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("no-NO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Update rating for a rental
 */
export const updateRentalRating = async (rentalId: number, rating: number) => {
    try {
        const { data, error } = await supabaseClient
            .from("Rentals")
            .update({ rating: rating })
            .eq("id", rentalId);

        if (error) {
            console.error("Error updating rental rating:", error);
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error("Error in updateRentalRating:", error);
        throw error;
    }
};
