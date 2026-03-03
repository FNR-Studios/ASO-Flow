"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/src/components/ui/button"
import { ArrowUpDown, Pencil } from "lucide-react" // Mudei o Eye para Pencil (faz mais sentido para editar)
import Link from "next/link"

export type ProcedureData = {
    id: string
    name: string
    type: "clinico" | "laboratorial" | "imagem" | "outros" | null // corrigido "clinito"
    base_price: number
    tuss_code: string | null
}

export const columns: ColumnDef<ProcedureData>[] = [ // Coloquei no plural "columns", é o padrão
    {
        accessorKey: "name",
        header: ({ column }) => {
            return(
                <Button variant="ghost" className="pl-0 text-left font-bold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Nome
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
    },
    {
        accessorKey : "type",
        header: () => <div className="font-bold">Tipo</div>,
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            if (!type) return "-"
    
            return <div className="capitalize">{type}</div> 
        }
    },
    {
        accessorKey : "base_price",
        header: () => <div className="font-bold">Preço Base</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("base_price"))
            
            const formatted = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
            }).format(amount)
            
            return <div className="font-medium">{formatted}</div>
        }
    },
    {
        accessorKey : "tuss_code",
        header: () => <div className="font-bold">Código TUSS</div>,
        cell: ({ row }) => {
            const code = row.getValue("tuss_code") as string
            return <div>{code || "-"}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
          const procedureID = row.original.id
          return (
            <div className="flex gap-2 justify-end">
              <Link href={`/operacional/procedimentos/${procedureID}`}>
                <Button variant="ghost" size="icon" title="Editar">
                  <Pencil className="h-4 w-4 text-slate-600" />
                </Button>
              </Link>
            </div>
          )
        }
      }
]