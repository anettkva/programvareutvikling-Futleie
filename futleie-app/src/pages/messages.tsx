"use client";

import React from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Messages: React.FC = () => {
  const [chats, setChats] = React.useState([
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
        {
          role: "other" as const,
          content: "Jeg kan komme i morgen klokken 15:00 hvis det passer?",
          sender: "Ola Nordmann",
          timestamp: "10:35",
          date: "27. feb",
        },
        {
          role: "user" as const,
          content: "Det passer fint! Adressen er Kongens gate 15.",
          sender: "Meg",
          timestamp: "10:37",
          date: "27. feb",
        },
        {
          role: "other" as const,
          content: "Supert! Kan du fortelle meg litt mer om leiligheten? Hvor mange kvadratmeter er den?",
          sender: "Ola Nordmann",
          timestamp: "10:40",
          date: "27. feb",
        },
        {
          role: "user" as const,
          content: "Leiligheten er 55 kvadratmeter, har 2 soverom og en stor stue med åpen kjøkkenløsning. Den ligger i 3. etasje med heis.",
          sender: "Meg",
          timestamp: "10:42",
          date: "27. feb",
        },
        {
          role: "other" as const,
          content: "Høres bra ut! Hva er månedlig leie og når er den tilgjengelig fra?",
          sender: "Ola Nordmann",
          timestamp: "10:45",
          date: "27. feb",
        },
        {
          role: "user" as const,
          content: "Leien er 12 000 kr per måned, inkludert kommunale avgifter. Den er tilgjengelig fra 1. april. Depositum er 3 måneders leie.",
          sender: "Meg",
          timestamp: "10:47",
          date: "27. feb",
        },
        {
          role: "other" as const,
          content: "Perfekt timing! Er strøm inkludert i leien?",
          sender: "Ola Nordmann",
          timestamp: "10:50",
          date: "27. feb",
        },
        {
          role: "user" as const,
          content: "Nei, strøm kommer i tillegg. Men leiligheten er godt isolert, så strømregningen pleier ikke å være så høy.",
          sender: "Meg",
          timestamp: "10:52",
          date: "27. feb",
        },
        {
          role: "other" as const,
          content: "Skjønner. Er det mulighet for langtidsleie? Jeg ser etter noe mer permanent.",
          sender: "Ola Nordmann",
          timestamp: "10:55",
          date: "27. feb",
        },
        {
          role: "user" as const,
          content: "Ja, absolutt! Vi kan diskutere dette nærmere når du kommer på visning i morgen.",
          sender: "Meg",
          timestamp: "10:57",
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
  ]);

  const [newChatUser, setNewChatUser] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatUser.trim()) return;

    const newChat = {
      id: chats.length > 0 ? Math.max(...chats.map(chat => chat.id)) + 1 : 1,
      user: newChatUser,
      messages: [],
      isActive: true
    };
    setChats(prev => prev.map(chat => ({ ...chat, isActive: false })).concat(newChat));
    setNewChatUser("");
    setDialogOpen(false);
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full gap-6 px-5 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Meldinger</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-[#F26A21] hover:bg-[#9F3C23] text-white flex gap-2 items-center">
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
                  <Label htmlFor="recipient">Hvem vil du chatte med?</Label>
                  <Input
                    id="recipient"
                    placeholder="Skriv navn..."
                    value={newChatUser}
                    onChange={(e) => setNewChatUser(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#F26A21] hover:bg-[#9F3C23] text-white">
                  Start chat
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1">
          <Chat
            currentUser="Meg"
            chats={chats}
            setChats={setChats}
          />
        </div>
      </div>
    </div>
  );
};

export default Messages;
