import { createClient } from "../../../lib/supabase/server";
import z from "zod";
import { getSessionUser } from "../../auth/services/authService";
import { getOrganizationAction } from "../../admin/services/organizationService";
import { revalidatePath } from "next/cache";

const procedureSchema = z.object({
    id: z.string().uuid().optional(),
    organization_id: z.string().uuid().optional(),
    name: z.string().min(2, "O nome do procedimento é obrigatório."),
    type: z.enum(["clinico", "laboratorial", "imagem"]),
    base_price: z.number().positive("O preço precisa ser maior que zero."),
    tuss_code: z.string().optional()
})

export type ProcedureFormData = z.infer<typeof procedureSchema>

export async function upsertProcedureAction(data: ProcedureFormData) {

    const parsedata = procedureSchema.safeParse(data);

    if (!parsedata.success) {
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

    const organization = await getOrganizationAction()

    if (!organization) {
        return {
            error: "Usuário não vinculado a nenhuma organização."
        }
    }

    const payload = {
        ...data,
        organization_id: (organization.id),
    }

    if (!payload.id) {
        delete payload.id;
    }

    const { data: procedure, error } = await supabase
        .from('procedures')
        .upsert(payload)
        .select()
        .single()

    if (error) {
        console.error("Erro ao salvar procedimento: ", error)
        return {
            error: "Ocorreu um erro ao guardar os dados."
        }
    }

    revalidatePath('/admin/procedures');
    return {
        success: true,
        data: procedure
    }

}

export async function getProceduresAction() {
    const supabase = await createClient()

    const user = await getSessionUser()
    if (!user) {
        return {
            error: "Usuario não autenticado."
        }
    }

    const organization = await getOrganizationAction()

    if (!organization) {
        return {
            error: "Usuário não vinculado a nenhuma organização."
        }
    }

    const { data: procedures } = await supabase
        .from('procedures')
        .select('*')
        .eq('organization_id', (await organization).id)

    return procedures

}

export async function getProceduresByIdAction(id: string) {
    const supabase = await createClient()

    const user = await getSessionUser()
    if (!user) {
        return {
            error: "Usuario não autenticado."
        }
    }

    const organization = await getOrganizationAction()

    if (!organization) {
        return {
            error: "Usuário não vinculado a nenhuma organização."
        }
    }

    const { data: procedure, error } = await supabase
        .from('procedures')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organization.id)
        .single()

    if (error || !procedure) {
        console.error("Procedimento não encontrado ou erro:", error?.message)
        return null
    }

    return procedure

}

export async function deleteProcedureAction(id: string) {
    const supabase = await createClient()

    const user = await getSessionUser()
    if (!user) {
        return {
            error: "Usuario não autenticado."
        }
    }

    const organization = await getOrganizationAction()
    if (!organization) {
        return {
            error: "Usuário não vinculado a nenhuma organização."
        }
    }

    const { error } = await supabase
        .from('procedures')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization.id)

    if (error) {
        console.error("Erro ao deletar procedimento: ", error)
        return {
            error: "Ocorreu um erro ao deletar o procedimento."
        }

    }

    revalidatePath('/admin/procedures');
    return {
        success: true
    }
}