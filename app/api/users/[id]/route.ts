import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { isInternalAdmin, isInternalAdminOrUser } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_ORG_ID = "019be079-d528-77ad-bb2b-2c7590149e3b";

/**
 * GET /api/users/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData) && userData?.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await createAdminClient();
    const { data: user, error: userError } = await db.from("users").select("*").eq("id", id).single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: memberships } = await db
      .from("org_members")
      .select("org_id, user_id, role_id, created_at, orgs(*), roles(*)")
      .eq("user_id", id);
    const org_memberships = (memberships ?? []).map((m: any) => ({
      org_id: m.org_id,
      user_id: m.user_id,
      role_id: m.role_id,
      created_at: m.created_at,
      org: m.orgs,
      role: m.roles,
    }));

    return NextResponse.json({ ...user, org_memberships }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

/**
 * PUT /api/users/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData) && userData?.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, role_id: bodyRoleId, org_id: bodyOrgId } = body;

    const db = await createAdminClient();

    // check if the email changed
    /////// Fetch auth user
    const {data: existingUser, error: existingUserError} =await db.from("users").select("*").eq("id", id).single();
    if (existingUserError) {
      return NextResponse.json({ error: existingUserError.message }, { status: 500 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone ?? null;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await db.from("users").update(updateData).eq("id", id);
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      /////// Update auth user if email is changed
      if (email !== existingUser?.email) {
        const { error: updateAuthError } = await db.auth.admin.updateUserById(id, { email: email });
        if (updateAuthError) {
          return NextResponse.json({ error: updateAuthError.message }, { status: 500 });
        }
      }
    }

    if (bodyRoleId != null) {
      const orgId = bodyOrgId ?? DEFAULT_ORG_ID;
      await db.from("org_members").update({ role_id: bodyRoleId }).eq("user_id", id).eq("org_id", orgId);
    }

    const { data: user } = await db.from("users").select("*").eq("id", id).single();
    const { data: memberships } = await db
      .from("org_members")
      .select("org_id, user_id, role_id, created_at, orgs(*), roles(*)")
      .eq("user_id", id);
    const org_memberships = (memberships ?? []).map((m: any) => ({
      org_id: m.org_id,
      user_id: m.user_id,
      role_id: m.role_id,
      created_at: m.created_at,
      org: m.orgs,
      role: m.roles,
    }));

    return NextResponse.json({ ...user, org_memberships }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id]
 * Deletes the user from auth.users only. The public.users row is removed automatically
 * (e.g. via database trigger or Supabase behavior).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authorization - Internal admin only
    const userData = await getUserData(request);
    if (!isInternalAdmin(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = await createAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
