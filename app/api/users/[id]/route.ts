import { DEFAULT_INTERNAL_ORG_ID } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/server";
import { getUserData, roleFromMembershipRow } from "@/lib/utils-server";
import { isInternalAdmin, isInternalAdminOrUser } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

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
    const { data: user, error: userError } = await db
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: memberships } = await db
      .from("org_members")
      .select("role_id, roles(id, name, key)")
      .eq("user_id", id)
      .eq("org_id", DEFAULT_INTERNAL_ORG_ID)
      .limit(1);

    const role = memberships?.[0]
      ? roleFromMembershipRow(memberships[0] as Parameters<typeof roleFromMembershipRow>[0])
      : null;

    return NextResponse.json({ ...user, role }, { status: 200 });
  } catch (error: unknown) {
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
    const { name, email, phone, role_id: bodyRoleId } = body;

    const db = await createAdminClient();

    const { data: existingUser, error: existingUserError } = await db
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (existingUserError) {
      return NextResponse.json(
        { error: existingUserError.message },
        { status: 500 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone ?? null;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await db
        .from("users")
        .update(updateData)
        .eq("id", id);
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      if (email !== existingUser?.email) {
        const { error: updateAuthError } = await db.auth.admin.updateUserById(id, {
          email: email,
        });
        if (updateAuthError) {
          return NextResponse.json(
            { error: updateAuthError.message },
            { status: 500 }
          );
        }
      }
    }

    if (bodyRoleId != null) {
      const { data: existingMem } = await db
        .from("org_members")
        .select("org_id")
        .eq("user_id", id)
        .eq("org_id", DEFAULT_INTERNAL_ORG_ID)
        .maybeSingle();

      if (existingMem) {
        await db
          .from("org_members")
          .update({ role_id: bodyRoleId })
          .eq("user_id", id)
          .eq("org_id", DEFAULT_INTERNAL_ORG_ID);
      } else {
        await db.from("org_members").insert({
          org_id: DEFAULT_INTERNAL_ORG_ID,
          user_id: id,
          role_id: bodyRoleId,
        });
      }
    }

    const { data: user } = await db.from("users").select("*").eq("id", id).single();
    const { data: memberships } = await db
      .from("org_members")
      .select("role_id, roles(id, name, key)")
      .eq("user_id", id)
      .eq("org_id", DEFAULT_INTERNAL_ORG_ID)
      .limit(1);

    const role = memberships?.[0]
      ? roleFromMembershipRow(memberships[0] as Parameters<typeof roleFromMembershipRow>[0])
      : null;

    return NextResponse.json({ ...user, role }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
