import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { DataTable } from "@/src/components/ui/data-table";
import { Button } from "@/src/components/ui/button";
import { coluna } from "./columns";
import { getClientAction } from "@/src/modules/comercial/services/clientService";

export const metadata: Metadata = {
    title: "Página de Clientes",
}

export default async function ClientesPage() {

    const clientes = await getClientAction() ?? []

    return (
        <div className="flex-1 flex flex-col p-8 gap-4 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between pb-6">
                <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de clientes</h1>

                {/* Repare no link: ele não vai para uma página nova, ele só adiciona ?action=novo na URL */}
                <Link href="/comercial/clientes/novo">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                    </Button>
                </Link>
            </div>

            <div>
                <DataTable
                    columns={coluna}
                    data={clientes}
                    searchKey="trade_name"
                    searchPlaceHolder="Pesquisar por nome fantasia..."
                />
            </div>
        </div>
    )
}