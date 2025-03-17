"use client";

import React, { useState, useEffect } from "react";
import { Chat } from "@/components/chat";
import {
    fetchMessagedUsers,
    fetchMessagesBetweenUsers,
    formatMessages,
    sendMessage,
} from "@/services/messages";
import { ChatMessage } from "@/Types/chat-message";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import supabaseClient from "@/supabaseClient";

interface UserChat {
    id: number;
    username: string;
    messages: ChatMessage[];
    isActive?: boolean;
}

/**
 *
 * @component Messages
 *
 * @description En meldingsside-komponent som viser brukerens samtaler med andre brukere.
 *
 * Denne komponenten håndterer:
 * - Visning av meldinger mellom innlogget bruker og andre brukere
 * - Initiering av nye samtaler, spesielt fra annonser
 * - Lasting av meldingsdata fra backend
 *
 *
 * @state {UserChat[]} userChats - Liste over aktive samtaler med andre brukere
 * @state {boolean} loading - Indikerer om data lastes inn
 * @state {string | null} error - Feilmelding hvis noe gikk galt
 * @state {number | null} currentUserId - ID-en til den innloggede brukeren
 * @state {boolean} messageSent - Flag som indikerer om en melding har blitt sendt
 *
 * @example
 * ```tsx
 * <Messages />
 * ```
 *
 * @returns {JSX.Element} En meldingsside som viser enten lastestatus, feilmelding,
 *                         brukermeldinger, eller en melding om at ingen samtaler finnes
 */
const Messages: React.FC = () => {
    const [userChats, setUserChats] = useState<UserChat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [messageSent, setMessageSent] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Hent URL-parametere
    const searchParams = new URLSearchParams(location.search);
    const receiverId = searchParams.get("receiverId");
    const itemId = searchParams.get("itemId");

    // Funksjon for å starte en samtale fra en annonse
    const handleStartConversationFromAd = async (
        userId: number,
        receiverId: number,
        itemId: string
    ) => {
        try {
            console.log(
                `Starting conversation from ad: user ${userId} to receiver ${receiverId} about item ${itemId}`
            );

            // Hent informasjon om Item
            const { data: itemData, error: itemError } = await supabaseClient
                .from("Items")
                .select("title")
                .eq("id", itemId)
                .single();

            if (itemError) {
                console.error("Error fetching item:", itemError);
                return;
            }

            // Hent informasjon om mottaker
            const { data: receiverData, error: receiverError } =
                await supabaseClient
                    .from("Users")
                    .select("username")
                    .eq("id", receiverId)
                    .single();

            if (receiverError) {
                console.error("Error fetching receiver:", receiverError);
                return;
            }

            // Sjekk om det allerede finnes meldinger mellom brukerne
            let existingMessages = await fetchMessagesBetweenUsers(
                userId,
                receiverId
            );

            // Bare send en initiell melding hvis det ikke allerede finnes meldinger
            if (existingMessages.length === 0) {
                // Send en initiell melding
                const initialMessage = `Hei! Jeg tar kontakt angående annonsen din "${itemData.title}".`;
                await sendMessage(userId, receiverId, initialMessage);

                // Hent meldinger på nytt
                existingMessages = await fetchMessagesBetweenUsers(
                    userId,
                    receiverId
                );
            }

            // Fjern url-parametere
            navigate("/messages", { replace: true });

            // Formater meldingene for UI
            const formattedMessages = formatMessages(existingMessages, userId);

            const newChat: UserChat = {
                id: receiverId,
                username: receiverData.username,
                messages: formattedMessages,
                isActive: true,
            };

            console.log("New chat to be added:", newChat);
            console.log("Messages in chat:", formattedMessages.length);

            // Oppdater brukerchats
            setUserChats((prevChats) => {
                console.log("Previous chats:", prevChats.length);

                // Deaktiver alle andre samtaler
                const updatedChats = prevChats.map((chat) => ({
                    ...chat,
                    isActive: false,
                }));

                const existingChatIndex = updatedChats.findIndex(
                    (chat) => chat.id === receiverId
                );

                if (existingChatIndex >= 0) {
                    updatedChats[existingChatIndex] = {
                        ...updatedChats[existingChatIndex],
                        messages: formattedMessages,
                        isActive: true,
                    };
                    console.log("Updated existing chat");
                    return updatedChats;
                } else {
                    console.log("Adding new chat");
                    return [newChat, ...updatedChats];
                }
            });

            // Vent litt før vi laster meldinger på nytt
            setTimeout(() => {
                loadUserData();
            }, 500);
        } catch (error) {
            console.error("Error starting conversation from ad:", error);
            setError("Det oppstod en feil ved oppstart av samtale");
        }
    };

    // Start en samtale fra en annonse
    useEffect(() => {
        const startConversation = async () => {
            if (receiverId && itemId && currentUserId && !messageSent) {
                await handleStartConversationFromAd(
                    currentUserId,
                    parseInt(receiverId),
                    itemId
                );
                setMessageSent(true);
            }
        };

        startConversation();
    }, [receiverId, itemId, currentUserId, messageSent]);

    // Funksjon for lasting av meldingsdata
    const loadUserData = async () => {
        try {
            setLoading(true);

            // Hent brukerdata fra cookies
            const userCookie = Cookies.get("user");
            if (!userCookie) {
                setError("Du må være logget inn for å se meldinger");
                setLoading(false);
                return;
            }

            const userData = JSON.parse(userCookie);
            const userId = userData.id;
            setCurrentUserId(userId);

            // Hent alle brukere som har sendt eller mottatt meldinger fra brukeren
            const messagedUsers = await fetchMessagedUsers(userId);

            const formattedUserChats: UserChat[] = [];

            // Hent meldinger for hver bruker
            for (const user of messagedUsers) {
                const messages = await fetchMessagesBetweenUsers(
                    userId,
                    user.id
                );
                const formattedMessages = formatMessages(messages, userId);

                formattedUserChats.push({
                    id: user.id,
                    username: user.username,
                    messages: formattedMessages,
                    isActive: formattedUserChats.length === 0, // Sett første samtale som aktiv
                });
            }

            setUserChats(formattedUserChats);

            setError(null);
        } catch (err) {
            console.error("Error loading messages:", err);
            setError("Det oppstod en feil ved lasting av meldinger");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
                <p>Laster meldinger...</p>
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

    return (
        <div className="w-full h-[calc(100vh-4rem)]">
            <div className="flex flex-col h-full gap-6 px-5 py-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Meldinger</h1>
                </div>
                <div className="flex-1">
                    {userChats.length > 0 ? (
                        <Chat
                            currentUser="Meg"
                            currentUserId={currentUserId || 0}
                            userChats={userChats}
                            setUserChats={setUserChats}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">
                                Du har ingen meldinger ennå. Start en ny
                                samtale!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
