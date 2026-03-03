import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar"
import { AppSidebar } from "@/src/components/layout/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full relative">
        {/* O SidebarTrigger é o botão que abre/fecha a sidebar (útil no mobile) */}
        <div className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px]">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-sm font-medium text-muted-foreground">Painel</h1>
          </div>
        </div>
        
        <div className="p-4 sm:px-6 md:p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}