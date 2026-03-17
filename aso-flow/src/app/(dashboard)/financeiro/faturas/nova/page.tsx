import { InvoiceForm } from "@/src/modules/financeiro/components/invoice-form"
import { createClient } from "@/src/lib/supabase/server"
import { getOrganizationAction } from "@/src/modules/admin/services/organizationService"

export default async function NovaFaturaPage() {
  const supabase = await createClient()
  const organization = await getOrganizationAction()
  
  if (!organization) {
    return <div>Erro: Organização não definida</div>
  }

  // Busca Clientes Ativos do BD
  const { data: clientsRaw } = await supabase
    .from("clients")
    .select("id, trade_name, cnpj")
    .eq("organization_id", organization.id)
    .order("trade_name", { ascending: true })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Nova Fatura</h1>
        <p className="text-muted-foreground">
          Crie o cabeçalho descritivo da nova fatura em rascunho.
        </p>
      </div>

      <InvoiceForm clients={clientsRaw || []} />
    </div>
  )
}
