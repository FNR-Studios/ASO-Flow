'use client'

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { upsertJobRoleAction } from "../services/jobRoleService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

const jobRoleFormSchema = z.object({
    // O .or(z.literal('')) garante que a string vazia "" do HTML não quebre a validação
    id: z.string().optional().or(z.literal('')),
    organization_id: z.string().optional().or(z.literal('')),
    client_id: z.string().min(1, "Selecione um cliente válido."),
    title: z.string().min(2, "O título do cargo é obrigatório."),
    cbo_code: z.string().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
  });
  
  export type JobRoleFormValues = z.infer<typeof jobRoleFormSchema>
  
  interface JobRoleFormProps {
    initialData?: JobRoleFormValues | null;
    clients: { id: string; name: string }[]; 
  }
  
  export function JobRoleForm({ initialData, clients }: JobRoleFormProps){
      const [isLoading, setIsLoading] = useState(false)
      const router = useRouter()
      const queryClient = useQueryClient()
  
      const {register, handleSubmit, control, formState: {errors}} = useForm({
          resolver: zodResolver(jobRoleFormSchema),
          defaultValues: initialData || {
              id: "", // Adicione o id vazio aqui para o React Hook Form conhecer ele
              title: "",
              cbo_code: "",
              description: "",
              client_id: ""
          }
      })

    async function onSubmit(data: JobRoleFormValues){
        setIsLoading(true)

        const payload = {...data}
        if(!payload.id){
            delete payload.id
        }

        const response = await upsertJobRoleAction(payload as any)

        if(response?.error){
            toast.error(response.error)
            setIsLoading(false)
            console.log("Erros do formulário:", errors)
            return
        }

        queryClient.invalidateQueries({queryKey:["jobRoles"]})
        
        toast.success(
            initialData
            ? "Cargo atualizado com sucesso!"
            :"Cargo cadastrado com sucesso!"
        )
        const procedureId = response?.data?.id || data.id

        if(initialData && procedureId){
            router.push(`/operacional/cargos`)
        }else if(procedureId){
            router.push(`/operacional/cargos`)
        }else{
            router.push("/operacional/cargos")
        }
    }

    return(
        <div className="max-w-3xl mx-auto space-y-4"> 
            <Button variant="ghost" onClick={() => router.push("/operacional/cargos")} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a lista
            </Button>

            <Card>
                <CardHeader>
                   <CardTitle className="text-2xl">
                        {initialData ? "Editar Cargo" : "Novo cargo"}
                    </CardTitle> 
                </CardHeader>

                <CardContent>
                    
                    <form id="jobRole-form" onSubmit={handleSubmit(onSubmit, (erros) => console.log("Erros do Zod:", erros))} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="hidden" {...register("id")} />

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="title">Titulo</Label>
                            <Input id="title" {...register("title")} disabled={isLoading} />
                            {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
                        </div>                   

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="cbo_code">Código CBO</Label>
                            <Input id="cbo_code" {...register("cbo_code")} disabled={isLoading} />
                            {errors.cbo_code && <span className="text-sm text-red-500">{errors.cbo_code.message}</span>}
                        </div> 

                        {/* NOVO CAMPO: SELEÇÃO DE CLIENTE */}
                        <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="client_id">Empresa / Cliente</Label>
                        <Controller
                            name="client_id"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="client_id" disabled={isLoading}>
                                  <SelectValue placeholder="Selecione um cliente..." />
                                </SelectTrigger>
                                <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            )}
                        />
                        {errors.client_id && <span className="text-sm text-red-500">{errors.client_id.message}</span>}
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input id="description" {...register("description")} disabled={isLoading} />
                            {errors.description && <span className="text-sm text-red-500">{errors.description.message}</span>}
                        </div> 

                    </form>
                </CardContent>

                <CardFooter className="flex justify-end border-t p-6">
                    <Button form="jobRole-form" type="submit" disabled={isLoading} >
                        {isLoading ? "Salvando..." : "Salvar Cargo"}
                    </Button>
                </CardFooter>
            </Card>          
        </div>      
    )

}   