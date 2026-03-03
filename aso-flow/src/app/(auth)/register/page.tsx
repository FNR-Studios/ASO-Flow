import { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import { RegisterForm } from "@/src/modules/auth/components/register-form"
import { InviteRegisterForm } from "@/src/modules/auth/components/invite-register-form"

export const metadata: Metadata = {
  title: "Criar Conta",
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  // CÁLCULO 1: Se a URL NÃO tem código, é o fluxo padrão (Dono da Clínica)
  if (!code) {
    return <RegisterForm />
  }

  // CÁLCULO 2: Se a URL TEM código, vamos validar no banco antes de renderizar
  const supabase = await createClient()
  const { data: invite } = await supabase
    .from("invites")
    .select("id, email")
    .eq("id", code)
    .eq("used", false)
    .single()

  // Se o convite for inválido ou já tiver sido usado, expulsa para o login
  if (!invite) {
    redirect("/login?error=convite_invalido_ou_expirado")
  }

  // Se tudo estiver certo, mostra o formulário especial de funcionário!
  return <InviteRegisterForm inviteCode={invite.id} emailPreenchido={invite.email} />
}