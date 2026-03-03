import { createClient } from "../../../lib/supabase/server";
import z from "zod";
import { revalidatePath } from "next/cache";
import { getOrganizationAction } from "../../admin/services/organizationService";
import { getSessionUser } from "../../auth/services/authService";
import { getClientByIdAction } from "./clientService";

const jobRoleSchema = z.object({
  id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  client_id: z.string().uuid("Cliente inválido."),
  title: z.string().min(2, "O título do cargo é obrigatório."),
  cbo_code: z.string().optional(),
  description: z.string().optional(),
});

export type JobRoleFormData = z.infer<typeof jobRoleSchema>;

export async function upsertJobRoleAction(data: JobRoleFormData) {
  const parsedData = jobRoleSchema.safeParse(data);

  if (!parsedData.success) {
    return { error: "Dados de formulário inválidos!" };
  }

  const supabase = await createClient();

  const user = await getSessionUser();
  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const client = await getClientByIdAction(data.client_id);
  if (!client) {
    return { error: "Cliente não encontrado ou não pertence a esta organização." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
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

  const { data: jobRole, error } = await supabase
    .from("job_roles")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Erro ao salvar cargo:", error);
    return { error: "Ocorreu um erro ao salvar o cargo." };
  }

  revalidatePath("/cargos");

  return {
    success: true,
    data: jobRole,
  };
}

export async function getJobRolesAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const organization = await getOrganizationAction();
  if (!organization) return null;

  const { data: jobRoles } = await supabase
    .from("job_roles")
    .select("*")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  return jobRoles;
}

export async function getJobRoleByIdAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const organization = await getOrganizationAction();
  if (!organization) return null;

  const { data: jobRole } = await supabase
    .from("job_roles")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organization.id)
    .single();

  return jobRole;
}

export async function deleteJobRoleAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const organization = await getOrganizationAction();
  if (!organization) return null;

  const { error } = await supabase
    .from("job_roles")
    .delete()
    .eq("id", id)
    .eq("organization_id", organization.id);

  if (error) {
    console.error("Erro ao deletar cargo:", error);
    return { error: "Ocorreu um erro ao deletar o cargo." };
  }

  revalidatePath("/cargos");

  return { success: true };
}