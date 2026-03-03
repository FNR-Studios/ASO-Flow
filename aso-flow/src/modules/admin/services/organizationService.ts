'use server'

import { createClient } from "../../../lib/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getSessionUser } from "../../auth/services/authService"

//Esquema de validação Zod
const organizationSchema = z.object({
    id: z.string().optional(),
    trade_name: z.string().min(2, "O nome Fantasia é obrigatorio"),
    corporate_name: z.string().min(2, "O nome Empresarial é obrigatorio"),
    cnpj: z.string().min(14, "O CNPJ é obrigatorio"),
    tech_responsible_name: z.string().min(2, "O nome do Técnico ou medico é obrigatorio"),
    tech_responsible_register: z.string().optional(),
    email: z.string().email("E-mail inválido").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
})

export type OrganizationFormData = z.infer<typeof organizationSchema>

export async function upsertOrganizationAction(data: OrganizationFormData) {
    const supabase = await createClient()

    const user = await getSessionUser()
    if (!user) {
        return {
            error: "Usuario não autenticado."
        }
    }

    const payload = {
        ...data,
    }

    if (!payload.id) {
        delete payload.id;
    }

    const { data: org, error } = await supabase
        .from('organizations')
        .upsert(payload)
        .select()
        .single()

    if (error) {
        console.error("Erro ao guardar organização: ", error)
        return {
            error: "Ocorreu um erro ao guardar os dados."
        }
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: org.id })
        .eq('id', user.id)

    if (profileError) {
        console.error("ERRO AO ATUALIZAR PERFIL: ", profileError);
        return { error: "Organização criada, mas falhou ao vincular ao seu perfil." }
    }

    return {
        success: true, org
    }
}

//Ação para Buscar os Dados Atuais

export async function getOrganizationAction() {
    const supabase = await createClient()

    const user = await getSessionUser()
    if (!user) {
        return {
            error: "Usuario não autenticado."
        }
    }

    // Primeiro descobre qual é a empresa do utilizador atual
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) {
        return null
    }

    // Depois busca os dados da empresa)
    const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single()

    return org
}