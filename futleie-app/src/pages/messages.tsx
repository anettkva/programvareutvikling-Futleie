"use client"

import React from 'react';
import { Chat } from '@/components/chat';
import { ChatMessage } from '@/types/chat-message';

const Messages: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: 'other' as const,
      content: 'Hei! Jeg er interessert i å leie leiligheten din.',
      sender: 'John Doe',
      timestamp: '10:30',
      date: '27. feb'
    },
    {
      role: 'other' as const,
      content: 'Hei! Jeg er interessert i å leie leiligheten din.',
      sender: 'John Doe',
      timestamp: '10:30',
      date: '27. feb'
    },
    {
      role: 'user' as const,
      content: 'Hei! Ja, den er fortsatt tilgjengelig. Når ønsker du å se på den?',
      sender: 'Meg',
      timestamp: '10:32',
      date: '27. feb'
    }
  ]);

  const currentUser = 'Meg';
  const otherUser = 'John Doe';

  const handleSendMessage = (content: string) => {
    const now = new Date();
    const newMessage: ChatMessage = {
      role: 'user' as const,
      content,
      sender: currentUser,
      timestamp: now.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full gap-6 px-5 py-6">
        <h1 className="text-3xl font-bold">Meldinger</h1>
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
  );
};

export default Messages;
