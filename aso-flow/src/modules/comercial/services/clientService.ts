'use server'
import { createClient } from "../../../lib/supabase/server";
import z from "zod";
import { revalidatePath } from "next/cache";
import { getOrganizationAction } from "../../admin/services/organizationService";
import { getSessionUser } from "../../auth/services/authService";

// Esquema de validação zod
const clientSchema = z.object({

    id: z.string().optional(),
    organization_id: z.string().uuid().optional(),
    trade_name: z.string().min(2, "O nome fantasia é obrigatório."),
    corporate_name: z.string().min(2, "O nome empresarial do cliente é obrigatório."),
    cnpj: z.string().min(14, "O CNPJ do cliente é obrigatório."),
    risk_degree: z.coerce.number().int().optional(),
    billing_email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
    financial_contact_name: z.string().optional(),
    status: z.enum(["ATIVO", "INATIVO"]).optional(),

});

export type ClientFormData = z.infer<typeof clientSchema>

export async function upsertClientAction(data: ClientFormData) {

    //Validação de dados
    const parsedata = clientSchema.safeParse(data);

    if (!parsedata.success) {
        console.error("ERROS DE VALIDAÇÃO ZOD:", parsedata.error.format());
        return {
            error: "Dados de formulario inválidos!"
        }
    }

    const supabase = await createClient()

    const user = await getSessionUser()
    if (!user) {
        return {
            error: "Usuario não autenticado."
        }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!profile?.organization_id) {
        return { error: "Usuário não vinculado a nenhuma organização." };
    }

    const payload = {
        ...data,
        organization_id: profile.organization_id,
    };

    if (!payload.id) {
        delete payload.id;
    }

    const { data: client, error } = await supabase
        .from('clients')
        .upsert(payload)
        .select()
        .single()

    if (error) {
        console.error("Erro ao salvar client: ", error)
        return {
            error: "Ocorreu um erro ao guardar os dados."
        }
    }

    revalidatePath('/clientes');

    return {
        success: true,
        data: client
    }

}

export async function getClientAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const organization = await getOrganizationAction()

    if (!organization) {
        return null
    }

    const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', organization.id)

    return clients

}

export async function getClientByIdAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const organization = await getOrganizationAction()

    if (!organization) {
        return null
    }

    const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('organization_id', (await organization).id)
        .single()

    return client
}

export async function deleteClientAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const organization = await getOrganizationAction()

    if (!organization) {
        return null
    }

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('organization_id', (await organization).id)

    if (error) {
        console.error("Erro ao deletar cliente: ", error)
        return {
            error: "Ocorreu um erro ao deletar o cliente."
        }
    }

    revalidatePath('/clientes');

    return { success: true };

}
