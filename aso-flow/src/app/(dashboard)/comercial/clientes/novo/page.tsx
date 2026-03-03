import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { getClientAction, getClientByIdAction } from "@/src/modules/comercial/services/clientService";
import { ClientForm } from "@/src/modules/comercial/components/client-form";

export const metadata: Metadata = {
    title: "Página de Clientes",
}

export default async function ClientesPage() {

    const clientes = await getClientAction()

    return (
        <div className="flex-1 flex flex-col p-8 gap-4 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between pb-6">
                <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
            </div>

            <div>
                <ClientForm />
            </div>
        </div>
    )
}