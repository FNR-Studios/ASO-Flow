import { Metadata } from "next"
import { getOrganizationAction } from "@/src/modules/admin/services/organizationService"
import { OrganizationManager } from "@/src/modules/admin/components/organization-manager"

export const metadata: Metadata = {
  title: "Organização",
}

export default async function SettingsPage() {
  const organization = await getOrganizationAction()

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Organização</h1>
        <p className="text-muted-foreground">
          Gerencie os dados da sua empresa para os relatórios e documentos ASO.
        </p>
      </div>

      {/* Passa os dados (ou null) para o componente decidir o que mostrar */}
      <OrganizationManager initialData={organization} />
    </div>
  )
}