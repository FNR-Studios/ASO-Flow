'use server'

import { createClient } from "@/src/lib/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getOrganizationAction } from "../../admin/services/organizationService"
import { getSessionUser } from "../../auth/services/authService"

const attendanceItemSchema = z.object({
  procedure_id: z.string().uuid(),
  price_charged: z.number().min(0, "O preço cobrado não pode ser negativo."),
})

const attendanceSchema = z.object({
  employee_id: z.string().uuid("Selecione um funcionário válido."),
  exam_type: z.enum([
    "ADMISSONAL",
    "PERIODICO",
    "DEMISSIONAL",
    "RETORNO",
    "MUDANCA",
  ], { message: "Selecione o tipo de exame." }),
  attendance_date: z.string().min(1, "A data do atendimento é obrigatória."),
  examiner_doctor: z.string().optional().or(z.literal("")),
  result: z.enum(["APTO", "INAPTO", "APTO_RESTRICAO"], { message: "Selecione o resultado." }).optional().or(z.literal("")),
  validity_date: z.string().optional().or(z.literal("")),
  status: z.enum(["ABERTO", "CONCLUIDO", "FATURADO"]).default("ABERTO"),
  items: z.array(attendanceItemSchema).min(1, "O atendimento precisa ter pelo menos um exame (item)."),
})

export type AttendanceFormData = z.infer<typeof attendanceSchema>

export async function createAttendanceAction(data: AttendanceFormData) {
  const parsedData = attendanceSchema.safeParse(data)

  if (!parsedData.success) {
    console.error("ERRO DE VALIDAÇÃO ATENDIMENTO:", parsedData.error.format())
    return { error: "Dados de formulário inválidos!" }
  }

  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) {
    return { error: "Usuário não autenticado." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) {
    return { error: "Usuário não vinculado a nenhuma organização." }
  }

  // Schema real no DB: clinical_records
  const attendancePayload: Record<string, unknown> = {
    organization_id: profile.organization_id,
    employee_id: parsedData.data.employee_id,
    exam_type: parsedData.data.exam_type,
    exam_date: parsedData.data.attendance_date,      // SCHEMA: exam_date ao inves de attendance_date
    doctor_examiner: parsedData.data.examiner_doctor || null, // SCHEMA: doctor_examiner ao inves de examiner_doctor
    result: parsedData.data.result || null,
    validity_date: parsedData.data.validity_date || null,
    status: parsedData.data.status,
  }

  // 1. Inserir a guia principal (clinical_records)
  const { data: clinicalRecord, error: attendanceError } = await supabase
    .from("clinical_records")
    .insert(attendancePayload)
    .select()
    .single()

  if (attendanceError) {
    console.error("Erro ao salvar guia de atendimento:", attendanceError)
    return { error: "Ocorreu um erro ao gerar a guia de atendimento." }
  }

  // 2. Inserir os itens (snapshot de preços) na real tabela clinical_items
  const itemsPayload = parsedData.data.items.map((item) => ({
    clinical_record_id: clinicalRecord.id, // SCHEMA: clinical_record_id
    procedure_id: item.procedure_id,
    price_charged: item.price_charged,
  }))

  const { error: itemsError } = await supabase
    .from("clinical_items")
    .insert(itemsPayload)

  if (itemsError) {
    console.error("Erro ao salvar itens do atendimento:", itemsError)
    
    // Se falhar nos itens, tenta deletar a guia principal para evitar dados órfãos 
    await supabase.from("clinical_records").delete().eq("id", clinicalRecord.id)
    
    return { error: "Ocorreu um erro ao salvar os exames da guia." }
  }

  revalidatePath("/operacional/atendimentos")
  return { success: true, data: clinicalRecord }
}

export async function getAttendancesAction() {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return null

  const organization = await getOrganizationAction()
  if (!organization) return null

  const { data: attendances, error } = await supabase
    .from("clinical_records")
    .select(`
      id,
      exam_type,
      exam_date,
      status,
      result,
      employees (
        id,
        name,
        cpf,
        client_id,
        clients:client_id (trade_name)
      )
    `)
    .eq("organization_id", organization.id)
    .order("exam_date", { ascending: false })

  if (error) {
    console.error("ERRO COMPLETO DO BANCO DE DADOS:", error)
    return { 
      error: `SUPABASE ERROR: ${error.message} \nHint: ${error.hint || 'N/A'} \nDetails: ${error.details || 'N/A'}`
    }
  }

  if (!attendances) return []

  return attendances.map((att: any) => ({
    id: att.id,
    exam_type: att.exam_type,
    attendance_date: att.exam_date, // mapeia DB -> frontend
    status: att.status,
    result: att.result || "—",
    employee_name: att.employees?.name || "—",
    employee_cpf: att.employees?.cpf || "—",
    client_name: att.employees?.clients?.trade_name || "—",
  }))
}

export async function getAttendanceByIdAction(id: string) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return null

  const organization = await getOrganizationAction()
  if (!organization) return null

  const { data: attendance, error: attError } = await supabase
    .from("clinical_records")
    .select(`
      *,
      employees (
        id,
        name,
        cpf,
        client_id,
        job_role_id,
        clients:client_id (trade_name),
        job_roles:job_role_id (title)
      )
    `)
    .eq("id", id)
    .eq("organization_id", organization.id)
    .single()

  if (attError || !attendance) return null

  const { data: items, error: itemsError } = await supabase
    .from("clinical_items")
    .select(`
      id,
      procedure_id,
      price_charged,
      procedures (name)
    `)
    .eq("clinical_record_id", id)

  if (itemsError) return null

  // mapeando pro frontend
  return {
    ...attendance,
    attendance_date: attendance.exam_date,
    examiner_doctor: attendance.doctor_examiner,
    items: items || [],
  }
}

export async function updateAttendanceStatusAction(id: string, status: "ABERTO" | "CONCLUIDO" | "FATURADO") {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return { error: "Usuário não autenticado." }

  const organization = await getOrganizationAction()
  if (!organization) return { error: "Organização não encontrada." }

  const { error } = await supabase
    .from("clinical_records")
    .update({ status })
    .eq("id", id)
    .eq("organization_id", organization.id)

  if (error) {
    console.error("Erro ao atualizar status do atendimento:", error)
    return { error: "Ocorreu um erro ao atualizar o status." }
  }

  revalidatePath("/operacional/atendimentos")
  revalidatePath(`/operacional/atendimentos/${id}`)
  return { success: true }
}

export async function deleteAttendanceAction(id: string) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return { error: "Usuário não autenticado." }

  const organization = await getOrganizationAction()
  if (!organization) return { error: "Organização não encontrada." }

  const { error } = await supabase
    .from("clinical_records")
    .delete()
    .eq("id", id)
    .eq("organization_id", organization.id)

  if (error) {
    console.error("Erro ao deletar atendimento:", error)
    return { error: "Ocorreu um erro ao deletar o atendimento." }
  }

  revalidatePath("/operacional/atendimentos")
  return { success: true }
}
