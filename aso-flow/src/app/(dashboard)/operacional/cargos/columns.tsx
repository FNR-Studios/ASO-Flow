"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/src/components/ui/button"
import { ArrowUpDown, Pencil } from "lucide-react"
import Link from "next/link"

export type JobRoleData = {
  id: string;
  title: string;
  cbo_code: string;
  description: string;
  client_name: string;
}

export const columns: ColumnDef<JobRoleData>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => {
            return(
                <Button variant="ghost" className="pl-0 text-left font-bold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Título
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
    },
    {
        accessorKey : "cbo_code",
        header: () => <div className="font-bold">Código CBO</div>,
        cell: ({ row }) => {
            const type = row.getValue("cbo_code") as string
            if (!type) return "-"
            return <div className="capitalize">{type}</div> 
        }
    },
    {
        accessorKey : "description",
        header: () => <div className="font-bold">Descrição</div>,
        cell: ({ row }) => {
            const type = row.getValue("description") as string
            if (!type) return "-"
            return <div className="capitalize">{type}</div> 
        }
    },
    {
        // 2. Aqui a tabela puxa direto a chave "client_name" que o servidor enviou
        accessorKey : "client_name", 
        header: () => <div className="font-bold">Cliente</div>,
        cell: ({ row }) => {
            const name = row.getValue("client_name") as string
            return <div>{name || "-"}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
          const roleId = row.original.id // Pega o ID que adicionamos no tipo ali em cima
          return (
            <div className="flex gap-2 justify-end">
              {/* Lembrete: Mudei de "procedimentos" para "cargos" no link */}
              <Link href={`/operacional/cargos/${roleId}`}>
                <Button variant="ghost" size="icon" title="Editar">
                  <Pencil className="h-4 w-4 text-slate-600" />
                </Button>
              </Link>
            </div>
          )
        }
      }
]