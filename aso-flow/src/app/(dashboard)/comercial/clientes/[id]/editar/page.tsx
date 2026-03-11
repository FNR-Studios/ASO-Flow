import { notFound } from "next/navigation"
import { getClientByIdAction } from "@/src/modules/comercial/services/clientService"
import { getProceduresAction } from "@/src/modules/operacional/services/procedureService"
import { getClientPriceListByClientAction } from "@/src/modules/comercial/services/clientPriceListService"
import { ClientForm } from "@/src/modules/comercial/components/client-form"

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [cliente, procedures, priceList] = await Promise.all([
    getClientByIdAction(id),
    getProceduresAction(),
    getClientPriceListByClientAction(id),
  ])

  if (!cliente) notFound()

  // Converter a lista de preços em um objeto Record<procedureId, custom_price>
  const initialPrices: Record<string, number> = {}
  if (Array.isArray(priceList)) {
    priceList.forEach((item) => {
      if (item.procedure_id && item.custom_price) {
        initialPrices[item.procedure_id] = item.custom_price
      }
    })
  }

  // Garantir que procedures é um array válido
  const validProcedures = Array.isArray(procedures) ? procedures : []

  return (
    <ClientForm
      initialData={{
        id: cliente.id,
        trade_name: cliente.trade_name,
        corporate_name: cliente.corporate_name,
        cnpj: cliente.cnpj,
        billing_email: cliente.billing_email ?? "",
        financial_contact_name: cliente.financial_contact_name ?? "",
        risk_degree: cliente.risk_degree,
        status: cliente.status,
      }}
      procedures={validProcedures.map(p => ({
        id: p.id!,
        name: p.name,
        base_price: p.base_price
      }))}
      initialPrices={initialPrices}
    />
  )
}
