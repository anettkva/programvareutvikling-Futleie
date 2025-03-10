"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { fetchRentalHistory, updateRentalRating, RentalHistoryItem } from "@/services/rental-history";
import Cookies from "js-cookie";

// We're using the RentalHistoryItem type from rental-history.ts

const Historikk: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'leid' | 'leidUt'>('leid');
  
  // Filter state
  const [showPastOnly, setShowPastOnly] = useState<boolean>(false);
  
  // State for rental history items
  const [leidItems, setLeidItems] = useState<RentalHistoryItem[]>([]);
  const [leidUtItems, setLeidUtItems] = useState<RentalHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch rental history data when component mounts
  // Define fetchData outside useEffect so we can call it from debug button
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get the current user ID from the cookie
      const userCookie = Cookies.get("user");
      if (!userCookie || userCookie.length === 0) {
        setError("Du må være logget inn for å se utleiehistorikk");
        setLoading(false);
        return;
      }
      
      const userData = JSON.parse(userCookie);
      const userId = userData.id;
      
      // Log user data for debugging
      console.log("=== HISTORIKK USER DATA ====");
      console.log("User cookie data:", userData);
      console.log("User ID:", userId);
      console.log("Show past only:", showPastOnly);
      console.log("===========================");
      
      // Fetch rental history from the database
      const { leidItems: rentedItems, leidUtItems: rentedOutItems } = await fetchRentalHistory(userId, showPastOnly);
      
      // Log received data for debugging
      console.log("=== HISTORIKK RECEIVED DATA ====");
      console.log("Items rented BY user (received):", rentedItems);
      console.log("Items rented OUT by user (received):", rentedOutItems);
      console.log("=================================");
      
      setLeidItems(rentedItems);
      setLeidUtItems(rentedOutItems);
      setError(null);
    } catch (err) {
      console.error("Error fetching rental history:", err);
      setError("Det oppstod en feil ved henting av utleiehistorikk");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [showPastOnly]);
  
  // Function to handle temporary rating selection (before submission)
  const handleRatingSelection = (itemId: number, type: 'leid' | 'leidUt', newRating: number) => {
    if (type === 'leid') {
      setLeidItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId && !item.isRated ? { ...item, rating: newRating } : item
        )
      );
    } else {
      setLeidUtItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId && !item.isRated ? { ...item, rating: newRating } : item
        )
      );
    }
  };
  
  // Function to submit the final rating
  const handleRatingSubmit = async (itemId: number, type: 'leid' | 'leidUt') => {
    try {
      // Find the item to get the rental ID and rating
      const items = type === 'leid' ? leidItems : leidUtItems;
      const item = items.find(item => item.id === itemId);
      
      if (!item || item.rating === null) return;
      
      console.log(`Submitting rating ${item.rating} for rental ID ${item.rental_id}`);
      
      // Update the rating in the database
      await updateRentalRating(item.rental_id, item.rating);
      
      // Immediately update the local state to show "Vurdering sendt"
      if (type === 'leid') {
        setLeidItems(prevItems => 
          prevItems.map(i => 
            i.id === itemId ? { ...i, isRated: true } : i
          )
        );
      } else {
        setLeidUtItems(prevItems => 
          prevItems.map(i => 
            i.id === itemId ? { ...i, isRated: true } : i
          )
        );
      }
      
      console.log(`Successfully submitted rating for ${type} item ${itemId}`);
    } catch (err) {
      console.error("Error submitting rating:", err);
      // You might want to show an error message to the user here
    }
  };

  // Interactive star rating component with submit button
  const StarRating = ({ 
    rating, 
    itemId, 
    type, 
    isRated,
    isPast,
    onRatingChange, 
    onRatingSubmit 
  }: { 
    rating: number | null, 
    itemId: number, 
    type: 'leid' | 'leidUt',
    isRated: boolean,
    isPast: boolean,
    onRatingChange: (itemId: number, type: 'leid' | 'leidUt', newRating: number) => void,
    onRatingSubmit: (itemId: number, type: 'leid' | 'leidUt') => void 
  }) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    
    // If it's a future rental, show message and disable rating
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
          <p className="text-xs text-muted-foreground mt-1">Kan vurderes etter utleieperioden</p>
        </div>
      );
    }
    
    return (
      <div className="flex flex-wrap items-center">
        <div className="flex flex-shrink-0">
          {[...Array(5)].map((_, i) => {
            const starValue = i + 1;
            const isFilled = isRated ? (rating !== null && starValue <= rating) :
              hoverRating !== null 
                ? starValue <= hoverRating 
                : (rating !== null && starValue <= rating);
              
            return (
              <Star
                key={i}
                size={18}
                className={`transition-colors ${isRated ? '' : 'cursor-pointer'} ${isFilled ? "text-primary fill-primary" : "text-gray-300"} mr-1`}
                onMouseEnter={() => !isRated && setHoverRating(starValue)}
                onMouseLeave={() => !isRated && setHoverRating(null)}
                onClick={() => !isRated && onRatingChange(itemId, type, starValue)}
                role={isRated ? undefined : "button"}
                aria-label={isRated ? `Rated ${starValue} of 5 stars` : `Rate ${starValue} of 5 stars`}
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
          <span className="text-xs text-primary font-medium ml-2 flex-shrink-0">Vurdering sendt</span>
        )}
      </div>
    );
  };

  const HistoryItem = ({ item, type }: { item: RentalHistoryItem, type: 'leid' | 'leidUt' }) => (
    <Card className="mb-4 w-full h-64 flex flex-col overflow-hidden border-[#FEDEC7]">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-lg truncate">{item.title}</CardTitle>
        <CardDescription className="truncate">{item.address}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between py-2">
        <div>
          <p className="text-sm font-medium">Periode:</p>
          <p className="text-sm text-muted-foreground">{item.period}</p>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Vurdering:</p>
          {!item.isRated && (
            <p className="text-xs text-muted-foreground mb-1">Ikke vurdert ennå</p>
          )}
          <div className="w-full overflow-hidden">
            <StarRating 
              rating={item.rating} 
              itemId={item.id} 
              type={type} 
              isRated={item.isRated}
              isPast={item.isPast}
              onRatingChange={handleRatingSelection} 
              onRatingSubmit={handleRatingSubmit}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col p-6">
      <h1 className="text-3xl font-bold mb-6">Historikk</h1>
      
      {/* Tab buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
        <Button 
          variant={activeTab === 'leid' ? 'default' : 'outline'}
          onClick={() => setActiveTab('leid')}
        >
          Leid
        </Button>
        <Button 
          variant={activeTab === 'leidUt' ? 'default' : 'outline'}
          onClick={() => setActiveTab('leidUt')}
        >
          Leid ut
        </Button>
        </div>
        
        {/* Past/All toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Vis kun tidligere</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={showPastOnly}
              onChange={() => {
                setLoading(true);
                setShowPastOnly(!showPastOnly);
              }}
            />
            <div className={`w-11 h-6 rounded-full peer ${showPastOnly ? 'bg-primary' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Laster historikk...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex justify-center items-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      {/* Tab content - only show when not loading and no errors */}
      {!loading && !error && activeTab === 'leid' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Ting du har leid</h2>
          {leidItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leidItems.map(item => (
                <HistoryItem key={item.id} item={item} type="leid" />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Du har ikke leid noen ting ennå.</p>
          )}
        </div>
      )}
      
      {!loading && !error && activeTab === 'leidUt' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Ting du har leid ut</h2>
          {leidUtItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leidUtItems.map(item => (
                <HistoryItem key={item.id} item={item} type="leidUt" />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Du har ikke leid ut noen ting ennå.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Historikk;
