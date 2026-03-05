import { JobRoleForm } from "@/src/modules/operacional/components/jobRole-form"
import { getClientAction } from "@/src/modules/comercial/services/clientService"

export default async function NovoCargoPage() {
  const clients = await getClientAction()

  const clientsList =
    clients?.map((client) => ({
      id: client.id,
      name: client.trade_name
    })) || []

  return (
    <div className="p-8">
      <JobRoleForm clients={clientsList} />
    </div>
  )
}