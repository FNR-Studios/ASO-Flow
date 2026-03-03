'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createInviteAction } from "@/src/modules/admin/services/inviteService"
import { z } from "zod"
import { toast } from "sonner"
import { Copy } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"

const createInviteSchema = z.object({
  email: z.string().email("Insira um e-mail válido."),
  role: z.enum(['ADMIN', 'OPERADOR']),
})

type InviteFormValues = z.infer<typeof createInviteSchema>

export function InviteForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InviteFormValues>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: {
      email: "",
      role: "OPERADOR"
    }
  })

  async function onSubmit(data: InviteFormValues) {
    setIsLoading(true)
    setGeneratedLink(null)

    const response = await createInviteAction(data)

    if (response?.error) {
      toast.error(response.error)
    } else if (response?.inviteId) {
      toast.success("Convite gerado com sucesso!")

      const link = `${window.location.origin}/register?code=${response.inviteId}`
      setGeneratedLink(link)

      reset()
    }

    setIsLoading(false)
  }

  function copyToClipboard() {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      toast.success("Link copiado para a área de transferência!")
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Convidar Membro</CardTitle>
        <CardDescription>
          Gere um link de acesso exclusivo para um novo funcionário ou médico da sua clínica.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form id="invite-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="email">E-mail do Funcionário *</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@clinica.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Nível de Acesso *</Label>
              <select
                id="role"
                {...register("role")}
                disabled={isLoading}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="OPERADOR">Operador</option>
                <option value="ADMIN">Administrador</option>
              </select>
              {errors.role && <span className="text-sm text-red-500">{errors.role.message}</span>}
            </div>
          </div>
        </form>

        {generatedLink && (
          <div className="p-4 mt-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
            <p className="text-sm text-green-800 font-medium">Convite gerado! Envie este link para o utilizador:</p>
            <div className="flex items-center gap-2">
              <Input value={generatedLink} readOnly className="bg-white" />
              <Button type="button" variant="outline" onClick={copyToClipboard} className="shrink-0 bg-white hover:bg-slate-100">
                <Copy className="w-4 h-4 mr-2" /> Copiar
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end border-t p-6">
        <Button form="invite-form" type="submit" disabled={isLoading}>
          {isLoading ? "A Gerar..." : "Gerar Link de Convite"}
        </Button>
      </CardFooter>
    </Card>
  )
}