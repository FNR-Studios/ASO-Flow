import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProtocolForm } from "@/src/modules/operacional/components/protocol-form"
import { getJobRolesAction, getJobRoleByIdAction } from "@/src/modules/operacional/services/jobRoleService"
import { getProceduresAction } from "@/src/modules/operacional/services/procedureService"
import { getExamProtocolsByJobRoleAndTypeAction } from "@/src/modules/operacional/services/examProtocolService"

export const metadata: Metadata = {
  title: "Editar Protocolo | ASO Flow",
}

interface PageProps {
  searchParams: Promise<{ jobRoleId: string; examType: string }>
}

export default async function EditarProtocoloPage({ searchParams }: PageProps) {
  const { jobRoleId, examType } = await searchParams

  if (!jobRoleId || !examType) notFound()

  const [jobRole, allJobRoles, procedures, currentProtocols] = await Promise.all([
    getJobRoleByIdAction(jobRoleId),
    getJobRolesAction(),
    getProceduresAction(),
    getExamProtocolsByJobRoleAndTypeAction(jobRoleId, examType)
  ])

  if (!jobRole) notFound()

  // Garantir que os dados são arrays válidos e formatados
  const validJobRoles = Array.isArray(allJobRoles) ? allJobRoles.map(r => ({
    id: r.id!,
    title: r.title,
    client_name: r.client_name
  })) : []

  const validProcedures = Array.isArray(procedures) ? procedures.map(p => ({
    id: p.id!,
    name: p.name
  })) : []

  const formattedProtocols = Array.isArray(currentProtocols) ? currentProtocols.map(p => ({
    procedure_id: p.procedure_id,
    periodic_months: p.periodic_months
  })) : []

  return (
    <div className="flex-1 flex flex-col p-8 gap-4 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Editar Protocolo</h1>
      </div>

      <div>
        <ProtocolForm 
          jobRoles={validJobRoles} 
          procedures={validProcedures} 
          initialJobRoleId={jobRoleId}
          initialExamType={examType}
          initialSelectedProcedures={formattedProtocols}
          isEditing={true}
        />
      </div>
    </div>
  )
}
