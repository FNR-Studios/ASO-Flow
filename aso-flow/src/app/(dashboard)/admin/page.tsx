import { Metadata } from "next"
import { getOrganizationAction } from "@/src/modules/admin/services/organizationService"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"

export const metadata: Metadata = {
  title: "Configurações da Empresa",
}

export default async function SettingsPage() {
  // Busca os dados diretamente no servidor antes de renderizar a tela
  const organization = await getOrganizationAction()

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administrador</h1>
        <p className="text-muted-foreground">
          Opções disponíveis:
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-left">
        <Link href="/admin/configuracoes">
          <Button className="w-full sm:w-44 h-12 hover:bg-[#2a5e59] text-white font-bold text-md shadow-lg shadow-emerald-900/20 transition-all hover:scale-105">
            Minha Organização
          </Button>
        </Link>

        <Link href="/admin/equipe">
          <Button className="w-full sm:w-44 h-12 hover:bg-[#2a5e59] text-white font-bold text-md shadow-lg shadow-emerald-900/20 transition-all hover:scale-105">
            Minha Equipe
          </Button>
        </Link>

      </div>


    </div>
  )
}