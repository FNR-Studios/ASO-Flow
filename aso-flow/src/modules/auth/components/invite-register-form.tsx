'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerAction, RegisterFormData } from "@/src/modules/auth/services/authService"
import { z } from "zod"
import Link from "next/link"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

// O .optional() foi adicionado aqui no inviteCode para bater perfeitamente com o backend
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  confirmPassword: z.string(),
  inviteCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

interface InviteRegisterFormProps {
  inviteCode: string
  emailPreenchido: string
}

export function InviteRegisterForm({ inviteCode, emailPreenchido }: InviteRegisterFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: emailPreenchido,
      inviteCode: inviteCode,
    }
  })

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true)
    setServerError(null)

    const response = await registerAction(data)

    if (response?.error) {
      setServerError(response.error)
      setIsLoading(false)
    } else if (response?.success) {
      setSuccess(true)
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-sm border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-center text-green-700">Bem-vindo(a) à equipa!</CardTitle>
            <CardDescription className="text-center text-green-600">
              A sua conta foi criada e vinculada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button className="bg-green-600 hover:bg-green-700 text-white">Ir para Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm border-blue-200 shadow-md">
        <CardHeader className="bg-blue-50/50 rounded-t-xl pb-6">
          <CardTitle className="text-2xl text-center text-blue-900">Aceitar Convite</CardTitle>
          <CardDescription className="text-center text-blue-700">
            Defina uma senha para aceder à plataforma da clínica.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">

            <input type="hidden" {...register("inviteCode")} />

            <div className="grid gap-2">
              <Label htmlFor="email">E-mail (Trancado)</Label>
              <Input
                id="email"
                {...register("email")}
                readOnly
                className="bg-slate-100 text-slate-500 cursor-not-allowed focus-visible:ring-0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Criar Senha</Label>
              <Input id="password" type="password" {...register("password")} disabled={isLoading} />
              {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} disabled={isLoading} />
              {errors.confirmPassword && <span className="text-sm text-red-500">{errors.confirmPassword.message}</span>}
            </div>

            {serverError && <div className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded">{serverError}</div>}

            <Button className="w-full mt-2" type="submit" disabled={isLoading}>
              {isLoading ? "A registar..." : "Criar Conta e Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}