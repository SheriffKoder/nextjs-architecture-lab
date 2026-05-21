import { createAdminClient } from "../../supabase/server";
import { DEFAULT_INTERNAL_ORG_ID } from "../../users/constants";
import type { UserRole } from "../types";

function normalizeRoleRelation(
  roles:
    | { id: string; name: string; key: string }
    | { id: string; name: string; key: string }[]
    | null
): { id: string; name: string; key: string } | null {
  if (!roles) return null;
  return Array.isArray(roles) ? roles[0] ?? null : roles;
}

function mapMembershipToRole(m: {
  role_id: string;
  roles:
    | { id: string; name: string; key: string }
    | { id: string; name: string; key: string }[]
    | null;
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
  roles:
    | { id: string; name: string; key: string }
    | { id: string; name: string; key: string }[]
    | null;
}): UserRole | null {
  return mapMembershipToRole(m);
}

export async function fetchUserRole(
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
