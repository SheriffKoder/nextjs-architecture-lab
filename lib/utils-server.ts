import { NextRequest } from "next/server";
import { createAdminClient, createClient } from "./supabase/server";
import type { User, UserRole } from "./types";
import { DEFAULT_INTERNAL_ORG_ID } from "./constants";

export async function getAuthUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return data?.claims ?? null;
}

export function getAuthUserFromHeader(request: NextRequest) {
  const authHeader = request.headers.get("X_AUTH_USER");
  if (!authHeader) {
    return null;
  }

  try {
    const decoded = Buffer.from(authHeader, "base64").toString("utf-8");
    const authUser = JSON.parse(decoded);
    return authUser;
  } catch {
    return null;
  }
}

/** Authenticated user profile plus a single app role (backed by org_members in DB). */
export type UserWithRole = User & {
  role: UserRole | null;
};

function normalizeRoleRelation(
  roles: { id: string; name: string; key: string } | { id: string; name: string; key: string }[] | null
): { id: string; name: string; key: string } | null {
  if (!roles) return null;
  return Array.isArray(roles) ? roles[0] ?? null : roles;
}

function mapMembershipToRole(m: {
  role_id: string;
  roles: { id: string; name: string; key: string } | { id: string; name: string; key: string }[] | null;
}): UserRole | null {
  const role = normalizeRoleRelation(m.roles);
  if (!role) return null;
  return {
    role_id: m.role_id,
    role: { id: role.id, key: role.key, name: role.name },
  };
}

export function roleFromMembershipRow(m: {
  role_id: string;
  roles: { id: string; name: string; key: string } | { id: string; name: string; key: string }[] | null;
}): UserRole | null {
  return mapMembershipToRole(m);
}

async function fetchUserRole(
  db: Awaited<ReturnType<typeof createAdminClient>>,
  userId: string
): Promise<UserRole | null> {
  const { data: memberships, error } = await db
    .from("org_members")
    .select("role_id, roles(id, name, key)")
    .eq("user_id", userId)
    .eq("org_id", DEFAULT_INTERNAL_ORG_ID)
    .limit(1);

  if (error || !memberships?.length) {
    const { data: fallback } = await db
      .from("org_members")
      .select("role_id, roles(id, name, key)")
      .eq("user_id", userId)
      .limit(1);
    return fallback?.[0] ? mapMembershipToRole(fallback[0] as any) : null;
  }

  return mapMembershipToRole(memberships[0] as any);
}

export async function getUserData(
  request: NextRequest
): Promise<UserWithRole | null> {
  try {
    const supabase = await createClient();
    let authUser = getAuthUserFromHeader(request);

    if (!authUser) {
      const { data } = await supabase.auth.getClaims();
      const user = data?.claims;
      if (!user) return null;
      authUser = user;
    }

    const authUserId = authUser.sub as string;
    const db = await createAdminClient();

    const { data: userRow, error: userError } = await db
      .from("users")
      .select("id, email, name, created_at, updated_at, phone")
      .eq("id", authUserId)
      .single();

    if (userError || !userRow) return null;

    const role = await fetchUserRole(db, authUserId);

    return {
      ...userRow,
      role,
    } as UserWithRole;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return data?.claims?.sub ?? null;
}

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

export const EXPORT_CSV_LIMIT = 10000;
export function toCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  const keys = Object.keys(data[0]);
  const header = keys.map(escapeCsvCell).join(",");
  const rows = data.map((row) => keys.map((k) => escapeCsvCell(row[k])).join(","));
  return [header, ...rows].join("\r\n");
}
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
