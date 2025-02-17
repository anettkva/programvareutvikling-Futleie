import { Inbox, Search, User, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Cookie from "js-cookie"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import logoFutleie from "@/assets/logoFutleie.svg"

// Menu items
const items = [
  { title: "Meldinger", url: "/messages", icon: Inbox },
  { title: "Søk", url: "/search", icon: Search },
  { title: "Profil", url: "/profile", icon: User },
]

export function AppSidebar() {
  const navigate = useNavigate();
  const userCookie = Cookie.get("user");
  const username = userCookie ? JSON.parse(userCookie).username : "";

  const handleLogout = () => {
    Cookie.remove("user");
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup>
          <SidebarGroupContent className="-mt-8">
            <SidebarMenu>
              <div className="flex items-center justify-left w-full -mb-8 ml-1 ">
                <a href="/">
                  <img src={logoFutleie} alt="Futleie" className="w-32 h-32" />
                </a>
              </div>
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
          <div className="mt-auto mb-4">
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
  )
}