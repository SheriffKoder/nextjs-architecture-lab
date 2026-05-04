import { ProjectStatusEnum, RoleEnum } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/server";
import { isInternalAdmin } from "@/lib/utils";
import { getUserData } from "@/lib/utils-server";
import { NextResponse, type NextRequest } from "next/server";

const ACTIVE_PROJECT_STATUSES = [
  ProjectStatusEnum.ACTIVE_CONSTRUCTION,
  ProjectStatusEnum.FOR_SALE,
  ProjectStatusEnum.PENDING_PURCHASE,
  ProjectStatusEnum.RENTAL_PROPERTIES,
];

type RelatedProject = { id: string; address: string; status: string };

/**
 * PUT /api/orgs/[id]/realtor
 * Updates the admin user of this realtor org (name, email, phone).
 * If email is changed, checks uniqueness and updates auth.users.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdmin(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: orgId } = await params;
    const body = await request.json();
    const { name, email, phone } = body;

    const db = await createAdminClient();

    const { data: adminRole } = await db.from("roles").select("id").eq("key", RoleEnum.ADMIN).single();
    if (!adminRole) {
      return NextResponse.json({ error: "Admin role not found" }, { status: 500 });
    }

    const { data: membership, error: memError } = await db
      .from("org_members")
      .select("user_id")
      .eq("org_id", orgId)
      .eq("role_id", adminRole.id)
      .limit(1)
      .single();

    if (memError || !membership) {
      return NextResponse.json({ error: "Realtor admin user not found" }, { status: 404 });
    }

    const userId = membership.user_id as string;

    const { data: existingUser, error: userError } = await db
      .from("users")
      .select("id, email, name, phone")
      .eq("id", userId)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone ?? null;

    if (email !== undefined && email !== existingUser.email) {
      const { data: otherUser } = await db
        .from("users")
        .select("id")
        .eq("email", email)
        .neq("id", userId)
        .maybeSingle();
      if (otherUser) {
        return NextResponse.json({ error: "This email is already in use" }, { status: 409 });
      }
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await db.from("users").update(updateData).eq("id", userId);
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      if (email !== undefined && email !== existingUser.email) {
        const { error: authError } = await db.auth.admin.updateUserById(userId, { email });
        if (authError) {
          return NextResponse.json({ error: authError.message }, { status: 500 });
        }
      }
    }

    const { data: updatedUser } = await db.from("users").select("*").eq("id", userId).single();
    const { data: org } = await db.from("orgs").select("*").eq("id", orgId).single();
    const { data: members } = await db
      .from("org_members")
      .select("org_id, user_id, role_id, users(id, name, email, phone), roles(id, name, key)")
      .eq("org_id", orgId)
      .eq("role_id", adminRole.id);

    const membersWithUser = (members ?? []).map((m: any) => ({
      org_id: m.org_id,
      user_id: m.user_id,
      role_id: m.role_id,
      user: m.users,
      role: m.roles,
    }));

    return NextResponse.json(
      { ...org, members: membersWithUser, updatedUser },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error updating realtor:", error);
    return NextResponse.json({ error: "Failed to update realtor" }, { status: 500 });
  }
}

const toRelatedProject = (p: { id: string; address: string; status?: string }): RelatedProject => ({
  id: p.id,
  address: p.address,
  status: p.status ?? "",
});

/**
 * DELETE /api/orgs/[id]/realtor
 * Returns 409 with relatedProjects when the realtor is assigned to any active project.
 * Otherwise deletes all auth users for members of this org, then deletes the org.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdmin(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: orgId } = await params;
    const db = await createAdminClient();

    const { data: activeProjects } = await db
      .from("projects")
      .select("id, address, status")
      .eq("realtor_org_id", orgId)
      .in("status", ACTIVE_PROJECT_STATUSES);

    const relatedProjects = (activeProjects ?? []).map(toRelatedProject);

    if (relatedProjects.length > 0) {
      return NextResponse.json(
        {
          error: "This realtor cannot be deleted because they are assigned to active projects.",
          code: "HAS_ACTIVE_PROJECTS",
          relatedProjects,
        },
        { status: 409 }
      );
    }

    const { data: members } = await db
      .from("org_members")
      .select("user_id")
      .eq("org_id", orgId);

    const userIds = (members ?? []).map((m: { user_id: string }) => m.user_id).filter(Boolean);

    for (const uid of userIds) {
      const { error: authError } = await db.auth.admin.deleteUser(uid);
      if (authError) {
        console.error("Error deleting auth user:", uid, authError);
      }
    }

    const { error: deleteMembersError } = await db.from("org_members").delete().eq("org_id", orgId);
    if (deleteMembersError) {
      return NextResponse.json({ error: deleteMembersError.message }, { status: 500 });
    }

    const { error: deleteOrgError } = await db.from("orgs").delete().eq("id", orgId);
    if (deleteOrgError) {
      return NextResponse.json({ error: deleteOrgError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Realtor deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting realtor:", error);
    return NextResponse.json({ error: "Failed to delete realtor" }, { status: 500 });
  }
}
