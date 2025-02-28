"use client";

import React from "react";
import { Chat } from "@/components/chat";

const Messages: React.FC = () => {
  const initialChats = [
    {
      id: 1,
      user: "Ola Nordmann",
      messages: [
        {
          role: "other" as const,
          content: "Hei! Er leiligheten fortsatt ledig?",
          sender: "Ola Nordmann",
          timestamp: "10:30",
          date: "27. feb",
        },
        {
          role: "user" as const,
          content: "Ja, den er fortsatt ledig. Når vil du se på den?",
          sender: "Meg",
          timestamp: "10:32",
          date: "27. feb",
        },
      ],
      isActive: true,
    },
    {
      id: 2,
      user: "John Doe",
      messages: [
        {
          role: "other" as const,
          content: "Hei! Jeg er interessert i å leie leiligheten din.",
          sender: "John Doe",
          timestamp: "10:30",
          date: "27. feb",
        },
        {
          role: "user" as const,
          content: "Hei! Ja, den er fortsatt tilgjengelig. Når ønsker du å se på den?",
          sender: "Meg",
          timestamp: "10:32",
          date: "27. feb",
        },
      ],
    },
  ];

  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full gap-6 px-5 py-6">
        <h1 className="text-3xl font-bold">Meldinger</h1>
        <div className="flex-1">
          <Chat
            currentUser="Meg"
            initialChats={initialChats}
          />
        </div>
      </div>
    </div>
  );
};

export default Messages;
