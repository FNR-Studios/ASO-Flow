import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ClipboardList, Edit } from "lucide-react"

import { getJobRoleByIdAction } from "@/src/modules/operacional/services/jobRoleService"
import { getExamProtocolsByJobRoleAndTypeAction } from "@/src/modules/operacional/services/examProtocolService"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

export const metadata: Metadata = {
  title: "Visualizar Protocolo | ASO Flow",
}

interface PageProps {
  searchParams: Promise<{ jobRoleId: string; examType: string }>
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  ADMISSONAL: "Admissional",
  PERIODICO: "Periódico",
  DEMISSIONAL: "Demissional",
  RETORNO: "Retorno ao Trabalho",
  MUDANCA: "Mudança de Função",
}

export default async function VisualizarProtocoloPage({ searchParams }: PageProps) {
  const { jobRoleId, examType } = await searchParams

  if (!jobRoleId || !examType) notFound()

  const [jobRole, protocols] = await Promise.all([
    getJobRoleByIdAction(jobRoleId),
    getExamProtocolsByJobRoleAndTypeAction(jobRoleId, examType)
  ])

  if (!jobRole) notFound()

  const validProtocols = Array.isArray(protocols) ? protocols : []

  return (
    <div className="max-w-5xl mx-auto space-y-6 w-full p-4">
      <Link href="/operacional/protocolos">
        <Button variant="ghost" className="mb-2 pl-0 hover:bg-white/10 hover:cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Protocolos
        </Button>
      </Link>

      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ClipboardList className="w-8 h-8 text-blue-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Protocolo: {jobRole.title}</h1>
            <p className="text-muted-foreground">
              Exames definidos para o tipo: <span className="font-semibold text-foreground">{EXAM_TYPE_LABELS[examType] || examType}</span>
            </p>
          </div>
        </div>

        <Link href={`/operacional/protocolos/editar?jobRoleId=${jobRoleId}&examType=${examType}`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Editar Protocolo
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exames Exigidos</CardTitle>
        </CardHeader>
        <CardContent>
          {validProtocols.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Tipo de Exame</TableHead>
                    <TableHead>Periodicidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validProtocols.map((p: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{p.procedures?.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                          {EXAM_TYPE_LABELS[p.exam_type] || p.exam_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        {p.periodic_months ? `${p.periodic_months} meses` : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg text-slate-400">
              Nenhum exame configurado para este protocolo.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
