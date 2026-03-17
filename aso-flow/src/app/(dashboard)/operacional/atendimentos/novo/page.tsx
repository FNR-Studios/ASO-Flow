import { AttendanceForm } from "@/src/modules/operacional/components/attendance-form"
import { getEmployeesAction } from "@/src/modules/operacional/services/employeeService"
import { getProceduresAction } from "@/src/modules/operacional/services/procedureService"
import { createClient } from "@/src/lib/supabase/server"
import { getOrganizationAction } from "@/src/modules/admin/services/organizationService"

export default async function NovoAtendimentoPage() {
  const supabase = await createClient()
  const organization = await getOrganizationAction()
  
  if (!organization) {
    return <div>Erro: Organização não definida</div>
  }

  // 1. Fetch raw data in parallel
  const [employeesRaw, proceduresRaw, pricesRaw, protocolsRaw] = await Promise.all([
    getEmployeesAction(),
    getProceduresAction(),
    supabase
      .from("client_price_list")
      .select("client_id, procedure_id, custom_price")
      .eq("procedures.organization_id", organization.id), // Ensure safety although client_id belongs to Org
    supabase
      .from("exam_protocols")
      .select("job_role_id, procedure_id, exam_type")
  ])

  // 2. Format Employees
  const employeesList = (employeesRaw || []).map((e: any) => ({
    id: e.id,
    full_name: e.name || e.full_name, // Suporta os dois nomes dependendo de como vier do banco
    cpf: e.cpf,
    client_id: e.client_id,
    job_role_id: e.job_role_id,
    client_name: e.client_name,
    job_role_name: e.job_role_title, // Corrigido de job_role_name para job_role_title que é o que vem do getEmployeesAction
  }))

  // 3. Format Procedures
  const proceduresList = (Array.isArray(proceduresRaw) ? proceduresRaw : []).map((p: any) => ({
    id: p.id,
    name: p.name,
    base_price: p.base_price,
  }))

  // 4. Build Client Prices Record (Client ID -> Prices array)
  const clientPricesRecord: Record<string, any[]> = {}
  if (pricesRaw.data) {
    pricesRaw.data.forEach((cp) => {
      if (!clientPricesRecord[cp.client_id]) {
        clientPricesRecord[cp.client_id] = []
      }
      clientPricesRecord[cp.client_id].push({
        procedure_id: cp.procedure_id,
        custom_price: cp.custom_price,
      })
    })
  }

  // 5. Build Protocols Record (Job Role ID -> Protocols array)
  const jobRoleProtocolsRecord: Record<string, any[]> = {}
  if (protocolsRaw.data) {
    protocolsRaw.data.forEach((protocol) => {
      if (!jobRoleProtocolsRecord[protocol.job_role_id]) {
        jobRoleProtocolsRecord[protocol.job_role_id] = []
      }
      jobRoleProtocolsRecord[protocol.job_role_id].push({
        procedure_id: protocol.procedure_id,
        exam_type: protocol.exam_type,
      })
    })
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Nova Guia de Atendimento (ASO)</h1>
        <p className="text-muted-foreground">
          Selecione o paciente e o tipo de exame para carregar automaticamente os procedimentos.
        </p>
      </div>

      <AttendanceForm
        employees={employeesList}
        procedures={proceduresList}
        clientPricesRecord={clientPricesRecord}
        jobRoleProtocolsRecord={jobRoleProtocolsRecord}
      />
    </div>
  )
}
