import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/src/components/ui/sidebar"
  import { LayoutDashboard, Users, Settings, Briefcase, DollarSign, Activity } from "lucide-react"
  
  // Seus menus
  const items = [
    { title: "Início", url: "/home", icon: LayoutDashboard },
    { title: "Comercial", url: "/comercial/clientes", icon: Briefcase },
    { title: "Operacional", url: "/operacional", icon: Activity },
    { title: "Financeiro", url: "/financeiro", icon: DollarSign },
    { title: "Equipe", url: "/admin/equipe", icon: Users },
    { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
  ]
  
  export function AppSidebar() {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>ASO Flow</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
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
        </SidebarContent>
      </Sidebar>
    )
  }