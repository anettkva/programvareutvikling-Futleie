import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <main className="flex-1 p-6 bg-gray-100 overflow-auto w-full">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}