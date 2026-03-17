'use server'

import { createClient } from "@/src/lib/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getOrganizationAction } from "../../admin/services/organizationService"
import { getSessionUser } from "../../auth/services/authService"

const invoiceSchema = z.object({
  client_id: z.string().uuid("Selecione um cliente válido."),
  reference_month: z.string().min(1, "O mês de referência é obrigatório."), // formata como YYYY-MM-01 no DB
  issue_date: z.string().optional().or(z.literal("")),
  due_date: z.string().min(1, "A data de vencimento é obrigatória."),
  total_amount: z.number().min(0, "O valor não pode ser negativo.").default(0),
  status: z.enum(["RASCUNHO", "EMITIDA", "PAGA", "CANCELADA"]).default("RASCUNHO"),
  external_link: z.string().url("Link inválido.").optional().or(z.literal("")),
  recordIds: z.array(z.string().uuid()).optional(),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>

export async function createInvoiceAction(data: InvoiceFormData) {
  const parsedData = invoiceSchema.safeParse(data)

  if (!parsedData.success) {
    console.error("ERRO DE VALIDAÇÃO FATURA:", parsedData.error.format())
    return { error: "Dados de formulário inválidos!" }
  }

  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) {
    return { error: "Usuário não autenticado." }
  }

  const organization = await getOrganizationAction()
  if (!organization) {
    return { error: "Organização não encontrada." }
  }

  const [yearStr, monthStr] = parsedData.data.reference_month.split('-')
  const startDate = `${parsedData.data.reference_month}-01T00:00:00.000Z`
  // Get last day of month
  const lastDay = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate()
  const endDate = `${parsedData.data.reference_month}-${lastDay}T23:59:59.999Z`

  // 1. Encontrar os atendimentos CONCLUIDOS desse cliente nesse mês
  // Mas se o formulário enviar um array de recordIds específico, nós filtramos apenas por eles
  let query = supabase
    .from("clinical_records")
    .select(`
      id,
      employees!inner(client_id),
      clinical_items(price_charged)
    `)
    .eq("organization_id", organization.id)
    .eq("employees.client_id", parsedData.data.client_id)
    .is("invoice_id", null) // Não faturados ainda
    .eq("status", "CONCLUIDO") // Apenas os finalizados

  if (parsedData.data.recordIds && parsedData.data.recordIds.length > 0) {
     // O Front-end enviou IDs específicos que o usuário marcou nos checkboxes
     query = query.in("id", parsedData.data.recordIds)
  } else {
     // Comportamento fallback: Busca todos do período
     query = query.gte("exam_date", startDate).lte("exam_date", endDate)
  }

  const { data: recordsToInvoice, error: searchError } = await query

  if (searchError) {
    console.error("Erro ao buscar ASOs para faturar:", searchError)
    return { error: "Ocorreu um erro ao buscar os atendimentos do período." }
  }

  // Se IDs foram passados mas não encontrou nada na validação backend, pode ser fraude ou ja vinculou.
  if (parsedData.data.recordIds && parsedData.data.recordIds.length > 0 && (!recordsToInvoice || recordsToInvoice.length === 0)) {
       return { error: "Nenhum dos exames selecionados estava elegível para faturamento. Eles podem já ter sido faturados." }
  }

  // 2. Calcular o Valor Total Real (somando os itens de cada ASO)
  let calculatedTotal = 0
  if (recordsToInvoice && recordsToInvoice.length > 0) {
    recordsToInvoice.forEach((record: any) => {
      record.clinical_items?.forEach((item: any) => {
        calculatedTotal += Number(item.price_charged)
      })
    })
  }

  // Se o usuário digitou um valor manual maior que 0 na tela, usamos ele (override manual). 
  // Senão, usamos o valor calculado pelo sistema.
  const finalTotalAmount = parsedData.data.total_amount > 0 
    ? parsedData.data.total_amount 
    : calculatedTotal

  const payload: Record<string, unknown> = {
    organization_id: organization.id,
    client_id: parsedData.data.client_id,
    reference_month: `${parsedData.data.reference_month}-01`,
    due_date: parsedData.data.due_date,
    total_amount: finalTotalAmount,
    status: parsedData.data.status,
  }
  
  if (parsedData.data.issue_date) payload.issue_date = parsedData.data.issue_date
  if (parsedData.data.external_link) payload.external_link = parsedData.data.external_link

  // 3. Gerar Cabeçalho da Fatura
  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error("Erro ao salvar fatura:", error)
    return { error: "Ocorreu um erro ao gerar a fatura." }
  }

  // 4. Vincular Atendimentos à Fatura (se houverem)
  if (recordsToInvoice && recordsToInvoice.length > 0) {
    const recordIds = recordsToInvoice.map((r) => r.id)
    
    // Atualiza todos para vinculados e muda status para FATURADO (ou dependendo da regra de nengocio, mantém CONCLUIDO e a fatura controla).
    await supabase
      .from("clinical_records")
      .update({ 
        invoice_id: invoice.id,
        status: "FATURADO" 
      })
      .in("id", recordIds)
  }

  revalidatePath("/financeiro/faturas")
  return { success: true, data: invoice }
}

export async function getInvoicesAction() {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return null

  const organization = await getOrganizationAction()
  if (!organization) return null

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(`
      id,
      reference_month,
      issue_date,
      due_date,
      total_amount,
      status,
      client_id,
      clients:client_id (trade_name, cnpj)
    `)
    .eq("organization_id", organization.id)
    .order("reference_month", { ascending: false })

  if (error) {
    console.error("Erro ao buscar faturas:", error)
    return []
  }

  if (!invoices) return []

  return invoices.map((inv: any) => ({
    id: inv.id,
    reference_month: inv.reference_month,
    issue_date: inv.issue_date,
    due_date: inv.due_date,
    total_amount: inv.total_amount,
    status: inv.status,
    client_name: inv.clients?.trade_name || "—",
    client_cnpj: inv.clients?.cnpj || "—",
  }))
}

export async function getInvoiceByIdAction(id: string) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return null

  const organization = await getOrganizationAction()
  if (!organization) return null

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select(`
      *,
      clients:client_id (trade_name, cnpj)
    `)
    .eq("id", id)
    .eq("organization_id", organization.id)
    .single()

  if (invoiceError || !invoice) return null
  
  // Buscar ASOs vinculados
  const { data: clinicalRecords, error: recordsError } = await supabase
    .from("clinical_records")
    .select(`
      id,
      exam_type,
      exam_date,
      result,
      status,
      employees (
        name,
        cpf
      )
    `)
    .eq("invoice_id", id)
    .order("exam_date", { ascending: true })

  // Se precisar, poderiamos somar items de cada record, mas por agora 
  // confiamos no total amount da invoice (que futuramente pode ser o count)

  return {
    ...invoice,
    clinical_records: clinicalRecords || [],
  }
}

export async function updateInvoiceStatusAction(id: string, status: "RASCUNHO" | "EMITIDA" | "PAGA" | "CANCELADA") {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return { error: "Usuário não autenticado." }

  const organization = await getOrganizationAction()
  if (!organization) return { error: "Organização não encontrada." }

  const { error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", id)
    .eq("organization_id", organization.id)

  if (error) {
    console.error("Erro ao atualizar status da fatura:", error)
    return { error: "Ocorreu um erro ao atualizar o status." }
  }

  revalidatePath("/financeiro/faturas")
  revalidatePath(`/financeiro/faturas/${id}`)
  return { success: true }
}

export async function deleteInvoiceAction(id: string) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return { error: "Usuário não autenticado." }

  const organization = await getOrganizationAction()
  if (!organization) return { error: "Organização não encontrada." }

  // 1. Verificar se é rascunho (poderíamos travar para emitidas)
  const { data: invoice } = await supabase
    .from("invoices")
    .select("status")
    .eq("id", id)
    .single()

  if (invoice?.status !== "RASCUNHO") {
     return { error: "Só é possível excluir faturas em Rascunho." }
  }

  // 2. Desvincular ASOs
  await supabase
    .from("clinical_records")
    .update({ invoice_id: null, status: 'CONCLUIDO' }) // Volta status pra concluido
    .eq("invoice_id", id)

  // 3. Deletar
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("organization_id", organization.id)

  if (error) {
    console.error("Erro ao deletar fatura:", error)
    return { error: "Ocorreu um erro ao deletar a fatura." }
  }

  revalidatePath("/financeiro/faturas")
  return { success: true }
}
