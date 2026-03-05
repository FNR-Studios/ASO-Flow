import { Metadata } from "next"
import { LoginForm } from "@/src/modules/auth/components/login-form"
import { Header } from "@/src/components/layout/Header"
import { Footer } from "@/src/components/layout/Footer"

export const metadata: Metadata = {
  title: "Login",
  description: "Acesse sua conta para gerenciar a saúde ocupacional.",
}

export default function LoginPage() {
  return ( 
    <>
    <Header/ >
    <LoginForm />
    <Footer/ >
    </>
)
}