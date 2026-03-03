'use client'

import { useState } from "react"
import { OrganizationForm } from "@/src/modules/admin/components/organization-form"
import { OrganizationFormData } from "@/src/modules/admin/services/organizationService"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Building2, Mail, Phone, MapPin, UserCheck } from "lucide-react"

interface OrganizationManagerProps {
  initialData: OrganizationFormData | null
}

export function OrganizationManager({ initialData }: OrganizationManagerProps) {
  // Se initialData for null (não tem empresa), isEditing começa como TRUE
  // Se tiver dados, isEditing começa como FALSE (modo leitura)
  const [isEditing, setIsEditing] = useState(!initialData)

  // CENÁRIO A: Modo de Edição ou Criação
  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Se já tinha dados, mostra o botão de cancelar edição */}
        {initialData && (
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancelar Edição
          </Button>
        )}

        {/* Se NÃO tinha dados, mostra a mensagem de boas-vindas */}
        {!initialData && (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-md border border-blue-200 mb-6">
            <h3 className="font-bold mb-1">Bem-vindo(a) ao ASO Flow!</h3>
            <p className="text-sm">Para começar a usar o sistema, por favor, cadastre os dados da sua consultoria abaixo.</p>
          </div>
        )}

        {/* Renderiza o formulário que criamos no passo anterior */}
        <OrganizationForm initialData={initialData} />
      </div>
    )
  }

  // CENÁRIO B: Modo de Leitura (Painel Visual)
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{initialData?.trade_name}</CardTitle>
          <CardDescription>{initialData?.corporate_name || "Razão Social não informada"}</CardDescription>
        </div>
        <Button onClick={() => setIsEditing(true)}>Editar Dados</Button>
      </CardHeader>

      <CardContent className="space-y-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-500 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Identidade
            </h3>
            <div className="text-sm">
              <p><span className="font-medium">CNPJ:</span> {initialData?.cnpj || "Não informado"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-500 flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Responsabilidade Técnica
            </h3>
            <div className="text-sm">
              <p><span className="font-medium">Responsável:</span> {initialData?.tech_responsible_name}</p>
              <p><span className="font-medium">Registro:</span> {initialData?.tech_responsible_register || "Não informado"}</p>
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            <h3 className="font-semibold text-slate-500 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Contato e Endereço
            </h3>
            <div className="text-sm space-y-2">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {initialData?.email || "Não informado"}</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {initialData?.phone || "Não informado"}</p>
              <p className="flex items-center gap-2 text-slate-600"> {initialData?.address || "Endereço não informado"}</p>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}