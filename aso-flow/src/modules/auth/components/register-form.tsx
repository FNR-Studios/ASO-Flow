'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerAction, RegisterFormData } from "@/src/modules/auth/services/authService"
import { z } from "zod"
import Link from "next/link"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

const registerSchema = z.object({
    email: z.string().email("Insira um e-mail válido"),
    full_name: z.string().min(3, "O nome é obrigatório"),
    password: z.string().min(6, "A senha é obrigatória"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
})

export function RegisterForm() {
    const [serverError, setServerError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register, handleSubmit, formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    async function onSubmit(data: RegisterFormData) {
        setIsLoading(true)
        setServerError(null)

        const response = await registerAction(data)

        if (response?.error) {
            setServerError(response.error)
            setIsLoading(false)
        }

    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">ASO FLow</CardTitle>
                    <CardDescription className="text-center">
                        Crie uma conta para acessar o sistema.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">

                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Nome completo</Label>
                            <Input id="full_name" placeholder="João Silva" disabled={isLoading} {...register("full_name")} />
                            {errors.full_name && (
                                <span className="text-sm text-red-500 font-medium">
                                    {errors.full_name.message}
                                </span>
                            )}
                        </div>                        
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" placeholder="nome@mail.com" disabled={isLoading} {...register("email")} />
                            {errors.email && (
                                <span className="text-sm text-red-500 font-medium">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" type="password" disabled={isLoading} {...register("password")} />
                            {errors.password && (
                                <span className="text-sm text-red-500 font-medium">
                                    {errors.password.message}
                                </span>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirme a senha</Label>
                            <Input id="confirmPassword" type="password" disabled={isLoading} {...register("confirmPassword")} />
                            {errors.confirmPassword && (
                                <span className="text-sm text-red-500 font-medium">
                                    {errors.confirmPassword.message}
                                </span>
                            )}
                        </div>
                        <Button className="w-full font-bold" type="submit" disabled={isLoading}>
                            {isLoading ? "Criando..." : "Criar"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}