"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/src/components/ui/button"
import { MoreHorizontal, Eye, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import Link from "next/link"

export type ProtocolColumn = {
  job_role_id: string
  job_role_title: string
  client_name: string
  exam_type: string
  procedure_count: number
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  ADMISSONAL: "Admissional",
  PERIODICO: "Periódico",
  DEMISSIONAL: "Demissional",
  RETORNO: "Retorno",
  MUDANCA: "Mudança",
}

export const columns: ColumnDef<ProtocolColumn>[] = [
  {
    accessorKey: "client_name",
    header: "Cliente",
    cell: ({ row }) => <div className="font-medium">{row.getValue("client_name")}</div>,
  },
  {
    accessorKey: "job_role_title",
    header: "Cargo",
  },
  {
    accessorKey: "exam_type",
    header: "Tipo de Exame",
    cell: ({ row }) => {
      const type = row.getValue("exam_type") as string
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
          {EXAM_TYPE_LABELS[type] || type}
        </span>
      )
    },
  },
  {
    accessorKey: "procedure_count",
    header: "Qtd. Exames",
    cell: ({ row }) => <div className="text-center">{row.getValue("procedure_count")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const protocol = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/operacional/protocolos/visualizar?jobRoleId=${protocol.job_role_id}&examType=${protocol.exam_type}`}>
                <Eye className="mr-2 h-4 w-4" /> Visualizar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/operacional/protocolos/editar?jobRoleId=${protocol.job_role_id}&examType=${protocol.exam_type}`}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
