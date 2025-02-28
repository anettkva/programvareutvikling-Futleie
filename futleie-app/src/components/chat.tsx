"use client"

import * as React from "react"
import { Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import { Input } from "./ui/input"
import { ChatMessage } from "@/types/chat-message"

interface ChatProps {
  messages: ChatMessage[]
  onSendMessage: (content: string) => void
  otherUser: string
  currentUser: string
}

export function Chat({ messages, onSendMessage, otherUser, currentUser }: ChatProps) {
  const [input, setInput] = React.useState("")
  const inputLength = input.trim().length
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center">
        <div className="flex items-center space-x-4">
          <p className="text-sm font-medium leading-none">{otherUser}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
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
            onSendMessage(input)
            setInput("")
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Skriv en melding..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button type="submit" size="icon" disabled={inputLength === 0}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
