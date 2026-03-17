"use client"

import { useAttendances } from "@/src/modules/operacional/hooks/use-attendances"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import { DataTable } from "@/src/components/ui/data-table"
import { columns } from "./columns"

export default function AtendimentosPage() {
  const { data: attendances, isLoading, isError, error } = useAttendances()

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando guias de atendimento...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <h3 className="font-bold text-lg mb-2">Erro ao carregar atendimentos:</h3>
          <pre className="whitespace-pre-wrap text-sm font-mono mt-2 p-2 bg-red-100 rounded">
            {error?.message || "Ocorreu um erro no banco de dados. Olhe o terminal."}
          </pre>
          <p className="mt-4 text-sm">Por favor, me envie esse erro completo para que eu possa corrigir o schema.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Atendimentos / ASO</h1>
          <p className="text-muted-foreground">
            Registro de exames e emissão de Atestados de Saúde Ocupacional.
          </p>
        </div>
        <Link href="/operacional/atendimentos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Guia ASO
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={attendances || []}
        searchKey="employee_name"
        searchPlaceHolder="Pesquisar por paciente..."
      />
    </div>
  )
}
