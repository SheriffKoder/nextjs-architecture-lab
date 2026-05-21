import { NextRequest } from "next/server";
import { createAdminClient, createClient } from "../../supabase/server";
import { getAuthUserFromHeader } from "../../session/server/auth";
import { fetchUserRole } from "../../roles/server/membership";
import type { UserWithRole } from "../types";

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
