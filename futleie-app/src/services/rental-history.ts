import supabaseClient from "@/supabaseClient";
import { Item } from "@/Types/Item";

export type RentalHistoryItem = {
  id: number;
  title: string;
  address: string; // This will be constructed from item location
  period: string; // This will be constructed from start_date and end_date
  rating: number | null;
  isRated: boolean;
  isPast: boolean; // Whether the rental period has ended
  item_id: number;
  rental_id: number;
  original_item?: Item;
  end_date: string; // Raw end date for calculations
};

/**
 * Fetches rental history for a user
 * @param userId The ID of the user
 * @param pastOnly If true, only returns rentals that have ended (past rentals)
 * @returns Object containing items rented by the user and items rented out by the user
 */
export const fetchRentalHistory = async (userId: number, pastOnly: boolean = false) => {
  try {
    // Get current date in ISO format
    const currentDate = new Date().toISOString().split('T')[0];
    
    // PLACEHOLDER DATA: Items rented by the user
    const rentedByUser = [
      {
        id: 1,
        start_date: '2025-02-01',
        end_date: '2025-02-15',
        item_id: 101,
        rating: 4,
        Items: {
          id: 101,
          title: 'Fin leilighet i sentrum',
          description: 'Moderne leilighet med god beliggenhet',
          owner_id: 2,
          category: 'Leilighet',
          location: 'Oslo, Grünerløkka'
        }
      },
      {
        id: 2,
        start_date: '2025-03-10',
        end_date: '2025-03-20',
        item_id: 102,
        rating: null,
        Items: {
          id: 102,
          title: 'Hytte ved sjøen',
          description: 'Koselig hytte med sjøutsikt',
          owner_id: 3,
          category: 'Hytte',
          location: 'Bergen, Askøy'
        }
      },
      {
        id: 3,
        start_date: '2025-01-05',
        end_date: '2025-01-10',
        item_id: 103,
        rating: 5,
        Items: {
          id: 103,
          title: 'Enebolig med hage',
          description: 'Stor enebolig med fin hage',
          owner_id: 4,
          category: 'Hus',
          location: 'Trondheim, Byåsen'
        }
      }
    ];
    
    // PLACEHOLDER DATA: Items rented out by the user
    const rentedOutByUser = [
      {
        id: 4,
        start_date: '2025-02-05',
        end_date: '2025-02-12',
        item_id: 201,
        rating: 5,
        renter_id: 5,
        Items: {
          id: 201,
          title: 'Moderne leilighet',
          description: 'Nyoppusset leilighet i sentrum',
          owner_id: userId,
          category: 'Leilighet',
          location: 'Oslo, Frogner'
        }
      },
      {
        id: 5,
        start_date: '2025-03-15',
        end_date: '2025-03-30',
        item_id: 202,
        rating: null,
        renter_id: 6,
        Items: {
          id: 202,
          title: 'Koselig hytte',
          description: 'Hytte ved fjellet',
          owner_id: userId,
          category: 'Hytte',
          location: 'Lillehammer, Hafjell'
        }
      }
    ];
    
    // Filter by past only if needed
    const filteredRentedByUser = pastOnly 
      ? rentedByUser.filter(rental => rental.end_date < currentDate)
      : rentedByUser;
      
    const filteredRentedOutByUser = pastOnly
      ? rentedOutByUser.filter(rental => rental.end_date < currentDate)
      : rentedOutByUser;

    // Format the data into the expected format
    const leidItems = formatRentedItems(filteredRentedByUser);
    const leidUtItems = formatRentedOutItems(filteredRentedOutByUser);

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
  const currentDate = new Date().toISOString().split('T')[0];
  
  return rentals.map(rental => {
    const item = rental.Items;
    const endDate = rental.end_date;
    const isPast = endDate < currentDate;
    
    return {
      id: rental.id,
      title: item.title,
      address: item.location || "Ukjent adresse",
      period: formatDatePeriod(rental.start_date, rental.end_date),
      rating: rental.rating,
      isRated: rental.rating !== null,
      isPast: isPast,
      item_id: rental.item_id,
      rental_id: rental.id,
      original_item: item,
      end_date: endDate
    };
  });
};

/**
 * Format items rented out by the user
 */
const formatRentedOutItems = (rentals: any[]): RentalHistoryItem[] => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return rentals.map(rental => {
    const item = rental.Items;
    const endDate = rental.end_date;
    const isPast = endDate < currentDate;
    
    return {
      id: rental.id,
      title: item.title,
      address: item.location || "Ukjent adresse",
      period: formatDatePeriod(rental.start_date, rental.end_date),
      rating: rental.rating,
      isRated: rental.rating !== null,
      isPast: isPast,
      item_id: rental.item_id,
      rental_id: rental.id,
      original_item: item,
      end_date: endDate
    };
  });
};

/**
 * Format date period string
 */
const formatDatePeriod = (startDate: string, endDate: string): string => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Update rating for a rental
 */
export const updateRentalRating = async (rentalId: number, rating: number) => {
  // Just return success for the placeholder implementation
  console.log(`Rating updated for rental ${rentalId}: ${rating} stars`);
  return [{ id: rentalId, rating }];
};
