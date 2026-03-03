import { Metadata } from "next"
import { LoginForm } from "@/src/modules/auth/components/login-form"

export const metadata: Metadata = {
  title: "Login",
  description: "Acesse sua conta para gerenciar a saúde ocupacional.",
}

export default function LoginPage() {
  return <LoginForm />
}