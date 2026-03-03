import { createClient } from "@/src/lib/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getSessionUser } from "../../auth/services/authService"
import { getJobRoleByIdAction } from "./jobRoleService"
import { getProceduresByIdAction } from "./procedureService"

const examProtocolSchema = z.object({
  job_role_id: z.string().uuid("Cargo inválido."),
  procedure_id: z.string().uuid("Procedimento inválido."),
  exam_type: z.enum(["admissional", "periodico", "demissional", "retorno", "mudanca"]),
  periodic_months: z.number().int().positive().optional(),
})

export type ExamProtocolFormData = z.infer<typeof examProtocolSchema>

export async function upsertExamProtocolAction(data: ExamProtocolFormData) {
  const parsedata = examProtocolSchema.safeParse(data);

  if (!parsedata.success) {
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
    periodic_months: data.periodic_months,
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

  revalidatePath('/admin/exames');
  return {
    success: true,
    data: examProtocol
  }
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
        title
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
        name
      )
    `)
    .eq("job_role_id", jobRoleId)

  if (error) {
    console.error("Erro ao buscar protocolos:", error)
    return null
  }

  return protocols
}