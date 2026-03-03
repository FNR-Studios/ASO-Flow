"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { upsertProcedureAction } from "../../operacional/services/procedureService"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"

const procedureFormSchema = z.object({
    id: z.string().optional(),
    organization_id: z.string().uuid().optional(),
    name: z.string().min(2, "O nome do procedimento é obrigatório."),
    type: z.enum(["CLINICO", "LABORATORIAL", "IMAGEM", "OUTROS"]),
    base_price: z.number().nonnegative("O preço não pode ser negativo."),
    tuss_code: z.string().optional()
})

export type ProcedureFormValues = z.infer<typeof procedureFormSchema>

interface ProcedureFormProps {
    initialData?: ProcedureFormValues | null;
}

export function ProcedureForm({ initialData }: ProcedureFormProps){
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const queryClient = useQueryClient()
    
    const {register, handleSubmit, formState: {errors}} = useForm({
        resolver: zodResolver(procedureFormSchema),
        defaultValues: initialData || {
            name: "",
            type: "CLINICO",
            base_price: 0,
            tuss_code: ""
        }
    })


    async function onSubmit(data: ProcedureFormValues){
        setIsLoading(true)

        const payload = { ...data }
        if (!payload.id) {
            delete payload.id
        }

        const response = await upsertProcedureAction(payload as any)

        if(response?.error){
            toast.error(response.error)
            setIsLoading(false)
            console.log("Erros do formulário:", errors)
            return
        }

        

        queryClient.invalidateQueries({ queryKey: ["procedures"] })

        toast.success(
            initialData
            ? "Procedimento atualizado com sucesso!"
            : "Procedimento cadastrado com sucesso!"
        )

        const procedureId = response?.data?.id || data.id

        if(initialData && procedureId){
            router.push(`/operacional/procedimentos`)
        }else if(procedureId){
            router.push(`/operacional/procedimentos`)
        }else{
            router.push("/operacional/procedimentos")
        }
    }

    return(
        <div className="max-w-3xl mx-auto space-y-4"> 
            <Button variant="ghost" onClick={() => router.push("/operacional/procedimentos")} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a lista
            </Button>

            <Card>
                <CardHeader>
                   <CardTitle className="text-2xl">
                        {initialData ? "Editar Procedimento" : "Novo Procedimento"}
                    </CardTitle> 
                </CardHeader>

                <CardContent>
                    
                    <form id="procedure-form" onSubmit={handleSubmit(onSubmit, (erros) => console.log("Erros do Zod:", erros))} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="hidden" {...register("id")} />

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" {...register("name")} disabled={isLoading} />
                            {errors.name && <span className="text-sm text-red-500">{errors.name.message}</span>}
                        </div>
                        
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="type">Tipo</Label>
                            <select id="type" {...register("type")} disabled={isLoading} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <option value="CLINICO">Clínico</option>
                                <option value="LABORATORIAL">Laboratorial</option>
                                <option value="IMAGEM">Imagem</option>
                                <option value="OUTROS">Outros</option>
                            </select>
                            {errors.type && <span className="text-sm text-red-500">{errors.type.message}</span>}
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="base_price">Preço base</Label>
                            <Input id="base_price" {...register("base_price", { valueAsNumber: true })} type="number" min="0" step="0.01" disabled={isLoading} />
                            {errors.base_price && <span className="text-sm text-red-500">{errors.base_price.message}</span>}
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="tuss_code">Código TUSS</Label>
                            <Input id="tuss_code" {...register("tuss_code")} disabled={isLoading} />
                            {errors.tuss_code && <span className="text-sm text-red-500">{errors.tuss_code.message}</span>}
                        </div>

                    </form>
                </CardContent>

                <CardFooter className="flex justify-end border-t p-6">
                    <Button form="procedure-form" type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading ? "Salvando..." : "Salvar Procedimento"}
                    </Button>
                </CardFooter>
            </Card>          
        </div>      
    )
}