import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabaseClient from "@/supabaseClient";
import Cookies from "js-cookie";
import { log } from "node:console";

// Define the Group type
type Group = {
    id: number;
    name: string;
    description: string;
    owner_id: string;
    code: string;
    created_at: string;
};

export default function Groups() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
    const [joinedGroupsLoading, setJoinedGroupsLoading] = useState(true);
    const [groupCode, setGroupCode] = useState("");

    const handleCreateGroup = () => {
        navigate("/create-group");
    };

    const handleJoinGroup = async () => {
        const { data, error } = await supabaseClient
            .from("Groups")
            .select("*")
            .eq("code", groupCode)
            .single();

        if (error) {
            console.error("Error fetching group:", error);
            alert("Kunne ikke bli med i gruppen. Stemmer gruppekoden?");
        }

        if (data) {
            const userCookie = Cookies.get("user");
            if (!userCookie) {
                setError("User not logged in");
                return;
            }

            const userId = JSON.parse(userCookie).id;

            const { error: membershipError } = await supabaseClient
                .from("Memberships")
                .insert([{ user_id: userId, group_id: data.id }]);

            if (membershipError) {
                console.error("Error creating membership:", membershipError);
            } else {
                setJoinedGroups([...joinedGroups, data]);
            }
        }
    };

    useEffect(() => {
        async function fetchGroups() {
            try {
                setLoading(true);
                setError(null);

                const userCookie = Cookies.get("user");
                if (!userCookie) {
                    setError("User not logged in");
                    setLoading(false);
                    return;
                }

                const userId = JSON.parse(userCookie).id;

                // Fetch groups where the user is the owner
                const { data, error } = await supabaseClient
                    .from("Groups")
                    .select("*")
                    .eq("owner_id", userId);

                if (error) {
                    console.error("Error fetching groups:", error);
                    setError(`Failed to fetch groups: ${error.message}`);
                } else {
                    setGroups(data || []);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
                setError("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchGroups();
    }, []);

    useEffect(() => {
        async function getJoinedGroups() {
            const userCookie = Cookies.get("user");
            if (!userCookie) {
                setError("User not logged in");
                setLoading(false);
                return;
            }

            const userId = JSON.parse(userCookie).id;

            // Fetch groups the user has joined
            const { data, error } = await supabaseClient
                .from("Memberships")
                .select("group_id")
                .eq("user_id", userId);

            if (error) {
                console.error("Error fetching groups:", error);
                setError(`Failed to fetch groups: ${error.message}`);
            }

            if (data) {
                const groupIds = data.map((membership) => membership.group_id);
                const { data: groupData, error: groupError } =
                    await supabaseClient
                        .from("Groups")
                        .select("*")
                        .in("id", groupIds);

                if (groupError) {
                    console.error("Error fetching groups:", groupError);
                    setError(`Failed to fetch groups: ${groupError.message}`);
                } else {
                    setJoinedGroups(groupData || []);
                    setJoinedGroupsLoading(false);
                }
            }
        }
        getJoinedGroups();
    }, []);

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Groups</h1>
                <Button onClick={handleCreateGroup}>Opprett gruppe</Button>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Skriv gruppekode"
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        value={groupCode}
                        onChange={(e) => setGroupCode(e.target.value)}
                    />
                    <Button onClick={handleJoinGroup} size="sm">
                        Bli med
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-lg shadow p-6 flex justify-center">
                    <p>Laster grupper...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
            ) : groups.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">
                        Ingen grupper å vise ennå. Opprett en ny gruppe for å
                        komme i gang.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className="bg-white rounded-lg shadow overflow-hidden"
                        >
                            <div className="p-5">
                                <h2 className="text-xl font-semibold mb-2">
                                    {group.name}
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    {group.description}
                                </p>
                                <div className="bg-[#FDEDE7] border border-[#F26416] text-[#F26416] px-3 py-2 rounded text-sm mb-4">
                                    <p>
                                        <strong>Kode:</strong> {group.code}
                                    </p>
                                </div>
                                <div className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            navigate(`/group/${group.id}`)
                                        }
                                    >
                                        Se annonser
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {joinedGroupsLoading ? (
                <div className="bg-white rounded-lg shadow p-6 flex justify-center">
                    <p>Laster grupper du deltar i...</p>
                </div>
            ) : joinedGroups.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">
                        Ingen grupper å vise ennå. Bli med i en gruppe for å
                        komme i gang.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {joinedGroups.map((group) => (
                        <div
                            key={group.id}
                            className="bg-white rounded-lg shadow overflow-hidden"
                        >
                            <div className="p-5">
                                <h2 className="text-xl font-semibold mb-2">
                                    {group.name}
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    {group.description}
                                </p>
                                <div className="bg-[#FDEDE7] border border-[#F26416] text-[#F26416] px-3 py-2 rounded text-sm mb-4">
                                    <p>
                                        <strong>Kode:</strong> {group.code}
                                    </p>
                                </div>
                                <div className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            navigate(`/group/${group.id}`)
                                        }
                                    >
                                        Se annonser
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
