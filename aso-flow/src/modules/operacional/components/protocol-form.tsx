'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { bulkUpsertProtocolsByJobRoleAndTypeAction } from "@/src/modules/operacional/services/examProtocolService"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { ArrowLeft, Check } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

const EXAM_TYPES = [
  { value: "ADMISSONAL", label: "Admissional" },
  { value: "PERIODICO", label: "Periódico" },
  { value: "DEMISSIONAL", label: "Demissional" },
  { value: "RETORNO", label: "Retorno ao Trabalho" },
  { value: "MUDANCA", label: "Mudança de Função" },
]

interface Procedure {
  id: string
  name: string
}

interface JobRole {
  id: string
  title: string
  client_name?: string
}

interface ProtocolFormProps {
  jobRoles: JobRole[]
  procedures: Procedure[]
  initialJobRoleId?: string
  initialExamType?: string
  initialSelectedProcedures?: { procedure_id: string; periodic_months?: number | null }[]
  isEditing?: boolean
}

export function ProtocolForm({
  jobRoles,
  procedures,
  initialJobRoleId = "",
  initialExamType = "ADMISSONAL",
  initialSelectedProcedures = [],
  isEditing = false
}: ProtocolFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedJobRoleId, setSelectedJobRoleId] = useState(initialJobRoleId)
  const [selectedExamType, setSelectedExamType] = useState(initialExamType)
  
  // Estado para os procedimentos selecionados - Inicialização preguiçosa para evitar loops
  const [procedureStates, setProcedureStates] = useState<Record<string, { selected: boolean, periodic_months: string }>>(() => {
    const initialState: Record<string, { selected: boolean, periodic_months: string }> = {}
    procedures.forEach(proc => {
      const initial = initialSelectedProcedures.find(p => p.procedure_id === proc.id)
      initialState[proc.id] = {
        selected: !!initial,
        periodic_months: initial?.periodic_months?.toString() || ""
      }
    })
    return initialState
  })

  const router = useRouter()

  const toggleProcedure = (id: string) => {
    setProcedureStates(prev => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id].selected }
    }))
  }

  const updatePeriodicMonths = (id: string, value: string) => {
    setProcedureStates(prev => ({
      ...prev,
      [id]: { ...prev[id], periodic_months: value }
    }))
  }

  async function handleSubmit() {
    if (!selectedExamType) {
      toast.error("Selecione o tipo de exame.")
      return
    }

    if (!selectedJobRoleId) {
      toast.error("Selecione o cargo.")
      return
    }

    const protocolsToSave = Object.entries(procedureStates)
      .filter(([_, data]) => data.selected)
      .map(([id, data]) => ({
        procedure_id: id,
        periodic_months: selectedExamType === "PERIODICO" && data.periodic_months ? parseInt(data.periodic_months) : null
      }))

    if (protocolsToSave.length === 0) {
      toast.error("Selecione pelo menos um procedimento para este protocolo.")
      return
    }

    setIsLoading(true)

    const response = await bulkUpsertProtocolsByJobRoleAndTypeAction(
      selectedJobRoleId, 
      selectedExamType, 
      protocolsToSave
    )

    if (response?.error) {
      toast.error(response.error)
      setIsLoading(false)
      console.log("Erro: ", response.error)
      return
    }

    toast.success(isEditing ? "Protocolo atualizado com sucesso!" : "Protocolo cadastrado com sucesso!")
    router.push("/operacional/protocolos")
    router.refresh()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <Button variant="ghost" onClick={() => router.push("/operacional/protocolos")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a lista
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditing ? "Editar Protocolo" : "Novo Protocolo"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="exam_type">Tipo de Exame *</Label>
              <select
                id="exam_type"
                disabled={isLoading || isEditing}
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {EXAM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="job_role">Cargo *</Label>
              <select
                id="job_role"
                disabled={isLoading || isEditing}
                value={selectedJobRoleId}
                onChange={(e) => setSelectedJobRoleId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione o cargo</option>
                {jobRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.client_name ? `${role.client_name} - ` : ""}{role.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Procedimentos do Protocolo</Label>
            <p className="text-sm text-muted-foreground">
              Selecione quais procedimentos fazem parte deste protocolo ({selectedExamType}).
            </p>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[50px] text-center">Sel.</TableHead>
                    <TableHead>Procedimento</TableHead>
                    {selectedExamType === "PERIODICO" && (
                      <TableHead className="w-[200px]">Periodicidade (Meses)</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {procedures.map((proc) => {
                    const state = procedureStates[proc.id] || { selected: false, periodic_months: "" }
                    return (
                      <TableRow 
                        key={proc.id} 
                        className={state.selected ? "bg-blue-50/30" : "hover:bg-muted/30 cursor-pointer"}
                        onClick={() => !isLoading && toggleProcedure(proc.id)}
                      >
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <Input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={state.selected}
                            onChange={() => toggleProcedure(proc.id)}
                            disabled={isLoading}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{proc.name}</TableCell>
                        {selectedExamType === "PERIODICO" && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Input 
                              type="number"
                              required
                              placeholder="Ex: 12"
                              disabled={isLoading || !state.selected}
                              value={state.periodic_months}
                              onChange={(e) => updatePeriodicMonths(proc.id, e.target.value)}
                              className="h-8"
                            />
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6">
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Salvando..." : "Salvar Protocolo"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
