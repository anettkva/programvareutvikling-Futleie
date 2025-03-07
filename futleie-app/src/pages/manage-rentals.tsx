import React, { useState, useEffect } from "react";
import supabaseClient from "@/supabaseClient";
import { Rental } from "@/Types/Rental";
import { Item } from "@/Types/Item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Cookies from "js-cookie";

interface RentalWithItem extends Rental {
    item_title?: string;
    item_location?: string;
    renter_name?: string;
}

const ManageRentals: React.FC = () => {
    const [rentals, setRentals] = useState<RentalWithItem[]>([]);
    const [requests, setRequests] = useState<RentalWithItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'declined'>('pending');

    useEffect(() => {
        const fetchRentalsAndRequests = async () => {
            try {
                setLoading(true);
                const userCookie = Cookies.get("user");
                if (!userCookie || userCookie.length === 0) {
                    setError("Du må være logget inn for å se utleieforespørsler");
                    setLoading(false);
                    return;
                }

                const userData = JSON.parse(userCookie);
                const userId = userData.id;
                setUserId(userId);

                // Fetch rentals where user is the renter, including item details
                const { data: rentalData, error: rentalError } = await supabaseClient
                    .from("Rentals")
                    .select("*, Items(*)")
                    .eq("renter_id", userId);

                // Fetch all rentals for items owned by the user, including item details and renter information
                const { data: requestData, error: requestError } = await supabaseClient
                    .from("Rentals")
                    .select("*, Items(*), Users!Rentals_renter_id_fkey(*)")
                    .not('Items', 'is', null);

                if (rentalError || requestError) {
                    setError("Error fetching rentals or requests");
                    console.error(rentalError || requestError);
                } else {
                    // Process rental data to include item title and location
                    const processedRentals = (rentalData || []).map(rental => ({
                        ...rental,
                        item_title: rental.Items?.title || 'Ukjent gjenstand',
                        item_location: rental.Items?.location || 'Ukjent adresse'
                    }));
                    
                    setRentals(processedRentals);
                    
                    // Filter and process requests to only include those for items owned by the user
                    const filteredRequests = (requestData || [])
                        .filter(request => request.Items && request.Items.owner_id === userId)
                        .map(request => ({
                            ...request,
                            item_title: request.Items?.title || 'Ukjent gjenstand',
                            item_location: request.Items?.location || 'Ukjent adresse',
                            renter_name: request.Users?.username || `Bruker #${request.renter_id}`
                        }));
                        
                    setRequests(filteredRequests);
                }
            } catch (err) {
                console.error("Error fetching rentals or requests:", err);
                setError("Error fetching rentals or requests");
            } finally {
                setLoading(false);
            }
        };

        fetchRentalsAndRequests();
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
                setRequests((prevRequests) =>
                    prevRequests.filter((request) => request.id !== rentalId)
                );
            }
        } catch (err) {
            console.error("Error updating rental status:", err);
            setError("Error updating rental status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "accepted":
                return "text-green-500";
            case "declined":
                return "text-red-500";
            case "pending":
                return "text-yellow-500";
            default:
                return "";
        }
    };

    if (loading) {
        return (
            <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
                <p>Laster utleieforespørsler...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const filteredRentals = rentals.filter(rental => rental.status === activeTab);
    const filteredRequests = requests.filter(request => request.status === activeTab);

    return (
        <div className="w-full h-[calc(100vh-4rem)]">
            <div className="flex flex-col h-full gap-6 px-5 py-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Administrer utleieforespørsler</h1>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                        <Button 
                            variant={activeTab === 'pending' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('pending')}
                        >
                            Ventende
                        </Button>
                        <Button
                            variant={activeTab === 'accepted' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('accepted')}
                        >
                            Godtatt
                        </Button>
                        <Button
                            variant={activeTab === 'declined' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('declined')}
                        >
                            Avslått
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <h2 className="text-2xl font-bold">Dine forespørsler</h2>
                    {filteredRentals.length === 0 ? (
                        <div className="flex items-center justify-center h-[calc(30vh-4rem)]">
                            <p className="text-gray-500">Ingen utleieforespørsler</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRentals.map((rental) => (
                                <Card key={rental.id} className="mb-4 w-full h-64 flex flex-col overflow-hidden border-[#FEDEC7]">
                                    <CardHeader className="flex-shrink-0 pb-2">
                                        <CardTitle className="text-lg truncate">{rental.item_title}</CardTitle>
                                        <CardDescription className="truncate">{rental.item_location}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow flex flex-col justify-between py-2">
                                        <div>
                                            <p className="text-sm font-medium">Periode:</p>
                                            <p className="text-sm text-muted-foreground">{new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm font-medium">Status:</p>
                                            <p className={`text-sm ${getStatusColor(rental.status)}`}>
                                                {rental.status === 'accepted' ? 'Godtatt' : 
                                                 rental.status === 'declined' ? 'Avslått' : 'Ventende'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                    <h2 className="text-2xl font-bold mt-6">Forespørsler for dine gjenstander</h2>
                    {filteredRequests.length === 0 ? (
                        <div className="flex items-center justify-center h-[calc(30vh-4rem)]">
                            <p className="text-gray-500">Ingen ventende forespørsler</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRequests.map((request) => (
                                <Card key={request.id} className="mb-4 w-full h-64 flex flex-col overflow-hidden border-[#FEDEC7]">
                                    <CardHeader className="flex-shrink-0 pb-2">
                                        <CardTitle className="text-lg truncate">{request.item_title}</CardTitle>
                                        <CardDescription className="truncate">{request.item_location}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow flex flex-col justify-between py-2">
                                        <div>
                                            <p className="text-sm font-medium">Leietaker:</p>
                                            <p className="text-sm text-muted-foreground">{request.renter_name}</p>
                                            <p className="text-sm font-medium mt-2">Periode:</p>
                                            <p className="text-sm text-muted-foreground">{new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="mt-2">
                                            {activeTab === 'pending' ? (
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => handleUpdateStatus(request.id, "accepted")}>
                                                        Godta
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(request.id, "declined")}>
                                                        Avslå
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm font-medium">Status:</p>
                                                    <p className={`text-sm ${getStatusColor(request.status)}`}>
                                                        {request.status === 'accepted' ? 'Godtatt' : 'Avslått'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageRentals;