import { createAdminClient } from "../../supabase/server";
import { DEFAULT_INTERNAL_ORG_ID } from "../constants";
import { fetchUserRole } from "../../roles/server/membership";
import type { UserWithRole } from "../types";

export type CreateUserParams = {
  email: string;
  password: string;
  name?: string | null;
  phone?: string | null;
  role_id: string;
};

export type CreateUserResult =
  | { ok: true; user: UserWithRole }
  | { ok: false; error: string; status: number };

/**
 * Create auth user, public.users row, and role via org_members (default internal org only).
 */
export async function createUserWithRole(
  params: CreateUserParams
): Promise<CreateUserResult> {
  const { email, password, name, phone, role_id } = params;

  const db = await createAdminClient();
  const { data: existingUser } = await db
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingUser) {
    return { ok: false, error: "User already exists", status: 409 };
  }

  const supabase = await createAdminClient();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser(
    {
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    }
  );

  if (authError) {
    return { ok: false, error: authError.message, status: 400 };
  }

  const userId = authData.user.id;

  const { error: insertUserError } = await db.from("users").insert({
    id: userId,
    email,
    name: name ?? null,
    phone: phone ?? null,
  });
  if (insertUserError) {
    return { ok: false, error: insertUserError.message, status: 400 };
  }

  const { error: insertMemError } = await db.from("org_members").insert({
    org_id: DEFAULT_INTERNAL_ORG_ID,
    user_id: userId,
    role_id,
  });
  if (insertMemError) {
    return { ok: false, error: insertMemError.message, status: 400 };
  }

  const { data: userRow, error: userFetchError } = await db
    .from("users")
    .select("id, email, name, created_at, updated_at, phone")
    .eq("id", userId)
    .single();

  const role = await fetchUserRole(db, userId);

  if (userFetchError || !userRow) {
    return {
      ok: true,
      user: {
        id: userId,
        email,
        name: name ?? null,
        phone: phone ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role,
      },
    };
  }

  return { ok: true, user: { ...userRow, role } as UserWithRole };
}

/** @deprecated Use createUserWithRole */
export const createUserWithOrgMembership = createUserWithRole;
