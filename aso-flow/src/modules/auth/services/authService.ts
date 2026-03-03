'use server'

import { createClient } from "@/src/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"

// --- Schemas ---
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  confirmPassword: z.string(),
  inviteCode: z.string().optional(), // A CORREÇÃO ESTÁ AQUI: Adicionamos o .optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

// --- Actions ---
export async function loginAction(data: LoginFormData) {
  const result = loginSchema.safeParse(data)
  if (!result.success) return { error: "Dados inválidos." }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) return { error: "E-mail ou senha incorretos." }
  redirect("/home")
}

export async function registerAction(data: RegisterFormData) {
  const result = registerSchema.safeParse(data)
  if (!result.success) return { error: "Dados inválidos." }

  const supabase = await createClient()
  let inviteData = null;

  // 1. Se tem convite, validamos ANTES de criar a conta
  if (data.inviteCode) {
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('id', data.inviteCode)
      .eq('used', false)
      .single()

    if (inviteError || !invite || invite.email !== data.email) {
      return { error: "Convite inválido, expirado ou e-mail incorreto." }
    }
    inviteData = invite;
  }

  // 2. Cria o utilizador no Supabase Auth
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { full_name: "Novo Usuário" }
    }
  })

  if (error) return { error: error.message }
  if (!authData.user) return { error: "Erro ao criar utilizador." }

  // 3. Se for um Funcionário (tinha convite válido), corrigimos o perfil dele
  if (inviteData) {
    // Atualiza o perfil com o cargo e a clínica corretos
    await supabase
      .from('profiles')
      .update({
        role: inviteData.role,
        organization_id: inviteData.organization_id
      })
      .eq('id', authData.user.id)

    // Queima o convite para não ser usado novamente
    await supabase
      .from('invites')
      .update({ used: true })
      .eq('id', inviteData.id)
  }

  return { success: true }
}

export async function getSessionUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}