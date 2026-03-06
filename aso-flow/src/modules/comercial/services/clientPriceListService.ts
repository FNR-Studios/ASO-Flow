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

export async function deleteClientPriceListAction(
  clientId: string,
  procedureId: string
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

  const { error } = await supabase
    .from("client_price_list")
    .delete()
    .eq("client_id", clientId)
    .eq("procedure_id", procedureId)

  if (error) {
    console.error("Erro ao remover exceção de preço:", error)
    return { error: "Ocorreu um erro ao remover a exceção de preço." }
  }

  revalidatePath(`/comercial/clientes/${clientId}`)

  return { success: true }
}
