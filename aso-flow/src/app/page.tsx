import { checkDatabaseConnection } from "@/src/server/db/test-connection"
import { Button } from "../components/ui/button"
import Link from "next/link"
import { Database, ArrowRight, ShieldCheck } from "lucide-react"
import { Header } from "../components/layout/Header"
import { Footer } from "../components/layout/Footer"

export default async function Home() {
  const status = await checkDatabaseConnection()

  return (
    <>
    <Header />
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
      

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Seção de Texto Hero */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} />
            Gestão de Saúde Ocupacional
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-zinc-900 tracking-tight">
            ASO <span className="text-[#357670]">Flow</span>
          </h1>
          <p className="text-zinc-600 text-lg max-w-md mx-auto">
            A plataforma inteligente para automação e controle de exames médicos ocupacionais.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/login">
            <Button className="w-full sm:w-44 h-12 bg-[#357670] hover:bg-[#2a5e59] text-white font-bold text-md shadow-lg shadow-emerald-900/20 transition-all hover:scale-105">
              Acessar Sistema
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="w-full sm:w-44 h-12 border-zinc-300 text-zinc-700 font-bold text-md hover:bg-zinc-100 transition-all">
              Criar Conta
            </Button>
          </Link>
        </div>

        {/* Status do Banco de Dados - Estilizado como Card de Dev */}
        <div className="w-full max-w-md bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={16} className={status.success ? 'text-emerald-500' : 'text-red-500'} />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">System Status</span>
            </div>
            <div className={`h-2 w-2 rounded-full animate-pulse ${status.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="p-4">
            <h2 className="font-semibold text-zinc-800 flex items-center gap-2">
              Conexão com Banco de Dados
            </h2>
            <p className={`text-sm mt-1 ${status.success ? 'text-emerald-600' : 'text-red-600'}`}>
              {status.message}
            </p>
            {status.user && (
              <code className="block mt-3 p-2 bg-zinc-900 text-zinc-400 rounded text-[10px] font-mono">
                Active User: {status.user}
              </code>
            )}
            {!status.success && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <p className="text-xs text-red-700 font-medium leading-relaxed">
                  ⚠️ Erro de configuração: Verifique as variáveis de ambiente no arquivo <span className="font-bold">.env.local</span>.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
    <Footer />
    </>
  )
}