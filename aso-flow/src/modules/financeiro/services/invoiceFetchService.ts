'use server'

import { createClient } from "@/src/lib/supabase/server"
import { getOrganizationAction } from "../../admin/services/organizationService"
import { getSessionUser } from "../../auth/services/authService"

export async function getUninvoicedRecordsAction(clientId: string, rawMonth: string) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return { error: "Usuário não autenticado." }

  const organization = await getOrganizationAction()
  if (!organization) return { error: "Organização não encontrada." }

  if (!clientId || !rawMonth) return { data: [] }

  const [yearStr, monthStr] = rawMonth.split('-')
  const startDate = `${rawMonth}-01T00:00:00.000Z`
  const lastDay = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate()
  const endDate = `${rawMonth}-${lastDay}T23:59:59.999Z`

  const { data: records, error } = await supabase
    .from("clinical_records")
    .select(`
      id,
      exam_type,
      exam_date,
      employees!inner(
         client_id,
         name,
         cpf
      ),
      clinical_items(price_charged)
    `)
    .eq("organization_id", organization.id)
    .eq("employees.client_id", clientId)
    .gte("exam_date", startDate)
    .lte("exam_date", endDate)
    .is("invoice_id", null) 
    .eq("status", "CONCLUIDO")
    .order("exam_date", { ascending: true })

  if (error) {
    console.error("Erro ao buscar exames não faturados:", error)
    return { error: "Erro na busca." }
  }

  if (!records) return { data: [] }

  const formattedRecords = records.map((record: any) => {
    let totalValue = 0
    if (record.clinical_items) {
      record.clinical_items.forEach((item: any) => {
        totalValue += Number(item.price_charged || 0)
      })
    }

    // Pega property name diretamente (inner join com fk ali)
    return {
      id: record.id,
      exam_type: record.exam_type,
      exam_date: record.exam_date,
      employee_name: record.employees?.name || "Desconhecido",
      employee_cpf: record.employees?.cpf || "---",
      total_calculated_value: totalValue
    }
  })

  return { data: formattedRecords }
}
