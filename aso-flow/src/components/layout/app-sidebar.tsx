import Link from "next/link"
import { redirect } from "next/navigation"
import { 
  LayoutDashboard, Users, Settings, Briefcase, 
  DollarSign, Activity, LogOut, User as UserIcon,
  ClipboardList, BriefcaseBusiness 
} from "lucide-react"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/src/components/ui/sidebar"
import { createClient } from "@/src/lib/supabase/server"

// Estrutura atualizada: Array de módulos em vez de lista plana
const menuModules = [
  {
    label: "Geral",
    items: [
      { title: "Início", url: "/home", icon: LayoutDashboard },
    ]
  },
  {
    label: "Comercial",
    items: [
      { title: "Clientes", url: "/comercial/clientes", icon: Briefcase },
      { title: "Financeiro", url: "/financeiro", icon: DollarSign },
    ]
  },
  {
    label: "Operacional",
    items: [
      { title: "Exames", url: "/operacional/procedimentos", icon: Activity },
      { title: "Cargos", url: "/operacional/cargos", icon: BriefcaseBusiness },
      { title: "Protocolos", url: "/operacional/protocolos", icon: ClipboardList },
    ]
  },
  {
    label: "Administrativo",
    items: [
      { title: "Equipe", url: "/admin/equipe", icon: Users },
      { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
    ]
  }
]

export async function AppSidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function signOutAction() {
    'use server'
    const supabaseAction = await createClient()
    await supabaseAction.auth.signOut()
    redirect("/login")
  }

  return (
    <Sidebar>
      {/* CABEÇALHO */}
      <SidebarHeader className="p-4 border-b bg-primary text-primary-foreground">
        <h2 className="text-xl font-bold tracking-tight">ASO Flow</h2>
      </SidebarHeader>

      {/* CONTEÚDO PRINCIPAL - Agora renderiza por módulos */}
      <SidebarContent>
        {menuModules.map((module) => (
          <SidebarGroup key={module.label}>
            {/* O label do módulo (ex: "Comercial", "Operacional") */}
            <SidebarGroupLabel className="mt-2">{module.label}</SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu>
                {module.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* RODAPÉ */}
      <SidebarFooter className="border-t p-2 bg-foreground text-primary-foreground">
        {user && (
          <div className="flex items-center gap-3 p-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary bg-white">
              <UserIcon className="h-4 w-4 " />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">Minha Conta</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <form action={signOutAction}>
              <SidebarMenuButton 
                type="submit" 
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair da conta</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}