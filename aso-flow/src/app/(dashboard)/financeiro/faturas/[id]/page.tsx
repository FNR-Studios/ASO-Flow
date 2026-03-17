import { notFound } from "next/navigation"
import { getInvoiceByIdAction } from "@/src/modules/financeiro/services/invoiceService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft, Printer, ExternalLink } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

export default async function VisualizarFaturaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const invoice = await getInvoiceByIdAction(id)

  if (!invoice) {
    notFound()
  }

  const dueDateObj = new Date(invoice.due_date)
  const dueDateLocal = new Date(dueDateObj.getTime() + dueDateObj.getTimezoneOffset() * 60000)
  const formattedDueDate = dueDateLocal.toLocaleDateString("pt-BR")

  const [year, month] = invoice.reference_month.split("-")
  const formattedRefMonth = `${month}/${year}`

  const amountFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(invoice.total_amount)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/financeiro/faturas">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Faturas
          </Button>
        </Link>
        <div className="space-x-2">
          {invoice.external_link && (
             <Button variant="outline" asChild>
                <a href={invoice.external_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Boleto
                </a>
             </Button>
          )}
          <Link href={`/financeiro/faturas/${invoice.id}/imprimir`}>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir / PDF
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Fatura de Serviços</CardTitle>
            <CardDescription>Resumo dos ASOs emitidos no período</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold text-muted-foreground block">Cliente</span>
                <span className="text-lg">{invoice.clients?.trade_name}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground block">CNPJ / CPF</span>
                <span>{invoice.clients?.cnpj}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground block">Mês de Referência</span>
                <span>Competência {formattedRefMonth}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground block">Vencimento</span>
                <span className="font-medium text-red-600">{formattedDueDate}</span>
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
              <span className="text-muted-foreground">Situação</span>
              <span className={`px-2 py-1 rounded-full font-bold ${
                invoice.status === 'PAGA' ? 'bg-emerald-100 text-emerald-700' :
                invoice.status === 'CANCELADA' ? 'bg-red-100 text-red-700' :
                invoice.status === 'EMITIDA' ? 'bg-blue-100 text-blue-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {invoice.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground font-semibold">Valor Total</span>
              <span className="font-bold text-lg">{amountFormatted}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atendimentos (ASOs) do Período</CardTitle>
          <CardDescription>Esta é a relação de exames cobertos por esta fatura.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoice.clinical_records && invoice.clinical_records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Paciente (Funcionário)</TableHead>
                  <TableHead>Tipo de Exame</TableHead>
                  <TableHead>Status ASO</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.clinical_records.map((record: any) => {
                  const rDateObj = new Date(record.exam_date)
                  const rDateLocal = new Date(rDateObj.getTime() + rDateObj.getTimezoneOffset() * 60000)
                  return (
                    <TableRow key={record.id}>
                      <TableCell>{rDateLocal.toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{record.employees?.name}</span>
                          <span className="text-xs text-muted-foreground">{record.employees?.cpf}</span>
                        </div>
                      </TableCell>
                      <TableCell>{record.exam_type}</TableCell>
                      <TableCell>
                        <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                           {record.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                         <Link href={`/operacional/atendimentos/${record.id}`}>
                           <Button variant="ghost" size="sm">Ver ASO</Button>
                         </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-md">
              Nenhum atendimento associado a esta fatura ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
