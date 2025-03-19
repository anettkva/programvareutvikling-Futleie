import supabaseClient from "@/supabaseClient";
import { User } from "@/Types/User";
import { ChatMessage } from "@/Types/chat-message";

/**
 * Henter alle unike brukere som nåværende bruker har utvekslet meldinger med
 * @param userId ID-en til nåværende bruker
 * @returns Array med brukere og deres siste melding
 */
export const fetchMessagedUsers = async (userId: number) => {
    try {
        // Hent alle unike brukere nåværende bruker har sendt meldinger til
        const { data: sentToUsers, error: sentError } = await supabaseClient
            .from("Messages")
            .select(
                "receiver_id, Users!Messages_receiver_id_fkey(id, username)"
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (sentError) {
            console.error("Error fetching sent messages:", sentError);
            throw new Error(sentError.message);
        }

        // Hent alle unike brukere som har sendt meldinger til nåværende bruker
        const { data: receivedFromUsers, error: receivedError } =
            await supabaseClient
                .from("Messages")
                .select("user_id, Users!Messages_user_id_fkey(id, username)")
                .eq("receiver_id", userId)
                .order("created_at", { ascending: false });

        if (receivedError) {
            console.error("Error fetching received messages:", receivedError);
            throw new Error(receivedError.message);
        }

        // Kombiner resultatene og fjern duplikater
        const userMap = new Map();

        sentToUsers?.forEach((item) => {
            const user = item.Users;
            if (user && !userMap.has(user.id)) {
                userMap.set(user.id, { id: user.id, username: user.username });
            }
        });

        receivedFromUsers?.forEach((item) => {
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
 * Henter meldinger mellom to brukere
 * @param currentUserId ID-en til nåværende bruker
 * @param otherUserId ID-en til den andre brukeren
 * @returns Array med meldinger
 */
export const fetchMessagesBetweenUsers = async (
    currentUserId: number,
    otherUserId: number
) => {
    try {
        console.log(
            `Fetching messages between ${currentUserId} and ${otherUserId}`
        );

        // Første spørring: Meldinger sendt fra nåværende bruker til den andre brukeren
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

        // Andre spørring: Meldinger mottatt av nåværende bruker fra den andre brukeren
        const { data: receivedMessages, error: receivedError } =
            await supabaseClient
                .from("Messages")
                .select("*, Users!Messages_user_id_fkey(username)")
                .eq("user_id", otherUserId)
                .eq("receiver_id", currentUserId)
                .order("created_at", { ascending: true });

        if (receivedError) {
            console.error("Error fetching received messages:", receivedError);
            throw new Error(receivedError.message);
        }

        // Kombiner og sorter meldinger etter tidsstempel
        const allMessages = [
            ...(sentMessages || []),
            ...(receivedMessages || []),
        ];
        allMessages.sort((a, b) => {
            return (
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
        });

        console.log(`Found ${allMessages.length} messages between users`);
        return allMessages;
    } catch (error) {
        console.error("Error in fetchMessagesBetweenUsers:", error);
        return [];
    }
};

/**
 * Formaterer databasemeldinger til ChatMessage-formatet som brukes av UI-et
 * @param messages Array med meldinger fra databasen
 * @param currentUserId ID-en til nåværende bruker
 * @returns Array med formaterte meldinger
 */
export const formatMessages = (
    messages: any[],
    currentUserId: number
): ChatMessage[] => {
    return messages.map((message) => {
        const isCurrentUser = message.user_id === currentUserId;
        const date = new Date(message.created_at);

        // Håndterer den nye fremmednøkkelreferanseformatet
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
            date: date.toLocaleDateString("no-NO", {
                day: "numeric",
                month: "short",
            }),
        };
    });
};

/**
 * Sender en ny melding
 * @param senderId ID-en til avsender
 * @param receiverId ID-en til mottaker
 * @param message Meldingsinnholdet
 * @returns Den opprettede meldingen
 */
export const sendMessage = async (
    senderId: number,
    receiverId: number,
    message: string
) => {
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
 * Henter alle brukere unntatt nåværende bruker
 * @param currentUserId ID-en til nåværende bruker
 * @returns Array med brukere
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
