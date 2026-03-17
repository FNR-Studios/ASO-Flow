"use client"

import { useState, useEffect } from "react"
import { useForm, useWatch, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

import { createAttendanceAction } from "../services/attendanceService"

// ── Schema Client-size ───────────────────────────────────────────────────────
const attendanceItemSchema = z.object({
  procedure_id: z.string().uuid("Selecione um procedimento"),
  price_charged: z.number().min(0),
})

const attendanceFormSchema = z.object({
  employee_id: z.string().min(1, "Selecione o funcionário."),
  exam_type: z.enum(
    ["ADMISSONAL", "PERIODICO", "DEMISSIONAL", "RETORNO", "MUDANCA"],
    { message: "Selecione o tipo de exame." }
  ),
  attendance_date: z.string().min(1, "A data do atendimento é obrigatória."),
  examiner_doctor: z.string().optional(),
  result: z.enum(["APTO", "INAPTO", "APTO_RESTRICAO"]).optional(),
  validity_date: z.string().optional(),
  status: z.enum(["ABERTO", "CONCLUIDO", "FATURADO"]),
  items: z.array(attendanceItemSchema).min(1, "O atendimento precisa ter pelo menos um exame (item)."),
})

export type AttendanceFormValues = z.infer<typeof attendanceFormSchema>

// ── Tipos de Dados Injetados ──────────────────────────────────────────────────
export type EmployeeInfo = {
  id: string
  full_name: string
  cpf: string
  client_id: string
  job_role_id: string
  client_name: string
  job_role_name: string
}

export type ProcedureInfo = {
  id: string
  name: string
  base_price: number
}

// Representa a tabela de preços customizados do cliente
export type ClientPriceInfo = {
  procedure_id: string
  custom_price: number
}

export type ProtocolInfo = {
  procedure_id: string
  exam_type: string
}

interface AttendanceFormProps {
  employees: EmployeeInfo[]
  procedures: ProcedureInfo[]
  // Mapeamento: Client ID -> Tabela de preços customizados
  clientPricesRecord: Record<string, ClientPriceInfo[]>
  // Mapeamento: Job Role ID -> Protocolos
  jobRoleProtocolsRecord: Record<string, ProtocolInfo[]>
}

export function AttendanceForm({
  employees,
  procedures,
  clientPricesRecord,
  jobRoleProtocolsRecord,
}: AttendanceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      employee_id: "",
      exam_type: undefined,
      attendance_date: new Date().toISOString().split("T")[0],
      examiner_doctor: "",
      result: undefined,
      validity_date: "",
      status: "CONCLUIDO", // Por padrão, lança concluído já que o operador finalizou
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  // Watchers vitais para a reatividade RN-22 e RN-23
  const selectedEmployeeId = useWatch({ control, name: "employee_id" })
  const selectedExamType = useWatch({ control, name: "exam_type" })

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)

  // Função para descobrir o preço correto (RN-23: Preço Cliente > Preço Padrão)
  const getProcedurePrice = (procedureId: string, clientId: string) => {
    // 1. Tenta achar preço customizado do cliente
    const clientPrices = clientPricesRecord[clientId] || []
    const customPriceItem = clientPrices.find(
      (cp) => cp.procedure_id === procedureId
    )
    if (customPriceItem && customPriceItem.custom_price > 0) {
      return customPriceItem.custom_price
    }

    // 2. Fallback para preço base
    const proc = procedures.find((p) => p.id === procedureId)
    return proc ? proc.base_price : 0
  }

  // Efeito reativo (RN-22: Auto-popular itens baseado no Protocolo do Cargo)
  useEffect(() => {
    if (selectedEmployee && selectedExamType) {
      const protocols = jobRoleProtocolsRecord[selectedEmployee.job_role_id] || []
      
      // Filtra protocolos que batem com o tipo de exame ou que são "TODOS"
      const requiredExams = protocols.filter(
        (p) => p.exam_type === selectedExamType || p.exam_type === "TODOS"
      )

      // Se houver itens já adicionados, podemos mesclar ou recriar. 
      // Por padrão, limpa a tabela e carrega do protocolo (evita duplicação ao mudar tipo de exame).
      setValue("items", [])

      requiredExams.forEach((exam) => {
        const price = getProcedurePrice(exam.procedure_id, selectedEmployee.client_id)
        append({ procedure_id: exam.procedure_id, price_charged: price })
      })
    }
  }, [selectedEmployeeId, selectedExamType])

  async function onSubmit(data: AttendanceFormValues) {
    setIsLoading(true)

    const payload = { ...data }

    const response = await createAttendanceAction(payload)

    if (response?.error) {
      toast.error(response.error)
      setIsLoading(false)
      return
    }

    queryClient.invalidateQueries({ queryKey: ["attendances"] })
    toast.success("Guia de Atendimento salva com sucesso!")
    router.push("/operacional/atendimentos")
  }

  const subtotal = fields.reduce((acc, curr) => acc + (curr.price_charged || 0), 0)

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      <Button
        variant="ghost"
        onClick={() => router.push("/operacional/atendimentos")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para a lista
      </Button>

      <form id="attendance-form" onSubmit={handleSubmit(onSubmit)}>
        {/* Passo 1 e 2: O Quem e O Quê */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dados do ASO (Atendimento)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seleção do Funcionário */}
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="employee_id">Funcionário (CPF / Nome)</Label>
                <Select
                  onValueChange={(val) => setValue("employee_id", val, { shouldValidate: true })}
                  value={selectedEmployeeId || ""}
                  disabled={isLoading}
                >
                  <SelectTrigger id="employee_id">
                    <SelectValue placeholder="Selecione um funcionário..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.cpf}) — {emp.client_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employee_id && (
                  <span className="text-sm text-red-500">{errors.employee_id.message}</span>
                )}
              </div>

              {/* Informações read-only do funcionário */}
              {selectedEmployee && (
                <div className="col-span-1 md:col-span-2 p-3 bg-muted rounded-md text-sm text-muted-foreground flex justify-between">
                  <span><strong>Empresa:</strong> {selectedEmployee.client_name}</span>
                  <span><strong>Cargo:</strong> {selectedEmployee.job_role_name}</span>
                </div>
              )}

              {/* Tipo de Exame */}
              <div className="grid gap-2">
                <Label htmlFor="exam_type">Tipo de Exame da Guia</Label>
                <Select
                  onValueChange={(val) =>
                    setValue("exam_type", val as any, { shouldValidate: true })
                  }
                  value={selectedExamType || ""}
                  disabled={isLoading || !selectedEmployee}
                >
                  <SelectTrigger id="exam_type">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMISSONAL">Admissional</SelectItem>
                    <SelectItem value="PERIODICO">Periódico</SelectItem>
                    <SelectItem value="DEMISSIONAL">Demissional</SelectItem>
                    <SelectItem value="RETORNO">Retorno ao Trabalho</SelectItem>
                    <SelectItem value="MUDANCA">Mudança de Função</SelectItem>
                  </SelectContent>
                </Select>
                {errors.exam_type && (
                  <span className="text-sm text-red-500">{errors.exam_type.message}</span>
                )}
              </div>

              {/* Data Atendimento */}
              <div className="grid gap-2">
                <Label htmlFor="attendance_date">Data do Exame</Label>
                <Input
                  id="attendance_date"
                  type="date"
                  {...register("attendance_date")}
                  disabled={isLoading}
                />
                {errors.attendance_date && (
                  <span className="text-sm text-red-500">{errors.attendance_date.message}</span>
                )}
              </div>

              {/* Médico */}
              <div className="grid gap-2">
                <Label htmlFor="examiner_doctor">Médico Examinador (Nome/CRM)</Label>
                <Input
                  id="examiner_doctor"
                  {...register("examiner_doctor")}
                  disabled={isLoading}
                  placeholder="Ex: Dr. João (CRM 12345)"
                />
              </div>

              {/* Resultado */}
              <div className="grid gap-2">
                <Label htmlFor="result">Resultado Final (Aptidão)</Label>
                <Select
                  onValueChange={(val) =>
                    setValue("result", val as any, { shouldValidate: true })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="result">
                    <SelectValue placeholder="Sem Conclusão Ainda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APTO">Apto para a Função</SelectItem>
                    <SelectItem value="INAPTO">Inapto para a Função</SelectItem>
                    <SelectItem value="APTO_RESTRICAO">Apto com Restrições</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passo 3: Carrinho Financeiro / Exames Realizados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Exames e Procedimentos do ASO</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || !selectedEmployee}
              onClick={() => append({ procedure_id: "", price_charged: 0 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Exame Avulso
            </Button>
          </CardHeader>
          <CardContent>
            {errors.items?.root && (
              <div className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-md border border-red-200">
                {errors.items.root.message}
              </div>
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Procedimento</TableHead>
                    <TableHead className="w-[200px] text-right">Valor Cobrado (R$)</TableHead>
                    <TableHead className="w-[100px] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                        {selectedEmployee && selectedExamType
                          ? "Não há protocolo definido para este Cargo/Exame. Adicione exames avulsos."
                          : "Selecione o Funcionário e o Tipo de Exame acima para carregar."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Select
                            onValueChange={(val) => {
                              setValue(`items.${index}.procedure_id`, val)
                              // Se trocou de exame avulso na linha, busca e atualiza o preço
                              if (selectedEmployee) {
                                const price = getProcedurePrice(val, selectedEmployee.client_id)
                                setValue(`items.${index}.price_charged`, price)
                              }
                            }}
                            value={field.procedure_id}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="border-0 shadow-none bg-transparent">
                              <SelectValue placeholder="Selecione um exame..." />
                            </SelectTrigger>
                            <SelectContent>
                              {procedures.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.items?.[index]?.procedure_id && (
                            <span className="text-xs text-red-500 ml-3">
                              {errors.items[index]?.procedure_id?.message}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            className="text-right border-0 shadow-none bg-transparent"
                            {...register(`items.${index}.price_charged`, { valueAsNumber: true })}
                            disabled={isLoading}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end mt-4">
              <div className="text-xl font-bold p-4 bg-muted rounded-md border">
                Total da Guia: R$ {subtotal.toFixed(2).replace(".", ",")}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t p-6">
            <Button form="attendance-form" type="submit" disabled={isLoading} size="lg">
              {isLoading ? "Salvando..." : "Gravar Atendimento e Itens"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
