import React, { useState, useEffect } from "react";
import supabaseClient from "@/supabaseClient";
import { Rental } from "@/Types/Rental";

const ManageRentals: React.FC = () => {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabaseClient
                    .from("Rentals")
                    .select("*")
                    .eq("status", "pending");

                if (error) {
                    setError("Error fetching rentals");
                    console.error(error);
                } else {
                    setRentals(data);
                }
            } catch (err) {
                console.error("Error fetching rentals:", err);
                setError("Error fetching rentals");
            } finally {
                setLoading(false);
            }
        };

        fetchRentals();
    }, []);

    const handleUpdateStatus = async (rentalId: number, status: "accepted" | "declined") => {
        try {
            const { error } = await supabaseClient
                .from("Rentals")
                .update({ status })
                .eq("id", rentalId);

            if (error) {
                console.error("Error updating rental status:", error);
                setError("Error updating rental status");
            } else {
                setRentals((prevRentals) =>
                    prevRentals.filter((rental) => rental.id !== rentalId)
                );
            }
        } catch (err) {
            console.error("Error updating rental status:", err);
            setError("Error updating rental status");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Manage Rentals</h1>
            {rentals.length === 0 ? (
                <p>No pending rentals</p>
            ) : (
                <ul>
                    {rentals.map((rental) => (
                        <li key={rental.id}>
                            <p>Rental ID: {rental.id}</p>
                            <p>Item ID: {rental.item_id}</p>
                            <p>Renter ID: {rental.renter_id}</p>
                            <p>Start Date: {rental.start_date.toString()}</p>
                            <p>End Date: {rental.end_date.toString()}</p>
                            <button onClick={() => handleUpdateStatus(rental.id, "accepted")}>
                                Accept
                            </button>
                            <button onClick={() => handleUpdateStatus(rental.id, "declined")}>
                                Decline
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManageRentals;