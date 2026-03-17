"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/src/components/ui/button"
import { ArrowUpDown, Eye } from "lucide-react"
import Link from "next/link"

export type AttendanceData = {
  id: string
  exam_type: string
  attendance_date: string
  status: string
  result: string
  employee_name: string
  employee_cpf: string
  client_name: string
}

export const columns: ColumnDef<AttendanceData>[] = [
  {
    accessorKey: "attendance_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateStr = row.getValue("attendance_date") as string
      // Formata "yyyy-mm-dd" para "dd/mm/yyyy"
      const dateObj = new Date(dateStr)
      // Ajuste timezone local para evitar erro de dia anterior
      const dateLocal = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000)
      return dateLocal.toLocaleDateString("pt-BR")
    },
  },
  {
    accessorKey: "employee_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Paciente (Funcionário)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("employee_name") as string
      const cpf = row.original.employee_cpf
      // Format CPF
      const formattedCpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      
      return (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">{formattedCpf}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "client_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Empresa
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "exam_type",
    header: "Tipo",
  },
  {
    accessorKey: "result",
    header: "Resultado",
    cell: ({ row }) => {
      const result = row.getValue("result") as string
      if (result === "APTO") return <span className="text-emerald-600 font-medium">Apto</span>
      if (result === "INAPTO") return <span className="text-red-600 font-medium">Inapto</span>
      if (result === "APTO_RESTRICAO") return <span className="text-orange-600 font-medium">Apto s/ Restrições</span>
      return <span className="text-muted-foreground">Pendente</span>
    }
  },
  {
    accessorKey: "status",
    header: () => <div className="font-bold">Status Faturamento</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      
      let badgeStyle = "bg-zinc-100 text-zinc-600"
      if (status === "CONCLUIDO") badgeStyle = "bg-blue-100 text-blue-700"
      if (status === "FATURADO") badgeStyle = "bg-emerald-100 text-emerald-700"
      if (status === "ABERTO") badgeStyle = "bg-orange-100 text-orange-700"

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
      const attendance = row.original

      return (
        <Link href={`/operacional/atendimentos/${attendance.id}`}>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
      )
    },
  },
]
