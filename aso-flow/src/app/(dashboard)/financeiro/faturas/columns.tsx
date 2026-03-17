"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/src/components/ui/button"
import { ArrowUpDown, Eye } from "lucide-react"
import Link from "next/link"

export type InvoiceData = {
  id: string
  reference_month: string
  issue_date: string | null
  due_date: string
  total_amount: number
  status: string
  client_name: string
  client_cnpj: string
}

export const columns: ColumnDef<InvoiceData>[] = [
  {
    accessorKey: "client_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("client_name") as string
      const doc = row.original.client_cnpj
      return (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">{doc}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "reference_month",
    header: "Ref.",
    cell: ({ row }) => {
      const dateStr = row.getValue("reference_month") as string
      // Extrair YYYY-MM
      const [year, month] = dateStr.split("-")
      return <span className="font-medium">{month}/{year}</span>
    },
  },
  {
    accessorKey: "due_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vencimento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateStr = row.getValue("due_date") as string
      const dateObj = new Date(dateStr)
      const dateLocal = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000)
      return dateLocal.toLocaleDateString("pt-BR")
    },
  },
  {
    accessorKey: "total_amount",
    header: () => <div className="text-right">Valor Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"))
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="font-bold">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      
      let badgeStyle = "bg-zinc-100 text-zinc-600"
      if (status === "RASCUNHO") badgeStyle = "bg-orange-100 text-orange-700"
      if (status === "EMITIDA") badgeStyle = "bg-blue-100 text-blue-700"
      if (status === "PAGA") badgeStyle = "bg-emerald-100 text-emerald-700"
      if (status === "CANCELADA") badgeStyle = "bg-red-100 text-red-700"

      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}
        >
          {status}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original

      return (
        <Link href={`/financeiro/faturas/${invoice.id}`}>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
      )
    },
  },
]
