import supabaseClient from "@/supabaseClient";
import { User } from "@/Types/User";
import { ChatMessage } from "@/Types/chat-message";

/**
 * Fetches all unique users that the current user has exchanged messages with
 * @param userId The ID of the current user
 * @returns Array of users with their latest message
 */
export const fetchMessagedUsers = async (userId: number) => {
  try {
    // Get all unique users the current user has sent messages to
    const { data: sentToUsers, error: sentError } = await supabaseClient
      .from("Messages")
      .select("receiver_id, Users!Messages_receiver_id_fkey(id, username)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (sentError) {
      console.error("Error fetching sent messages:", sentError);
      throw new Error(sentError.message);
    }

    // Get all unique users who have sent messages to the current user
    const { data: receivedFromUsers, error: receivedError } = await supabaseClient
      .from("Messages")
      .select("user_id, Users!Messages_user_id_fkey(id, username)")
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false });

    if (receivedError) {
      console.error("Error fetching received messages:", receivedError);
      throw new Error(receivedError.message);
    }

    // Combine the results and remove duplicates
    const userMap = new Map();
    
    sentToUsers?.forEach(item => {
      const user = item.Users;
      if (user && !userMap.has(user.id)) {
        userMap.set(user.id, { id: user.id, username: user.username });
      }
    });
    
    receivedFromUsers?.forEach(item => {
      const user = item.Users;
      if (user && !userMap.has(user.id)) {
        userMap.set(user.id, { id: user.id, username: user.username });
      }
    });
    
    return Array.from(userMap.values());
  } catch (error) {
    console.error("Error in fetchMessagedUsers:", error);
    return [];
  }
};

/**
 * Fetches messages between two users
 * @param currentUserId The ID of the current user
 * @param otherUserId The ID of the other user
 * @returns Array of messages
 */
export const fetchMessagesBetweenUsers = async (currentUserId: number, otherUserId: number) => {
  try {
    console.log(`Fetching messages between ${currentUserId} and ${otherUserId}`);
    
    // First query: Messages sent from current user to other user
    const { data: sentMessages, error: sentError } = await supabaseClient
      .from("Messages")
      .select("*, Users!Messages_user_id_fkey(username)")
      .eq("user_id", currentUserId)
      .eq("receiver_id", otherUserId)
      .order("created_at", { ascending: true });

    if (sentError) {
      console.error("Error fetching sent messages:", sentError);
      throw new Error(sentError.message);
    }

    // Second query: Messages received by current user from other user
    const { data: receivedMessages, error: receivedError } = await supabaseClient
      .from("Messages")
      .select("*, Users!Messages_user_id_fkey(username)")
      .eq("user_id", otherUserId)
      .eq("receiver_id", currentUserId)
      .order("created_at", { ascending: true });

    if (receivedError) {
      console.error("Error fetching received messages:", receivedError);
      throw new Error(receivedError.message);
    }

    // Combine and sort messages by timestamp
    const allMessages = [...(sentMessages || []), ...(receivedMessages || [])];
    allMessages.sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    
    console.log(`Found ${allMessages.length} messages between users`);
    return allMessages;
  } catch (error) {
    console.error("Error in fetchMessagesBetweenUsers:", error);
    return [];
  }
};

/**
 * Formats database messages into the ChatMessage format used by the UI
 * @param messages Array of messages from the database
 * @param currentUserId The ID of the current user
 * @returns Array of formatted messages
 */
export const formatMessages = (messages: any[], currentUserId: number): ChatMessage[] => {
  return messages.map((message) => {
    const isCurrentUser = message.user_id === currentUserId;
    const date = new Date(message.created_at);
    
    // Handle the new foreign key reference format
    let username = "Ukjent bruker";
    if (message.Users && message.Users.username) {
      username = message.Users.username;
    }
    
    return {
      role: isCurrentUser ? "user" : "other",
      content: message.message,
      sender: isCurrentUser ? "Meg" : username,
      timestamp: date.toLocaleTimeString("no-NO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: date.toLocaleDateString("no-NO", { day: "numeric", month: "short" }),
    };
  });
};

/**
 * Sends a new message
 * @param senderId The ID of the sender
 * @param receiverId The ID of the receiver
 * @param message The message content
 * @returns The created message
 */
export const sendMessage = async (senderId: number, receiverId: number, message: string) => {
  try {
    const { data, error } = await supabaseClient
      .from("Messages")
      .insert({
        user_id: senderId,
        receiver_id: receiverId,
        message: message,
      })
      .select();

    if (error) {
      console.error("Error sending message:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};

/**
 * Fetches all users except the current user
 * @param currentUserId The ID of the current user
 * @returns Array of users
 */
export const fetchUsers = async (currentUserId: number) => {
  try {
    const { data, error } = await supabaseClient
      .from("Users")
      .select("*")
      .neq("id", currentUserId);

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchUsers:", error);
    return [];
  }
};
