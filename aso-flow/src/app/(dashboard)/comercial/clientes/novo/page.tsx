import { Metadata } from "next";
import { getProceduresAction } from "@/src/modules/operacional/services/procedureService";
import { ClientForm } from "@/src/modules/comercial/components/client-form";

export const metadata: Metadata = {
    title: "Novo Cliente | ASO-Flow",
}

export default async function NovoClientePage() {
    const procedures = await getProceduresAction()
    const validProcedures = Array.isArray(procedures) ? procedures : []

    return (
        <div className="flex-1 flex flex-col p-8 gap-4 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between pb-6">
                <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
            </div>

            <div>
                <ClientForm 
                    procedures={validProcedures.map(p => ({
                        id: p.id!,
                        name: p.name,
                        base_price: p.base_price
                    }))}
                />
            </div>
        </div>
    )
}
