"use client"

import * as React from "react"
import { Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import { Input } from "./ui/input"
import { ChatMessage } from "@/Types/chat-message"

interface Chat {
  id: number
  user: string
  messages: ChatMessage[]
  isActive?: boolean
}

interface ChatProps {
  currentUser: string
  chats: Chat[]
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
}

export function Chat({ currentUser, chats, setChats }: ChatProps) {
  const [input, setInput] = React.useState("")
  const inputLength = input.trim().length
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const activeChat = chats.find(chat => chat.isActive) || chats[0]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [activeChat?.messages])

  const handleSendMessage = (content: string) => {
    const now = new Date()
    const newMessage: ChatMessage = {
      role: "user" as const,
      content,
      sender: currentUser,
      timestamp: now.toLocaleTimeString("no-NO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: now.toLocaleDateString("no-NO", { day: "numeric", month: "short" }),
    }
    
    setChats(chats.map(chat => {
      if (chat.id === activeChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage]
        }
      }
      return chat
    }))
  }

  const handleChatSelect = (selectedId: number) => {
    setChats(chats.map(chat => ({
      ...chat,
      isActive: chat.id === selectedId
    })))
  }

  return (
    <div className="flex gap-6 h-full bg-[#FEDEC7]/10 rounded-lg p-4">
      {/* Chat list */}
      <div className="w-80 bg-white/80 rounded-lg shadow-sm">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleChatSelect(chat.id)}
            className={`w-70 m-2 rounded-lg ${chat.isActive ? 'bg-[#F26A21]/10 border-[#F26A21]' : 'bg-white border-gray-200'} border h-20 flex p-5 items-center cursor-pointer hover:bg-[#F26A21]/5 transition-colors`}
          >
            <div>{chat.user}</div>
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

      {/* Chat window */}
      <Card className="flex-1 flex flex-col bg-white/80 shadow-sm border-0 h-[calc(100vh-12rem)]">
        <CardHeader className="flex flex-row items-center border-b py-4">
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium leading-none">{activeChat.user}</p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4 pb-4 flex flex-col">
            {activeChat.messages.map((message, index) => (
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
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (inputLength === 0) return
              handleSendMessage(input)
              setInput("")
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
            />
            <Button
              type="submit"
              disabled={inputLength === 0}
              className="bg-[#F26A21] hover:bg-[#9F3C23] disabled:bg-gray-300 text-white flex gap-2 items-center px-4"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
