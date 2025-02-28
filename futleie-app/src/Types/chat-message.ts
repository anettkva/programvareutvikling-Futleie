export interface ChatMessage {
  role: "user" | "other"
  content: string
  sender: string
  timestamp: string
  date: string
}
