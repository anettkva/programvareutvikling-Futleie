"use client";

import React from "react";
import { Chat } from "@/components/chat";
import { ChatMessage } from "@/Types/chat-message";

const Messages: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "other" as const,
      content: "Hei! Jeg er interessert i å leie leiligheten din.",
      sender: "John Doe",
      timestamp: "10:30",
      date: "27. feb",
    },
    {
      role: "other" as const,
      content: "Hei! Jeg er interessert i å leie leiligheten din.",
      sender: "John Doe",
      timestamp: "10:30",
      date: "27. feb",
    },
    {
      role: "user" as const,
      content:
        "Hei! Ja, den er fortsatt tilgjengelig. Når ønsker du å se på den?",
      sender: "Meg",
      timestamp: "10:32",
      date: "27. feb",
    },
  ]);

  const currentUser = "Meg";
  const otherUser = "John Doe";

  const handleSendMessage = (content: string) => {
    const now = new Date();
    const newMessage: ChatMessage = {
      role: "user" as const,
      content,
      sender: currentUser,
      timestamp: now.toLocaleTimeString("no-NO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: now.toLocaleDateString("no-NO", { day: "numeric", month: "short" }),
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full gap-6 px-5 py-6">
        <h1 className="text-3xl font-bold">Meldinger</h1>
        <div className="flex flex-1 gap-6">
          <div className="w-80 bg-gray-50 border rounded-lg border-gray-200">
            <div className="w-70 m-2 rounded-lg bg-white border border-gray-200 h-20 flex p-5 items-center">
              <div>Ola Nordmann</div>
              <div className="ml-auto">
                {/* pilikon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-chevron-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
                  />
                </svg>
              </div>
            </div>
            <div className="w-70 m-2 rounded-lg bg-[#FEDEC7] border border-gray-200 h-20">
            </div>
          </div>
          <div className="flex-1">
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
              otherUser={otherUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
