"use client";

import * as React from "react";
import { Search, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { ChatMessage } from "@/Types/chat-message";
import { sendMessage } from "@/services/messages";
import supabaseClient from "@/supabaseClient";

interface UserChat {
  id: number;
  username: string;
  messages: ChatMessage[];
  isActive?: boolean;
}

interface ChatProps {
  currentUser: string;
  currentUserId: number;
  userChats: UserChat[];
  setUserChats: React.Dispatch<React.SetStateAction<UserChat[]>>;
}

export const Chat: React.FC<ChatProps> = ({
  currentUser,
  currentUserId,
  userChats,
  setUserChats,
}: ChatProps) => {
  const [input, setInput] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const inputLength = input.trim().length;
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const activeChat = userChats.find((chat) => chat.isActive) || userChats[0];
  const subscriptionRef = React.useRef<any>(null);
  const filteredChats = userChats.filter((chat) =>
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Skroll til bunnen av meldingsvinduet når det oppdateres
   */
  React.useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  /**
   * Sett opp sanntidsabonnement for meldinger
   */
  React.useEffect(() => {
    console.log(
      "Setting up real-time subscription with currentUserId:",
      currentUserId
    );

    if (!currentUserId) {
      console.log("No currentUserId, skipping subscription setup");
      return;
    }

    // Sett opp sanntidsabonnement
    try {
      console.log("Creating channel subscription...");
      // Kanalnavnet må være unikt for hver bruker
      const subscription = supabaseClient
        .channel("messages-channel-" + currentUserId)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "Messages",
            filter: `receiver_id=eq.${currentUserId}`,
          },
          async (payload) => {
            console.log("New message event received:", payload);

            const message = payload.new;

            if (message.sender_id === currentUserId) {
              console.log("Skipping our own sent message to avoid duplication");
              return;
            }

            console.log("Processing incoming message:", message);

            // Hent avsenderinformasjon
            const { data: senderData, error: senderError } =
              await supabaseClient
                .from("Users")
                .select("id, username")
                .eq("id", message.user_id)
                .single();

            if (senderError) {
              console.error("Error fetching sender details:", senderError);
              return;
            }

            // Finn ut hvem som er den andre parten i samtalen
            const otherPartyId =
              message.user_id === currentUserId
                ? message.receiver_id
                : message.user_id;

            let otherPartyName = "";
            if (message.user_id === currentUserId) {
              const { data: receiverData, error: receiverError } =
                await supabaseClient
                  .from("Users")
                  .select("username")
                  .eq("id", message.receiver_id)
                  .single();

              if (receiverError) {
                console.error(
                  "Error fetching receiver details:",
                  receiverError
                );
                return;
              }
              otherPartyName = receiverData.username;
            } else {
              otherPartyName = senderData.username;
            }

            console.log(
              "Other party for this message:",
              otherPartyId,
              otherPartyName
            );

            // Formatér meldingen for visning i UI
            const formattedMessage = {
              role: message.user_id === currentUserId ? "user" : "other",
              content: message.message,
              sender:
                message.user_id === currentUserId ? "Meg" : senderData.username,
              timestamp: new Date(message.created_at).toLocaleTimeString(
                "no-NO",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ),
              date: new Date(message.created_at).toLocaleDateString("no-NO", {
                day: "numeric",
                month: "short",
              }),
            };

            console.log("Formatted message:", formattedMessage);

            // Oppdater brukerens samtaler med den nye meldingen
            setUserChats((prevChats) => {
              console.log("Updating chats with new message");
              const existingChatIndex = prevChats.findIndex(
                (chat) => chat.id === otherPartyId
              );

              if (existingChatIndex >= 0) {
                console.log(
                  "Adding to existing chat at index:",
                  existingChatIndex
                );
                const updatedChats = [...prevChats];
                updatedChats[existingChatIndex] = {
                  ...updatedChats[existingChatIndex],
                  messages: [
                    ...updatedChats[existingChatIndex].messages,
                    formattedMessage as ChatMessage,
                  ],
                };
                return updatedChats;
              } else {
                console.log("Creating new chat for user:", otherPartyName);
                return [
                  {
                    id: otherPartyId,
                    username: otherPartyName,
                    messages: [formattedMessage as ChatMessage],
                    isActive: false,
                  },
                  ...prevChats,
                ];
              }
            });
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });

      console.log("Subscription created successfully");
      subscriptionRef.current = subscription;
    } catch (error) {
      console.error("Error setting up Supabase subscription:", error);
    }

    return () => {
      console.log("Cleaning up subscription");
      if (subscriptionRef.current) {
        supabaseClient.removeChannel(subscriptionRef.current);
      }
    };
  }, [currentUserId]);

  /**
   * Send melding til aktiv chat
   */
  const handleSendMessage = async (content: string) => {
    if (!activeChat) return;

    try {
      setSending(true);
      const now = new Date();
      const newMessage: ChatMessage = {
        role: "user" as const,
        content,
        sender: currentUser,
        timestamp: now.toLocaleTimeString("no-NO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: now.toLocaleDateString("no-NO", {
          day: "numeric",
          month: "short",
        }),
      };

      // Oppdater brukerens samtaler med den nye meldingen
      setUserChats(
        userChats.map((chat) => {
          if (chat.id === activeChat.id) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
            };
          }
          return chat;
        })
      );
      await sendMessage(currentUserId, activeChat.id, content);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  /**
   * Velg en chat
   */
  const handleChatSelect = (selectedId: number) => {
    setUserChats(
      userChats.map((chat) => ({
        ...chat,
        isActive: chat.id === selectedId,
      }))
    );
  };

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-full bg-[#FEDEC7]/10 rounded-lg p-4">
        <p className="text-gray-500">Ingen aktiv chat</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full bg-[#FEDEC7]/10 rounded-lg p-4">
      {/* Chat list */}
      <div className="w-80 flex flex-col bg-white/80 rounded-lg shadow-sm h-[calc(100vh-12rem)]">
        {/* Search bar */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk etter samtaler..."
              className="pl-8 focus-visible:ring-[#F26A21]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat.id)}
              className={`w-70 m-2 rounded-lg ${
                chat.isActive
                  ? "bg-[#F26A21]/10 border-[#F26A21]"
                  : "bg-white border-gray-200"
              } border h-20 flex p-5 items-center cursor-pointer hover:bg-[#F26A21]/5 transition-colors`}
            >
              <div>{chat.username}</div>
              <div className="ml-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-chevron-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <Card className="flex-1 flex flex-col bg-white/80 shadow-sm border-0 h-[calc(100vh-12rem)]">
        <CardHeader className="flex flex-row items-center border-b py-4">
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium leading-none">
              {activeChat.username}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4 pb-4 flex flex-col">
            {activeChat.messages.length > 0 ? (
              activeChat.messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg px-3 py-2 text-sm break-words",
                    message.role === "user"
                      ? "ml-auto bg-[#F26A21] text-white self-end max-w-[75%]"
                      : "bg-[#9F3C23]/10 self-start max-w-[75%]"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70">
                        {message.sender}
                      </span>
                      <span className="text-xs opacity-50">
                        {message.date} {message.timestamp}
                      </span>
                    </div>
                  </div>
                  {message.content}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  Ingen meldinger ennå. Send en melding for å starte samtalen!
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (inputLength === 0 || sending) return;
              handleSendMessage(input);
              setInput("");
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              id="message"
              placeholder="Skriv en melding..."
              className="flex-1 focus-visible:ring-[#F26A21]"
              autoComplete="off"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={inputLength === 0 || sending}
              className="flex gap-2 items-center px-4"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};
