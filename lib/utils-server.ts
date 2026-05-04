import { NextRequest } from "next/server";
import { createAdminClient, createClient } from "./supabase/server";
import { RoleEnum } from "./constants";

/**
 * Get the current authenticated user's full claims object
 * 
 * @returns Promise with user claims or null if not authenticated
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  
  return data?.claims ?? null;
}

export function getAuthUserFromHeader(request: NextRequest) {
  const authHeader = request.headers.get('X_AUTH_USER');
  if (!authHeader) {
    return null;
  }
  
  try {
    const decoded = Buffer.from(authHeader, 'base64').toString('utf-8');
    const authUser = JSON.parse(decoded);
    return authUser;
  } catch (e) {
    return null; // Fallback if parsing/decoding fails
  }
}

/** User with org_memberships shape expected by isInternalAdminOrUser etc. */
export type UserWithMemberships = {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
  updated_at: string;
  phone: string | null;
  org_memberships: Array<{
    org_id: string;
    user_id: string;
    role_id: string;
    created_at: string;
    org: { id: string; name: string; org_types: string[] };
    role: { id: string; name: string; key: string };
  }>;
};

/**
 * Get user data from the database using Supabase
 * This function should be used in server-side contexts (API routes, middleware)
 * Automatically uses getClaims if no authUserId or email is provided
 */
export async function getUserData(request: NextRequest): Promise<UserWithMemberships | null> {
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

    const { data: memberships, error: memError } = await db
      .from("org_members")
      .select("org_id, user_id, role_id, created_at, orgs(id, name, org_types), roles(id, name, key)")
      .eq("user_id", authUserId);

    if (memError) return null;

    const org_memberships = (memberships ?? []).map((m: any) => ({
      org_id: m.org_id,
      user_id: m.user_id,
      role_id: m.role_id,
      created_at: m.created_at,
      org: m.orgs ?? { id: "", name: "", org_types: [] },
      role: m.roles ?? { id: "", name: "", key: "" },
    }));

    return {
      ...userRow,
      org_memberships,
    } as UserWithMemberships;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

/**
 * Get the current authenticated user's ID from Supabase auth
 * Returns the UUID from auth.users.id (stored in the 'sub' claim)
 * 
 * @returns Promise<string | null> - The user ID (UUID) or null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  
  return data?.claims?.sub ?? null;
}

/////////////////////////////////////////////////////////////////////////////////
//////////////////////// Create User with Org Membership ////////////////////////
export type CreateUserWithMembershipParams = {
  email: string;
  password: string;
  name?: string | null;
  phone?: string | null;
  role_id: string;
  org_id: string;
};

export type CreateUserWithMembershipResult =
  | { ok: true; user: UserWithMemberships }
  | { ok: false; error: string; status: number };

/**
 * Create a user in Supabase Auth, public.users, and org_members.
 * Use from API routes (e.g. POST /api/users, POST /api/orgs) to avoid duplicating logic.
 */
export async function createUserWithOrgMembership(
  params: CreateUserWithMembershipParams
): Promise<CreateUserWithMembershipResult> {
  const { email, password, name, phone, role_id, org_id } = params;

  const db = await createAdminClient();
  const { data: existingUser } = await db.from("users").select("id").eq("email", email).maybeSingle();
  if (existingUser) {
    return { ok: false, error: "User already exists", status: 409 };
  }

  const supabase = await createAdminClient();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true,
  });

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
    org_id,
    user_id: userId,
    role_id,
  });
  if (insertMemError) {
    return { ok: false, error: insertMemError.message, status: 400 };
  }

  const { data: userRow, error: userFetchError } = await db.from("users").select("id, email, name, created_at, updated_at, phone").eq("id", userId).single();
  if (userFetchError || !userRow) {
    return { ok: true, user: { id: userId, email, name: name ?? null, phone: phone ?? null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), org_memberships: [] } as UserWithMemberships };
  }
  const { data: memberships } = await db
    .from("org_members")
    .select("org_id, user_id, role_id, created_at, orgs(id, name, org_types), roles(id, name, key)")
    .eq("user_id", userId);
  const org_memberships = (memberships ?? []).map((m: any) => ({
    org_id: m.org_id,
    user_id: m.user_id,
    role_id: m.role_id,
    created_at: m.created_at,
    org: m.orgs ?? { id: "", name: "", org_types: [] },
    role: m.roles ?? { id: "", name: "", key: "" },
  }));
  const user: UserWithMemberships = { ...userRow, org_memberships } as UserWithMemberships;
  return { ok: true, user };
}

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
