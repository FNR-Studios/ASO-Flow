'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginAction, LoginFormData } from "@/src/modules/auth/services/authService"
import { z } from "zod"
import Link from "next/link"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

const loginSchema = z.object({
  email: z.string().email("Insira um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
})

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    setServerError(null)

    const response = await loginAction(data)

    if (response?.error) {
      setServerError(response.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">ASO Flow</CardTitle>
          <CardDescription className="text-center">
            Acesse sua conta para gerenciar a saúde ocupacional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@email.com"
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email && (
                <span className="text-sm text-red-500 font-medium">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                disabled={isLoading}
                {...register("password")}
              />
              {errors.password && (
                <span className="text-sm text-red-500 font-medium">
                  {errors.password.message}
                </span>
              )}
            </div>
            {serverError && (
              <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm text-center border border-red-200">
                {serverError}
              </div>
            )}
            <Button className="w-full font-bold" type="submit" disabled={isLoading}>
              {isLoading ? "Validando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground underline hover:text-primary transition-colors"
          >
            Esqueceu a senha?
          </Link>
          <div className="text-sm">
            Não tem uma conta?{" "}
            <Link href="/register" className="underline hover:text-primary">
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}