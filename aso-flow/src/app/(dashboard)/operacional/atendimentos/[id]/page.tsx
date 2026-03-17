import { notFound } from "next/navigation"
import { getAttendanceByIdAction } from "@/src/modules/operacional/services/attendanceService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

export default async function VisualizarAtendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const attendance = await getAttendanceByIdAction(id)

  if (!attendance) {
    notFound()
  }

  const dateObj = new Date(attendance.attendance_date)
  const dateLocal = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000)
  const formattedDate = dateLocal.toLocaleDateString("pt-BR")

  const total = attendance.items.reduce((acc: number, item: any) => acc + Number(item.price_charged), 0)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/operacional/atendimentos">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Atendimentos
          </Button>
        </Link>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir ASO (Em breve)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Atestado de Saúde Ocupacional</CardTitle>
            <CardDescription>Visualização da guia nº {attendance.id.split("-")[0]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold text-muted-foreground block">Paciente</span>
                <span className="text-lg">{attendance.employees?.full_name}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground block">CPF</span>
                <span>{attendance.employees?.cpf}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground block">Empresa</span>
                <span>{attendance.employees?.clients?.trade_name}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground block">Cargo</span>
                <span>{attendance.employees?.job_roles?.title}</span>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-4">
               <div>
                <span className="text-sm font-semibold text-muted-foreground block">Data do Exame</span>
                <span>{formattedDate}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground block">Tipo de Exame</span>
                <span>{attendance.exam_type}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground block">Médico Examinador</span>
                <span>{attendance.examiner_doctor || "Não informado"}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground block">Conclusão</span>
                <span className="font-bold text-emerald-600">{attendance.result || "Pendente"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Faturamento</span>
              <span className="px-2 py-1 bg-zinc-100 rounded-full font-medium">
                {attendance.status}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro e Procedimentos</CardTitle>
          <CardDescription>Snapshot dos preços cobrados no dia da emissão.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedimento Realizado</TableHead>
                <TableHead className="text-right">Valor Cobrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.procedures?.name}</TableCell>
                  <TableCell className="text-right">R$ {Number(item.price_charged).toFixed(2).replace(".", ",")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end">
            <div className="text-xl font-bold bg-muted p-4 rounded-md">
              Total Faturado: R$ {total.toFixed(2).replace(".", ",")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
