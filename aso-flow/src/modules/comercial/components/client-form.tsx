'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { upsertClientAction } from "@/src/modules/comercial/services/clientService"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { ArrowLeft } from "lucide-react"


const clientFormSchema = z.object({
  id: z.string().optional(),
  trade_name: z.string().min(2, "O nome fantasia é obrigatório."),
  corporate_name: z.string().min(2, "A razão social é obrigatória."),
  cnpj: z.string().min(14, "O CNPJ é obrigatório."),
  risk_degree: z.coerce.number().int().optional(),
  billing_email: z.string().email("E-mail inválido.").or(z.literal("")).optional(),
  financial_contact_name: z.string().optional(),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
})

export type ClientFormValues = z.infer<typeof clientFormSchema>

interface ClientFormProps {
  initialData?: ClientFormValues | null;
}

export function ClientForm({ initialData }: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(clientFormSchema),
    defaultValues: initialData || {
      trade_name: "",
      corporate_name: "",
      cnpj: "",
      billing_email: "",
      financial_contact_name: "",
      status: "ATIVO"
    }
  })

  async function onSubmit(data: ClientFormValues) {
    setIsLoading(true)

    const response = await upsertClientAction(data as any)

    if (response?.error) {
      toast.error(response.error)
      setIsLoading(false)
      return
    }

    toast.success(
      initialData
        ? "Cliente atualizado com sucesso!"
        : "Cliente cadastrado com sucesso!"
    )

    const clientId = response?.data?.id || data.id

    if (initialData && clientId) {
      router.push(`/comercial/clientes/${clientId}`)
    } else if (clientId) {
      router.push(`/comercial/clientes/${clientId}`)
    } else {
      router.push("/comercial/clientes")
    }

    router.refresh()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Button variant="ghost" onClick={() => router.push("/comercial/clientes")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a lista
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {initialData ? "Editar Cliente" : "Novo Cliente"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form id="client-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* O ID fica oculto, só será enviado no modo edição */}
            <input type="hidden" {...register("id")} />

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="corporate_name">Razão Social *</Label>
              <Input id="corporate_name" {...register("corporate_name")} disabled={isLoading} />
              {errors.corporate_name && <span className="text-sm text-red-500">{errors.corporate_name.message}</span>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="trade_name">Nome Fantasia *</Label>
              <Input id="trade_name" {...register("trade_name")} disabled={isLoading} />
              {errors.trade_name && <span className="text-sm text-red-500">{errors.trade_name.message}</span>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input id="cnpj" {...register("cnpj")} disabled={isLoading} />
              {errors.cnpj && <span className="text-sm text-red-500">{errors.cnpj.message}</span>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billing_email">E-mail Financeiro</Label>
              <Input id="billing_email" type="email" {...register("billing_email")} disabled={isLoading} />
              {errors.billing_email && <span className="text-sm text-red-500">{errors.billing_email.message}</span>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="financial_contact_name">Contato Financeiro</Label>
              <Input id="financial_contact_name" {...register("financial_contact_name")} disabled={isLoading} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="risk_degree">Grau de Risco (1 a 4)</Label>
              <Input id="risk_degree" type="number" min="1" max="4" {...register("risk_degree")} disabled={isLoading} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register("status")}
                disabled={isLoading}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6">
          <Button form="client-form" type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? "A guardar..." : "Salvar Cliente"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}