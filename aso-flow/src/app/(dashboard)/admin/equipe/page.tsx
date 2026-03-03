import { Metadata } from "next"
import { InviteForm } from "@/src/modules/admin/components/invite-form"

export const metadata: Metadata = {
  title: "Equipe",
}

export default function EquipePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
        <p className="text-muted-foreground">
          Adicione e faça a gestão dos membros que têm acesso ao sistema da sua consultoria.
        </p>
      </div>

      <div className="mt-8">
        <InviteForm />
      </div>
    </div>
  )
}