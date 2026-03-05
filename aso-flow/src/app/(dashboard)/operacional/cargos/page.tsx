"use client"

import { useJobRole } from "@/src/modules/operacional/hooks/use-jobRole"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import { DataTable } from "@/src/components/ui/data-table"
import { columns } from "./columns" 

export default function JobRolePage() {
  const { data: jobRole, isLoading, isError } = useJobRole()

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando catálogo de cargos...</span>
      </div>
    )
  }

  if (isError) {
    return <div className="text-red-500">Erro ao carregar cargos.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogo de Cargos</h1>
          <p className="text-muted-foreground">
            Gerencie os cargos disponiveis.
          </p>
        </div>
        <Link href="/operacional/cargos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo cargo
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={jobRole || []} searchKey="title" searchPlaceHolder="Pesquisar por titulo..." />

    </div>
  )
}