"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/src/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Input } from "@/src/components/ui/input"
import { toast } from "sonner"
import { Loader2, Search } from "lucide-react"
import { createInvoiceAction } from "../services/invoiceService"
import { getUninvoicedRecordsAction } from "../services/invoiceFetchService"
import { Card, CardContent } from "@/src/components/ui/card"
import { Checkbox } from "@/src/components/ui/checkbox"

const invoiceSchema = z.object({
  client_id: z.string().uuid("Selecione um cliente válido."),
  reference_month: z.string().min(1, "O mês de referência é obrigatório."),
  due_date: z.string().min(1, "A data de vencimento é obrigatória."),
  total_amount: z.number().min(0, "O valor não pode ser negativo."),
  external_link: z.string().url("Insira um link válido iniciado por http:// ou https://").optional().or(z.literal("")),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface Client {
  id: string
  trade_name: string
  cnpj: string
}

interface RecordData {
  id: string
  exam_type: string
  exam_date: string
  employee_name: string
  employee_cpf: string
  total_calculated_value: number
}

interface InvoiceFormProps {
  clients: Client[]
}

export function InvoiceForm({ clients }: InvoiceFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // States para a Etapa 2 (Busca e Seleção)
  const [availableRecords, setAvailableRecords] = useState<RecordData[]>([])
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([])
  const [isFetchingRecords, setIsFetchingRecords] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const today = new Date()
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`

  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)
  const defaultDueDate = nextWeek.toISOString().split("T")[0]

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client_id: "",
      reference_month: currentMonthStr,
      due_date: defaultDueDate,
      total_amount: 0,
      external_link: "",
    },
  })

  // Watchers to auto-trigger search when user pushes "Search"
  const currentClientId = form.watch("client_id")
  const currentRefMonth = form.watch("reference_month")

  async function handleSearchRecords() {
    if (!currentClientId || !currentRefMonth) {
      toast.error("Selecione um Cliente e o Mês de Referência para buscar os exames.")
      return
    }

    setIsFetchingRecords(true)
    setHasSearched(true)
    setSelectedRecordIds([]) // Reseta seleções antigas

    try {
      const response = await getUninvoicedRecordsAction(currentClientId, currentRefMonth)
      
      if (response?.error) {
        toast.error(response.error)
        setAvailableRecords([])
      } else {
        setAvailableRecords(response.data || [])
        // Se quisermos que todos venham marcados por padrão:
        // setSelectedRecordIds((response.data || []).map((r: RecordData) => r.id))
      }
    } catch (error) {
       toast.error("Erro inesperado ao buscar exames na base de dados.")
    } finally {
      setIsFetchingRecords(false)
    }
  }

  // Recalcular Total Amount sempre que o `selectedRecordIds` mudar
  useEffect(() => {
    let newTotal = 0
    availableRecords.forEach((record) => {
      if (selectedRecordIds.includes(record.id)) {
        newTotal += record.total_calculated_value
      }
    })
    form.setValue("total_amount", newTotal)
  }, [selectedRecordIds, availableRecords, form])

  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecordIds((prev) => 
      prev.includes(recordId) ? prev.filter(id => id !== recordId) : [...prev, recordId]
    )
  }

  const toggleAll = () => {
    if (selectedRecordIds.length === availableRecords.length) {
      setSelectedRecordIds([]) // desmarca todos
    } else {
      setSelectedRecordIds(availableRecords.map(r => r.id)) // marca todos
    }
  }

  async function onSubmit(data: InvoiceFormValues) {
    if (hasSearched && selectedRecordIds.length === 0) {
       toast.error("Você buscou os exames mas não selecionou nenhum para faturar!")
       return
    }

    setIsLoading(true)
    const serverPayload = {
      ...data,
      status: "RASCUNHO" as const,
      recordIds: selectedRecordIds.length > 0 ? selectedRecordIds : undefined
    }

    try {
      const result = await createInvoiceAction(serverPayload)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Fatura criada com sucesso!")
        router.push("/financeiro/faturas")
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado ao salvar.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* ETAPA 1: DADOS BASE */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">1. Seleção de Cliente e Mês</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa (Cliente)</FormLabel>
                      <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.trade_name} ({client.cnpj})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reference_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mês de Referência</FormLabel>
                      <div className="flex gap-2">
                         <FormControl>
                            <Input className="flex-1" type="month" disabled={isLoading} {...field} />
                         </FormControl>
                         <Button type="button" variant="secondary" onClick={handleSearchRecords} disabled={isFetchingRecords || isLoading}>
                            {isFetchingRecords ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            <span className="ml-2 hidden sm:inline">Buscar Exames</span>
                         </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ETAPA 2: CARRINHO DE EXAMES */}
            {hasSearched && (
               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex justify-between items-center border-b pb-2">
                   <h3 className="text-lg font-semibold">2. Exames Disponíveis para Faturar</h3>
                   <span className="text-sm text-muted-foreground">{availableRecords.length} encontrados</span>
                 </div>

                 {availableRecords.length === 0 ? (
                    <div className="text-center py-8 bg-zinc-50 border border-dashed rounded-lg">
                      <p className="text-muted-foreground">Nenhum exame "CONCLUÍDO" e sem fatura encontrado neste mês para este cliente.</p>
                    </div>
                 ) : (
                    <div className="border rounded-md overflow-hidden">
                       <table className="w-full text-sm text-left">
                          <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b">
                             <tr>
                               <th className="px-4 py-3 w-[50px]">
                                 <Checkbox 
                                    checked={selectedRecordIds.length === availableRecords.length && availableRecords.length > 0} 
                                    onCheckedChange={toggleAll}
                                 />
                               </th>
                               <th className="px-4 py-3">Data</th>
                               <th className="px-4 py-3">Paciente</th>
                               <th className="px-4 py-3">Tipo do Exame</th>
                               <th className="px-4 py-3 text-right">Valor Registrado</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y">
                             {availableRecords.map((record) => {
                               const rDateObj = new Date(record.exam_date)
                               const rDateLocal = new Date(rDateObj.getTime() + rDateObj.getTimezoneOffset() * 60000)
                               const isChecked = selectedRecordIds.includes(record.id)

                               return (
                                 <tr key={record.id} className={`hover:bg-zinc-50 transition-colors cursor-pointer ${isChecked ? 'bg-blue-50/30' : ''}`} onClick={() => toggleRecordSelection(record.id)}>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                       <Checkbox checked={isChecked} onCheckedChange={() => toggleRecordSelection(record.id)} />
                                    </td>
                                    <td className="px-4 py-3">{rDateLocal.toLocaleDateString("pt-BR")}</td>
                                    <td className="px-4 py-3">
                                       <div className="font-medium text-zinc-900">{record.employee_name}</div>
                                       <div className="text-xs text-zinc-500">{record.employee_cpf}</div>
                                    </td>
                                    <td className="px-4 py-3">{record.exam_type}</td>
                                    <td className="px-4 py-3 text-right font-medium text-emerald-700">
                                       {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.total_calculated_value)}
                                    </td>
                                 </tr>
                               )
                             })}
                          </tbody>
                       </table>
                    </div>
                 )}
               </div>
            )}


            {/* ETAPA 3: FINALIZAÇÃO (Vencimento e Valor Final) */}
            <div className="space-y-4">
               <h3 className="text-lg font-semibold border-b pb-2">3. Fechamento da Fatura</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Vencimento</FormLabel>
                        <FormControl>
                          <Input type="date" disabled={isLoading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="external_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link do Boleto/NF (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://gerencianet.com.br/123"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="total_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Total (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            disabled={hasSearched} // Readonly if they are using the automated selection tool
                            className={hasSearched ? "bg-zinc-100 font-bold text-lg text-emerald-700" : ""}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          {hasSearched ? "Calculado automaticamente baseado nos exames selecionados." : "Preenchimento manual habilitado."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-[150px]">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  "Gerar Fatura (Rascunho)"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
