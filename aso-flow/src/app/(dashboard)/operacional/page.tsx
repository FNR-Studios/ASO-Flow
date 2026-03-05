"use client"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Activity, ClipboardList, Plus, FileText } from "lucide-react"
import Link from "next/link"

export default function ExamePage() {
  
  {/* PÁGINA MODELO */}


  return (
    <div className="flex-1 flex flex-col p-8 gap-8">
      {/* CABEÇALHO DO PAINEL */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Painel Operacional</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral dos procedimentos, exames e protocolos ativos.
        </p>
      </div>

      {/* 1. MÉTRICAS (CARDS DE RESUMO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Procedimentos / Exames</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Aqui no futuro você vai colocar o número real vindo do banco */}
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">
              +4 cadastrados este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Protocolos (PCMSO)</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ativos no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Funções Mapeadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando revisão: 2
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. AÇÕES RÁPIDAS E NAVEGAÇÃO */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Ações Rápidas</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          
          {/* Botão Primário - Ação mais importante */}
          <Link href="/operacional/procedimentos/novo">
            <Button className="h-10">
              <Plus className="mr-2 h-4 w-4" />
              Novo Exame
            </Button>
          </Link>

          {/* Botões Secundários - Navegação para as listas */}
          <Link href="/operacional/procedimentos">
            <Button variant="outline" className="h-10">
              Ver Todos os Exames
            </Button>
          </Link>

          <Link href="/operacional/protocolos">
            <Button variant="outline" className="h-10">
              Gerenciar Protocolos
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. ATIVIDADES RECENTES (Placeholder para o futuro) */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Últimos Exames Cadastrados</CardTitle>
          <CardDescription>
            Histórico recente de adições no catálogo de procedimentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded-md">
            Quando você integrar com o banco de dados, uma tabela com os últimos 5 itens aparecerá aqui.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}