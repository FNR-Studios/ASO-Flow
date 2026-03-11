'use server'

import { createClient } from "../../../lib/supabase/server"
import z from "zod"
import { getOrganizationAction } from "../../admin/services/organizationService"
import { revalidatePath } from "next/cache"
import { getProceduresByIdAction } from "../../operacional/services/procedureService"
import { getClientByIdAction } from "./clientService"
import { getSessionUser } from "../../auth/services/authService"


const clientPriceListSchema = z.object({
  client_id: z.string().uuid("ID do cliente inválido."),
  procedure_id: z.string().uuid("ID do procedimento inválido."),
  custom_price: z.number().positive("O preço precisa ser maior que zero."),
})

export type ClientPriceListFormData = z.infer<typeof clientPriceListSchema>

export async function upsertClientPriceListAction(
  data: ClientPriceListFormData
) {
  const parsedData = clientPriceListSchema.safeParse(data)

  if (!parsedData.success) {
    return { error: "Dados de formulário inválidos!" }
  }

  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) {
    return { error: "Usuário não autenticado." }
  }

  const organization = await getOrganizationAction()
  if (!organization) {
    return { error: "Usuário não vinculado a nenhuma organização." }
  }

  const client = await getClientByIdAction(data.client_id)
  if (!client) {
    return { error: "Nenhum cliente encontrado." }
  }

  const procedure = await getProceduresByIdAction(data.procedure_id)
  if (!procedure) {
    return { error: "Nenhum procedimento encontrado." }
  }

  const payload = {
    client_id: data.client_id,
    procedure_id: data.procedure_id,
    custom_price: data.custom_price,
  }

  const { data: clientPriceList, error } = await supabase
    .from("client_price_list")
    .upsert(payload, {
      onConflict: "client_id,procedure_id",
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao salvar preço do cliente:", error)
    return { error: "Ocorreu um erro ao guardar os dados." }
  }

  revalidatePath("/admin/clientes/precos")

  return {
    success: true,
    data: clientPriceList,
  }
}

export async function bulkUpsertClientPriceListAction(
  clientId: string,
  prices: { procedure_id: string; custom_price: number }[]
) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) {
    return { error: "Usuário não autenticado." }
  }

  const organization = await getOrganizationAction()
  if (!organization) {
    return { error: "Usuário não vinculado a nenhuma organização." }
  }

  const client = await getClientByIdAction(clientId)
  if (!client) {
    return { error: "Nenhum cliente encontrado." }
  }

  // Filtrar apenas preços válidos (maiores que 0)
  const validPrices = prices.filter(p => p.custom_price > 0)

  if (validPrices.length === 0) {
    // Se não houver preços para salvar, podemos apenas retornar sucesso ou deletar os existentes?
    // Por enquanto, vamos apenas deletar se o usuário limpar um preço.
    // Mas o ideal é que se o campo estiver vazio, use o preço base.
  }

  const payload = validPrices.map(p => ({
    client_id: clientId,
    procedure_id: p.procedure_id,
    custom_price: p.custom_price,
  }))

  // Primeiro, vamos deletar os preços que não estão na lista (se o usuário removeu um preço customizado)
  // Ou talvez apenas fazer upsert e o que não estiver lá continua lá? 
  // O requisito é "inserir o preço personalizado". Se estiver vazio, assume-se que não tem preço personalizado.
  
  // Vamos deletar todos os preços personalizados atuais do cliente e inserir os novos.
  // Isso simplifica a sincronização.
  const { error: deleteError } = await supabase
    .from("client_price_list")
    .delete()
    .eq("client_id", clientId)

  if (deleteError) {
    console.error("Erro ao limpar preços do cliente:", deleteError)
    return { error: "Ocorreu um erro ao atualizar os preços." }
  }

  if (payload.length > 0) {
    const { error: insertError } = await supabase
      .from("client_price_list")
      .insert(payload)

    if (insertError) {
      console.error("Erro ao inserir novos preços do cliente:", insertError)
      return { error: "Ocorreu um erro ao salvar os novos preços." }
    }
  }

  revalidatePath(`/comercial/clientes/${clientId}`)
  revalidatePath(`/comercial/clientes/${clientId}/editar`)

  return { success: true }
}

export async function getClientPriceListByClientAction(clientId: string) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) {
    return null
  }

  const organization = await getOrganizationAction()
  if (!organization) {
    return null
  }

  const client = await getClientByIdAction(clientId)
  if (!client) {
    return null
  }

  const { data: priceList, error } = await supabase
    .from("client_price_list")
    .select(`
      client_id,
      procedure_id,
      custom_price,
      procedures (
        id,
        name,
        base_price
      )
    `)
    .eq("client_id", clientId)
    .order("procedures(name)", { ascending: true })

  if (error) {
    console.error("Erro ao buscar preços do cliente:", error)
    return null
  }

  return priceList
}

export async function getClientProcedurePriceAction(
  clientId: string,
  procedureId: string
) {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) {
    return null
  }

  const organization = await getOrganizationAction()
  if (!organization) {
    return null
  }

  const { data: price, error } = await supabase
    .from("client_price_list")
    .select("custom_price")
    .eq("client_id", clientId)
    .eq("procedure_id", procedureId)
    .single()

  if (error) {
    // não é erro crítico → apenas não existe preço customizado
    return null
  }

  return price.custom_price
}