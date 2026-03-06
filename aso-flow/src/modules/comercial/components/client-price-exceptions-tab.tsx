"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import {
  upsertClientPriceListAction,
  deleteClientPriceListAction,
} from "../services/clientPriceListService"
import { getProceduresAction } from "@/src/modules/operacional/services/procedureService"

const priceExceptionSchema = z.object({
  procedure_id: z.string().min(1, "Selecione um procedimento."),
  custom_price: z.number().positive("O preço precisa ser maior que zero."),
})

type PriceExceptionFormData = z.infer<typeof priceExceptionSchema>

interface Procedure {
  id: string
  name: string
  base_price: number
  type: string
}

interface PriceException {
  client_id: string
  procedure_id: string
  custom_price: number
  procedures: {
    id: string
    name: string
    base_price: number
  }
}

interface ClientPriceExceptionsTabProps {
  clientId: string
  initialPriceList: PriceException[] | null
}

export function ClientPriceExceptionsTab({
  clientId,
  initialPriceList,
}: ClientPriceExceptionsTabProps) {
  const [priceList, setPriceList] = useState<PriceException[]>(initialPriceList || [])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProcedures, setIsLoadingProcedures] = useState(true)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PriceExceptionFormData>({
    resolver: zodResolver(priceExceptionSchema),
    defaultValues: {
      procedure_id: "",
      custom_price: 0,
    },
  })

  const selectedProcedureId = watch("procedure_id")
  const selectedProcedure = procedures.find((p) => p.id === selectedProcedureId)

  // Carregar procedimentos disponíveis
  useEffect(() => {
    async function loadProcedures() {
      setIsLoadingProcedures(true)
      const result = await getProceduresAction()
      if (Array.isArray(result)) {
        setProcedures(result)
      }
      setIsLoadingProcedures(false)
    }
    loadProcedures()
  }, [])

  // Filtrar procedimentos que ainda não têm exceção
  const availableProcedures = procedures.filter(
    (proc) => !priceList.some((exception) => exception.procedure_id === proc.id)
  )

  async function onSubmit(data: PriceExceptionFormData) {
    setIsLoading(true)

    const result = await upsertClientPriceListAction({
      client_id: clientId,
      procedure_id: data.procedure_id,
      custom_price: data.custom_price,
    })

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    // Atualizar lista local
    const procedure = procedures.find((p) => p.id === data.procedure_id)
    if (procedure) {
      const newException: PriceException = {
        client_id: clientId,
        procedure_id: data.procedure_id,
        custom_price: data.custom_price,
        procedures: {
          id: procedure.id,
          name: procedure.name,
          base_price: procedure.base_price,
        },
      }
      setPriceList([...priceList, newException])
    }

    toast.success("Exceção de preço adicionada com sucesso!")
    reset()
    setIsAddingNew(false)
    setIsLoading(false)
  }

  async function handleDelete(procedureId: string) {
    setDeletingId(procedureId)

    const result = await deleteClientPriceListAction(clientId, procedureId)

    if (result.error) {
      toast.error(result.error)
      setDeletingId(null)
      return
    }

    setPriceList(priceList.filter((item) => item.procedure_id !== procedureId))
    toast.success("Exceção de preço removida com sucesso!")
    setDeletingId(null)
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  function calculateDiscount(basePrice: number, customPrice: number) {
    if (basePrice === 0) return 0
    const discount = ((basePrice - customPrice) / basePrice) * 100
    return discount.toFixed(1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exceções de Preço</CardTitle>
        <CardDescription>
          Os procedimentos abaixo têm preços diferentes da tabela padrão para este cliente.
          Caso um procedimento não esteja listado, será utilizado o preço base da tabela padrão.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tabela de exceções existentes */}
        {priceList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedimento</TableHead>
                <TableHead className="text-right">Preço Padrão</TableHead>
                <TableHead className="text-right">Preço Acordado</TableHead>
                <TableHead className="text-right">Desconto</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceList.map((item) => (
                <TableRow key={item.procedure_id}>
                  <TableCell className="font-medium">
                    {item.procedures.name}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(item.procedures.base_price)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatCurrency(item.custom_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(calculateDiscount(item.procedures.base_price, item.custom_price)) > 0 ? (
                      <span className="text-green-600">
                        -{calculateDiscount(item.procedures.base_price, item.custom_price)}%
                      </span>
                    ) : Number(calculateDiscount(item.procedures.base_price, item.custom_price)) < 0 ? (
                      <span className="text-red-600">
                        +{Math.abs(Number(calculateDiscount(item.procedures.base_price, item.custom_price)))}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0%</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(item.procedure_id)}
                      disabled={deletingId === item.procedure_id}
                    >
                      {deletingId === item.procedure_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
            Nenhuma exceção de preço cadastrada para este cliente.
          </div>
        )}

        {/* Formulário para adicionar nova exceção */}
        {isAddingNew ? (
          <div className="border rounded-lg p-4 bg-muted/30">
            <h4 className="font-medium mb-4">Nova Exceção de Preço</h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="procedure_id">Procedimento</Label>
                  {isLoadingProcedures ? (
                    <div className="flex items-center gap-2 h-10 px-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando procedimentos...
                    </div>
                  ) : (
                    <select
                      id="procedure_id"
                      {...register("procedure_id")}
                      disabled={isLoading}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione um procedimento...</option>
                      {availableProcedures.map((proc) => (
                        <option key={proc.id} value={proc.id}>
                          {proc.name} - {formatCurrency(proc.base_price)}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.procedure_id && (
                    <span className="text-sm text-red-500">{errors.procedure_id.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_price">Preço Acordado (R$)</Label>
                  <Input
                    id="custom_price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("custom_price", { valueAsNumber: true })}
                    disabled={isLoading}
                    placeholder="0,00"
                  />
                  {errors.custom_price && (
                    <span className="text-sm text-red-500">{errors.custom_price.message}</span>
                  )}
                  {selectedProcedure && (
                    <p className="text-xs text-muted-foreground">
                      Preço padrão: {formatCurrency(selectedProcedure.base_price)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingNew(false)
                    reset()
                  }}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Exceção"
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingNew(true)}
            variant="outline"
            className="w-full border-dashed"
            disabled={availableProcedures.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Exceção de Preço
          </Button>
        )}

        {availableProcedures.length === 0 && procedures.length > 0 && !isAddingNew && (
          <p className="text-sm text-muted-foreground text-center">
            Todos os procedimentos já possuem exceção de preço cadastrada.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
