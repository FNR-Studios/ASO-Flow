import { Metadata } from "next"
import { getOrganizationAction } from "@/src/modules/admin/services/organizationService"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { LayoutDashboard, Settings, Users, ArrowRight, Building2, Handshake, SquareActivity } from "lucide-react"
import { getSessionUser, getUserName } from "@/src/modules/auth/services/authService"

export const metadata: Metadata = {
  title: "Início | ASO Flow",
}

export default async function HomePage() {
  const organization = await getOrganizationAction()

  const user = await getSessionUser()

  const hour = new Date().getHours()
  let greeting = "Bom dia"

  if (hour >= 12 && hour < 18) {
    greeting = "Boa tarde"
  } else if (hour >= 18 || hour < 5) {
    greeting = "Boa noite"
  }

  const fullName = await getUserName() || ""
  const firstName = fullName.split(' ')[0]
  const id = user?.id

  return (
    <div className="flex-1 w-full bg-zinc">
      {/* Header de Boas-vindas Interno */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              {greeting} <span className="font-bold text-zinc-900">{firstName}</span>!
              </h1>
              <p className="text-zinc-500 mt-1">  
                Bem-vindo ao painel do <span className="font-semibold text-[#357670]">{organization?.name || "seu sistema"} 
                </span>
              </p>
            </div>

            {/* Badge da Empresa (Opcional) */}
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-100 rounded-lg border border-zinc-200 w-fit">
              <Building2 size={20} className="text-zinc-400" />
              <div className="text-sm">
                <p className="text-zinc-400 text-[10px] uppercase font-bold leading-none">Empresa Ativa</p>
                <p className="font-bold text-zinc-700">{organization?.corporate_name || "Sem organzização..."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            Serviços Disponíveis
          </h2>
        </div>

        {/* Grid de Serviços/Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card de Administração */}
          <Link href="/admin" className="group">
            <div className="h-full p-6 bg-white rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md hover:border-[#357670]/30 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-50 rounded-lg text-[#357670] group-hover:bg-[#357670] group-hover:text-white transition-colors">
                  <Settings size={24} />
                </div>
                <ArrowRight size={20} className="text-zinc-300 group-hover:text-[#357670] transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-zinc-800 mb-2">Administração</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Gerencie configurações da empresa, usuários, permissões e dados estruturais do sistema.
              </p>
            </div>
          </Link>

          {/* Card Comercial*/}
          <Link href="/comercial" className="group">
            <div className="h-full p-6 bg-white rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md hover:border-[#357670]/30 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-50 rounded-lg text-[#357670] group-hover:bg-[#357670] group-hover:text-white transition-colors">
                  <Handshake size={24} />
                </div>
                <ArrowRight size={20} className="text-zinc-300 group-hover:text-[#357670] transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-zinc-800 mb-2">Comercial</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Gerencie seus clientes, procedimentos e tabelas de preços.
              </p>
            </div>
          </Link>

          {/* Card Operacional*/}
          <Link href="/operacional" className="group">
            <div className="h-full p-6 bg-white rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md hover:border-[#357670]/30 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-50 rounded-lg text-[#357670] group-hover:bg-[#357670] group-hover:text-white transition-colors">
                  <SquareActivity size={24} />
                </div>
                <ArrowRight size={20} className="text-zinc-300 group-hover:text-[#357670] transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-zinc-800 mb-2">Operacional</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Gerencie seus exames e procedimentos, PCMSO, cadastre cargos e funcionarios.
              </p>
            </div>
          </Link>

          {/* Outro Placeholder (Ex: Dashboard) */}
          <div className="p-6 bg-white/50 rounded-xl border border-dashed border-zinc-300 flex flex-col items-center justify-center text-center opacity-60">
            <div className="p-3 bg-zinc-100 rounded-lg text-zinc-400 mb-4">
              <LayoutDashboard size={24} />
            </div>
            <h3 className="text-sm font-bold text-zinc-400">Em Breve</h3>
            <p className="text-xs text-zinc-400 mt-1">Relatórios e Métricas</p>
          </div>

        </div>

        {/* Botão de Suporte ou Ação Rápida no Rodapé da Main */}
        <div className="mt-12 p-8 bg-gradient-to-r from-[#357670] to-[#2a5e59] rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <h3 className="text-xl font-bold">Precisa de ajuda com a plataforma?</h3>
            <p className="text-emerald-50/80 text-sm">Acesse nossa central de ajuda ou fale com um consultor.</p>
          </div>
          <Button variant="secondary" className="bg-white text-[#357670] hover:bg-emerald-50 font-bold px-8 h-12 rounded-full">
            Suporte Técnico
          </Button>
        </div>
      </main>
    </div>
  )
}