"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Chat } from "@/components/chat";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    fetchMessagedUsers,
    fetchMessagesBetweenUsers,
    formatMessages,
    fetchUsers,
    sendMessage,
} from "@/services/messages";
import { ChatMessage } from "@/Types/chat-message";
import Cookies from "js-cookie";
import { User } from "@/Types/User";
import { useLocation, useNavigate } from "react-router-dom";
import supabaseClient from "@/supabaseClient";

interface UserChat {
    id: number;
    username: string;
    messages: ChatMessage[];
    isActive?: boolean;
}

const Messages: React.FC = () => {
    const [userChats, setUserChats] = useState<UserChat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [newChatUser, setNewChatUser] = useState<User | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [messageSent, setMessageSent] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Extract receiverId and itemId from URL if present
    const searchParams = new URLSearchParams(location.search);
    const receiverId = searchParams.get("receiverId");
    const itemId = searchParams.get("itemId");

    // Function to handle starting a conversation from an ad
    const handleStartConversationFromAd = async (
        userId: number,
        receiverId: number,
        itemId: string
    ) => {
        try {
            console.log(
                `Starting conversation from ad: user ${userId} to receiver ${receiverId} about item ${itemId}`
            );

            // Fetch item details
            const { data: itemData, error: itemError } = await supabaseClient
                .from("Items")
                .select("title")
                .eq("id", itemId)
                .single();

            if (itemError) {
                console.error("Error fetching item:", itemError);
                return;
            }

            // Get receiver user details
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

            // Check if there are already messages between these users
            let existingMessages = await fetchMessagesBetweenUsers(
                userId,
                receiverId
            );

            // Only send a message if there are no existing messages
            if (existingMessages.length === 0) {
                // Send initial message about the item
                const initialMessage = `Hei! Jeg tar kontakt angående annonsen din "${itemData.title}".`;
                await sendMessage(userId, receiverId, initialMessage);

                // Fetch messages again to include the one we just sent
                existingMessages = await fetchMessagesBetweenUsers(
                    userId,
                    receiverId
                );
            }

            // Clear URL parameters
            navigate("/messages", { replace: true });

            // Format messages for display
            const formattedMessages = formatMessages(existingMessages, userId);

            const newChat: UserChat = {
                id: receiverId,
                username: receiverData.username,
                messages: formattedMessages,
                isActive: true,
            };

            console.log("New chat to be added:", newChat);
            console.log("Messages in chat:", formattedMessages.length);

            // Update user chats with the new chat as active
            setUserChats((prevChats) => {
                console.log("Previous chats:", prevChats.length);

                // Deactivate all existing chats
                const updatedChats = prevChats.map((chat) => ({
                    ...chat,
                    isActive: false,
                }));

                // Check if chat with this user already exists
                const existingChatIndex = updatedChats.findIndex(
                    (chat) => chat.id === receiverId
                );

                if (existingChatIndex >= 0) {
                    // Update existing chat
                    updatedChats[existingChatIndex] = {
                        ...updatedChats[existingChatIndex],
                        messages: formattedMessages,
                        isActive: true,
                    };
                    console.log("Updated existing chat");
                    return updatedChats;
                } else {
                    // Add new chat
                    console.log("Adding new chat");
                    return [newChat, ...updatedChats];
                }
            });

            // Reload the user data to ensure the chat appears
            setTimeout(() => {
                loadUserData();
            }, 500);
        } catch (error) {
            console.error("Error starting conversation from ad:", error);
            setError("Det oppstod en feil ved oppstart av samtale");
        }
    };

    // Fetch user data and messages on component mount
    // Effect to handle starting a conversation from an ad
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

    // Function to load user data and messages
    const loadUserData = async () => {
        try {
            setLoading(true);

            // Get current user from cookie
            const userCookie = Cookies.get("user");
            if (!userCookie) {
                setError("Du må være logget inn for å se meldinger");
                setLoading(false);
                return;
            }

            const userData = JSON.parse(userCookie);
            const userId = userData.id;
            setCurrentUserId(userId);

            // Fetch all users this user has messaged with
            const messagedUsers = await fetchMessagedUsers(userId);

            // Format user chats for the UI
            const formattedUserChats: UserChat[] = [];

            // For each user, fetch the messages between them
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
                    isActive: formattedUserChats.length === 0, // Make the first chat active
                });
            }

            setUserChats(formattedUserChats);

            // Fetch available users for new chats
            const users = await fetchUsers(userId);
            setAvailableUsers(users);

            setError(null);
        } catch (err) {
            console.error("Error loading messages:", err);
            setError("Det oppstod en feil ved lasting av meldinger");
        } finally {
            setLoading(false);
        }
    };

    // Load user data on component mount
    useEffect(() => {
        loadUserData();
    }, []);

    const handleNewChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChatUser || !currentUserId) return;

        // Check if we already have a chat with this user
        const existingChat = userChats.find(
            (chat) => chat.id === newChatUser.id
        );

        if (existingChat) {
            // Just make it active
            setUserChats(
                userChats.map((chat) => ({
                    ...chat,
                    isActive: chat.id === newChatUser.id,
                }))
            );
        } else {
            // Add a new chat to the UI
            const newUserChat: UserChat = {
                id: newChatUser.id,
                username: newChatUser.username,
                messages: [],
                isActive: true,
            };

            // Set all other chats to inactive
            setUserChats((prev) =>
                prev
                    .map((chat) => ({ ...chat, isActive: false }))
                    .concat(newUserChat)
            );
        }

        setNewChatUser(null);
        setDialogOpen(false);
    };

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
                    {/* Commented out the ability to create a new chat from the messages page
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex gap-2 items-center">
                <Plus className="h-4 w-4" />
                <span>Ny chat</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start ny chat</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNewChat} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Velg bruker å chatte med</Label>
                  <select 
                    id="recipient"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F26A21]" 
                    value={newChatUser?.id || ""}
                    onChange={(e) => {
                      const selectedUser = availableUsers.find(user => user.id === parseInt(e.target.value));
                      setNewChatUser(selectedUser || null);
                    }}
                  >
                    <option value="">Velg bruker...</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!newChatUser}>
                  Start chat
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          */}
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
