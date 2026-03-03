"use client"

import { useProcedures } from "@/src/modules/operacional/hooks/use-procedures"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import { DataTable } from "@/src/components/ui/data-table"
import { columns } from "./columns" 

export default function ExamePage() {
  const { data: procedures, isLoading, isError } = useProcedures()

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando catálogo de exames...</span>
      </div>
    )
  }

  if (isError) {
    return <div className="text-red-500">Erro ao carregar os exames.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogo de Exames</h1>
          <p className="text-muted-foreground">
            Gerencie os procedimentos, exames e valores base do sistema.
          </p>
        </div>
        <Link href="/operacional/procedimentos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Exame
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={procedures || []} searchKey="name" searchPlaceHolder="Pesquisar por nome..." />

    </div>
  )
}