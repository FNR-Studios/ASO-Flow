'use server'

import { createClient } from "@/src/lib/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getSessionUser } from "../../auth/services/authService"
import { getJobRoleByIdAction } from "./jobRoleService"
import { getProceduresByIdAction } from "./procedureService"

const examProtocolSchema = z.object({
  job_role_id: z.string().uuid("Cargo inválido."),
  procedure_id: z.string().uuid("Procedimento inválido."),
  exam_type: z.enum(["ADMISSONAL", "PERIODICO", "DEMISSIONAL", "RETORNO", "MUDANCA"]),
  periodic_months: z.number().int().positive().optional().nullable(),
})

export type ExamProtocolFormData = z.infer<typeof examProtocolSchema>

export async function upsertExamProtocolAction(data: ExamProtocolFormData) {
  const parsedata = examProtocolSchema.safeParse(data);

  if (!parsedata.success) {
    console.error("ERRO VALIDAÇÃO PROTOCOLO:", parsedata.error.format())
    return {
      error: "Dados de formulario inválidos!"
    }
  }

  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) {
    return {
      error: "Usuario não autenticado."
    }
  }

  const jobRole = await getJobRoleByIdAction(data.job_role_id)
  if (!jobRole) {
    return {
      error: "Cargo não encontrado."
    }
  }

  const procedure = await getProceduresByIdAction(data.procedure_id)
  if (!procedure) {
    return {
      error: "Procedimento não encontrado."
    }
  }

  const payload = {
    job_role_id: data.job_role_id,
    procedure_id: data.procedure_id,
    exam_type: data.exam_type,
    periodic_months: data.periodic_months || null,
  }

  const { data: examProtocol, error } = await supabase
    .from('exam_protocols')
    .upsert(payload, { onConflict: "job_role_id, procedure_id, exam_type", })
    .select()
    .single()

  if (error) {
    console.error("Erro ao salvar protocolo de exame: ", error)
    return {
      error: "Ocorreu um erro ao guardar os dados."
    }
  }

  revalidatePath('/operacional/protocolos');
  return {
    success: true,
    data: examProtocol
  }
}

export async function bulkUpsertExamProtocolsAction(
  jobRoleId: string,
  protocols: { procedure_id: string; exam_type: string; periodic_months?: number | null }[]
) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) {
    return { error: "Usuário não autenticado." }
  }

  const jobRole = await getJobRoleByIdAction(jobRoleId)
  if (!jobRole) {
    return { error: "Cargo não encontrado." }
  }

  // 1. Deletar os protocolos atuais do cargo para substituir pelos novos
  const { error: deleteError } = await supabase
    .from("exam_protocols")
    .delete()
    .eq("job_role_id", jobRoleId)

  if (deleteError) {
    console.error("Erro ao limpar protocolos do cargo:", deleteError)
    return { error: "Erro ao atualizar protocolos." }
  }

  // 2. Inserir os novos protocolos
  if (protocols.length > 0) {
    const payload = protocols.map(p => ({
      job_role_id: jobRoleId,
      procedure_id: p.procedure_id,
      exam_type: p.exam_type,
      periodic_months: p.periodic_months || null,
    }))

    const { error: insertError } = await supabase
      .from("exam_protocols")
      .insert(payload)

    if (insertError) {
      console.error("Erro ao inserir novos protocolos:", insertError)
      return { error: "Erro ao salvar os novos protocolos." }
    }
  }

  revalidatePath('/operacional/protocolos')
  revalidatePath(`/operacional/cargos/${jobRoleId}`)
  
  return { success: true }
}

export async function bulkUpsertProtocolsByJobRoleAndTypeAction(
  jobRoleId: string,
  examType: string,
  procedures: { procedure_id: string; periodic_months?: number | null }[]
) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return { error: "Usuário não autenticado." }

  const jobRole = await getJobRoleByIdAction(jobRoleId)
  if (!jobRole) return { error: "Cargo não encontrado." }

  // 1. Deletar os procedimentos atuais deste (Cargo, Tipo)
  const { error: deleteError } = await supabase
    .from("exam_protocols")
    .delete()
    .eq("job_role_id", jobRoleId)
    .eq("exam_type", examType)

  if (deleteError) {
    console.error("Erro ao limpar protocolos:", deleteError)
    return { error: "Erro ao atualizar protocolos." }
  }

  // 2. Inserir os novos procedimentos
  if (procedures.length > 0) {
    const payload = procedures.map(p => ({
      job_role_id: jobRoleId,
      procedure_id: p.procedure_id,
      exam_type: examType,
      periodic_months: p.periodic_months || null,
    }))

    const { error: insertError } = await supabase
      .from("exam_protocols")
      .insert(payload)

    if (insertError) {
      console.error("Erro ao inserir novos protocolos:", insertError)
      return { error: "Erro ao salvar os novos protocolos." }
    }
  }

  revalidatePath('/operacional/protocolos')
  revalidatePath(`/operacional/cargos/${jobRoleId}`)
  
  return { success: true }
}

export async function getExamProtocolsAction() {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) {
    return null
  }

  const { data: protocols, error } = await supabase
    .from("exam_protocols")
    .select(`
      job_role_id,
      procedure_id,
      exam_type,
      periodic_months,
      job_roles (
        id,
        title,
        clients (
          trade_name
        )
      ),
      procedures (
        id,
        name
      )
    `)
    .order("exam_type", { ascending: true })

  if (error) {
    console.error("Erro ao buscar protocolos de exame:", error)
    return null
  }

  return protocols
}

export async function getExamProtocolsByJobRoleAction(
  jobRoleId: string
) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) {
    return null
  }

  const { data: protocols, error } = await supabase
    .from("exam_protocols")
    .select(`
      job_role_id,
      procedure_id,
      exam_type,
      periodic_months,
      procedures (
        id,
        name,
        base_price
      )
    `)
    .eq("job_role_id", jobRoleId)

  if (error) {
    console.error("Erro ao buscar protocolos:", error)
    return null
  }

  return protocols
}

export async function getExamProtocolsByJobRoleAndTypeAction(
  jobRoleId: string,
  examType: string
) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return null

  const { data: protocols, error } = await supabase
    .from("exam_protocols")
    .select(`
      job_role_id,
      procedure_id,
      exam_type,
      periodic_months,
      procedures (
        id,
        name
      )
    `)
    .eq("job_role_id", jobRoleId)
    .eq("exam_type", examType)

  if (error) {
    console.error("Erro ao buscar protocolos por tipo:", error)
    return null
  }

  return protocols
}

export async function deleteExamProtocolAction(
  jobRoleId: string,
  procedureId: string,
  examType: string
) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) {
    return { error: "Usuário não autenticado." }
  }

  const { error } = await supabase
    .from("exam_protocols")
    .delete()
    .eq("job_role_id", jobRoleId)
    .eq("procedure_id", procedureId)
    .eq("exam_type", examType)

  if (error) {
    console.error("Erro ao deletar protocolo:", error)
    return { error: "Erro ao deletar protocolo." }
  }

  revalidatePath('/operacional/protocolos')
  return { success: true }
}
