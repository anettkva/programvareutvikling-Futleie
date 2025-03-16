"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    fetchRentalHistory,
    RentalHistoryItem,
} from "@/services/rental-history";
import Cookies from "js-cookie";
import HistoryItem from "@/components/history-item";

// We're using the RentalHistoryItem type from rental-history.ts

const Historikk: React.FC = () => {
    // Tab state
    const [activeTab, setActiveTab] = useState<"leid" | "leidUt">("leid");

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
            const { leidItems: rentedItems, leidUtItems: rentedOutItems } =
                await fetchRentalHistory(userId, showPastOnly);

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

    return (
        <div className="flex flex-col p-6">
            <h1 className="text-3xl font-bold mb-6">Historikk</h1>

            {/* Tab buttons */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <Button
                        variant={activeTab === "leid" ? "default" : "outline"}
                        onClick={() => setActiveTab("leid")}
                    >
                        Leid
                    </Button>
                    <Button
                        variant={activeTab === "leidUt" ? "default" : "outline"}
                        onClick={() => setActiveTab("leidUt")}
                    >
                        Leid ut
                    </Button>
                </div>

                {/* Past/All toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        Vis kun tidligre
                    </span>
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
                        <div
                            className={`w-11 h-6 rounded-full peer ${
                                showPastOnly ? "bg-primary" : "bg-gray-200"
                            } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
                        ></div>
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
            {!loading && !error && activeTab === "leid" && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Ting du har leid
                    </h2>
                    {leidItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {leidItems.map((item) => (
                                <HistoryItem
                                    key={item.id}
                                    item={item}
                                    type="leid"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">
                            Du har ikke leid noen ting ennå.
                        </p>
                    )}
                </div>
            )}

            {!loading && !error && activeTab === "leidUt" && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Ting du har leid ut
                    </h2>
                    {leidUtItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {leidUtItems.map((item) => (
                                <HistoryItem
                                    key={item.id}
                                    item={item}
                                    type="leidUt"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">
                            Du har ikke leid ut noen ting ennå.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Historikk;
