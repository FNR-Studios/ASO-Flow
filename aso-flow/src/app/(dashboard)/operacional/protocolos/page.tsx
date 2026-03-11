import { Metadata } from "next"
import Link from "next/link"
import { Plus, ClipboardList } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { DataTable } from "@/src/components/ui/data-table"
import { getExamProtocolsAction } from "@/src/modules/operacional/services/examProtocolService"
import { columns, ProtocolColumn } from "./columns"

export const metadata: Metadata = {
  title: "Protocolos de Exame | ASO Flow",
}

export default async function ProtocolosPage() {
  const protocolsRaw = await getExamProtocolsAction()
  
  // Agrupar protocolos por (job_role_id + exam_type)
  const groupedProtocols: Record<string, ProtocolColumn> = {}
  
  if (Array.isArray(protocolsRaw)) {
    protocolsRaw.forEach((p: any) => {
      const key = `${p.job_role_id}-${p.exam_type}`
      if (!groupedProtocols[key]) {
        groupedProtocols[key] = {
          job_role_id: p.job_role_id,
          job_role_title: p.job_roles?.title || "Desconhecido",
          client_name: p.job_roles?.clients?.trade_name || "Sem Cliente",
          exam_type: p.exam_type,
          procedure_count: 0
        }
      }
      
      groupedProtocols[key].procedure_count += 1
    })
  }

  const data = Object.values(groupedProtocols)

  return (
    <div className="flex-1 flex flex-col p-8 gap-4 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between pb-6 border-b">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ClipboardList className="w-8 h-8 text-blue-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Protocolos de Exame</h1>
            <p className="text-muted-foreground">
              Gerencie os protocolos de exames exigidos para cada cargo e tipo de exame.
            </p>
          </div>
        </div>

        <Link href="/operacional/protocolos/novo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Novo Protocolo
          </Button>
        </Link>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
