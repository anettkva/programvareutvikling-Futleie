import {
    Inbox,
    Search,
    User,
    LogOut,
    History,
    ReceiptText,
    UserRoundCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

import logoFutleie from "@/assets/logoFutleie.svg";
import logoFutleieMini from "@/assets/Futleie Mini Logo.svg";
import { useEffect, useState } from "react";
import supabaseClient from "@/supabaseClient";

// Menu items
const menuItems = [
    { title: "Meldinger", url: "/messages", icon: Inbox },
    { title: "Søk", url: "/search", icon: Search },
    { title: "Profil", url: "/profile", icon: User },
    { title: "Historikk", url: "/historikk", icon: History },
    { title: "Bookinger", url: "/manage-rentals", icon: ReceiptText },
];

export function AppSidebar() {
    const navigate = useNavigate();
    const { state } = useSidebar();
    const userCookie = Cookie.get("user");
    const username = userCookie ? JSON.parse(userCookie).username : "";
    const [items, setItems] = useState(menuItems);

    const handleLogout = () => {
        Cookie.remove("user");
        navigate("/login");
    };

    useEffect(() => {
        async function checkIsAdmin() {
            const userId = userCookie ? JSON.parse(userCookie).id : null;
            if (userId) {
                const { data, error } = await supabaseClient
                    .from("Users")
                    .select()
                    .eq("id", userId)
                    .single();
                if (error) {
                    console.log("Error fetching user");
                } else {
                    if (
                        data.admin &&
                        !items.some((item) => item.title === "Admin")
                    ) {
                        setItems([
                            ...items,
                            {
                                title: "Admin",
                                url: "/admin",
                                icon: UserRoundCog,
                            },
                        ]);
                    }
                }
            }
        }
        checkIsAdmin();
    }, [userCookie, items]);

    return (
        <Sidebar collapsible="icon">
            <SidebarContent className="flex flex-col h-full">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem className="mb-1 pt-1">
                                <a
                                    href="/"
                                    className="flex items-center w-full justify-start pl-2 h-14"
                                >
                                    <img
                                        src={
                                            state === "collapsed"
                                                ? logoFutleieMini
                                                : logoFutleie
                                        }
                                        alt="Futleie"
                                        className={`object-contain ${
                                            state === "collapsed"
                                                ? "w-8 h-auto -ml-1"
                                                : "w-28 h-auto"
                                        }`}
                                    />
                                </a>
                            </SidebarMenuItem>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Logout button at the bottom */}
                {username && (
                    <div className="mt-auto mb-4 ml-2 mr-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleLogout}>
                                    <LogOut />
                                    <span>Logg ut: @{username}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </div>
                )}
            </SidebarContent>
        </Sidebar>
    );
}
