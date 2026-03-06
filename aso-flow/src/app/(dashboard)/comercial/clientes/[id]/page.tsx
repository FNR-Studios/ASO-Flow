import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Building2 } from "lucide-react"

import { getClientByIdAction } from "@/src/modules/comercial/services/clientService"
import { getClientPriceListByClientAction } from "@/src/modules/comercial/services/clientPriceListService"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { ClientPriceExceptionsTab } from "@/src/modules/comercial/components/client-price-exceptions-tab"

export const metadata: Metadata = {
  title: "Painel do Cliente | ASO Flow",
}

export default async function ClienteDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 1. Busca os dados do cliente no servidor
  const cliente = await getClientByIdAction(id)

  // Se o cliente não existir (ou for de outra clínica e o RLS bloquear), mostra a página 404
  if (!cliente) {
    notFound()
  }

  // 2. Busca as exceções de preço do cliente
  const priceList = await getClientPriceListByClientAction(id)

  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full p-4">
      {/* Botão de Voltar */}
      <Link href="/comercial/clientes">
        <Button variant="ghost" className="mb-2 pl-0 hover:bg-white/10 hover:cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Clientes
        </Button>
      </Link>

      {/* Cabeçalho do Cliente */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Building2 className="w-8 h-8 text-blue-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{cliente.trade_name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span>{cliente.corporate_name}</span>
              <span>•</span>
              <span>CNPJ: {cliente.cnpj}</span>
            </p>
          </div>
        </div>

        <Link href={`/comercial/clientes/${cliente.id}/editar`}>
          <Button variant="outline">Editar Dados</Button>
        </Link>
      </div>

      {/* Navegação por Abas (Tabs) */}
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="visao-geral" className="text-md">Visão Geral</TabsTrigger>
          <TabsTrigger value="cargos" className="text-md">Cargos</TabsTrigger>
          <TabsTrigger value="tabela-precos" className="text-md">Tabela de Preços</TabsTrigger>
          <TabsTrigger value="funcionarios" className="text-md">Funcionários</TabsTrigger>
          <TabsTrigger value="historico" className="text-md">Histórico ASO</TabsTrigger>
        </TabsList>

        {/* CONTEÚDO DA ABA 1: VISÃO GERAL */}
        <TabsContent value="visao-geral" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status do Contrato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${cliente.status === 'ATIVO' ? 'text-green-500' : 'text-red-500'}`}>
                  {cliente.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Grau de Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Nível {cliente.risk_degree || '-'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Contato Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">{cliente.financial_contact_name || 'Não informado'}</div>
                <p className="text-sm text-muted-foreground">{cliente.billing_email || 'Sem e-mail'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CONTEÚDO DA ABA 2: CARGOS */}
        <TabsContent value="cargos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Cargos</CardTitle>
              <CardDescription>
                Adicione e configure os riscos para as funções desta empresa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Aqui nós vamos inserir o formulário e a tabela de cargos futuramente */}
              <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg text-slate-400">
                Área de Cargos em construção...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTEÚDO DA ABA 3: TABELA DE PREÇOS (EXCEÇÕES) */}
        <TabsContent value="tabela-precos" className="mt-6">
          <ClientPriceExceptionsTab 
            clientId={cliente.id} 
            initialPriceList={priceList as any} 
          />
        </TabsContent>
        <TabsContent value="funcionarios">
          <Card><CardContent className="pt-6">Funcionários em construção...</CardContent></Card>
        </TabsContent>
        <TabsContent value="historico">
          <Card><CardContent className="pt-6">Histórico em construção...</CardContent></Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
