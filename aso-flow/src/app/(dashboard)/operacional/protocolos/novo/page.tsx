import { Metadata } from "next"
import { ProtocolForm } from "@/src/modules/operacional/components/protocol-form"
import { getJobRolesAction } from "@/src/modules/operacional/services/jobRoleService"
import { getProceduresAction } from "@/src/modules/operacional/services/procedureService"

export const metadata: Metadata = {
  title: "Novo Protocolo | ASO Flow",
}

export default async function NovoProtocoloPage() {
  const [jobRoles, procedures] = await Promise.all([
    getJobRolesAction(),
    getProceduresAction()
  ])

  // Garantir que os dados são arrays válidos e formatados
  const validJobRoles = Array.isArray(jobRoles) ? jobRoles.map(r => ({
    id: r.id!,
    title: r.title,
    client_name: r.client_name
  })) : []

  const validProcedures = Array.isArray(procedures) ? procedures.map(p => ({
    id: p.id!,
    name: p.name
  })) : []

  return (
    <div className="flex-1 flex flex-col p-8 gap-4 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Cadastrar Protocolo</h1>
      </div>

      <div>
        <ProtocolForm 
          jobRoles={validJobRoles} 
          procedures={validProcedures} 
        />
      </div>
    </div>
  )
}
