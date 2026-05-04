import { INTERNAL_ORG_ID } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/server";
import { getUserData, createUserWithOrgMembership } from "@/lib/utils-server";
import { isInternalAdminOrUser } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/users
 * Get all users with optional filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const emailSearch = searchParams.get("email_search");
    const nameSearch = searchParams.get("name_search");
    const phoneSearch = searchParams.get("phone_search");
    const roleIdsRaw = searchParams.get("role_ids");
    const roleIds = roleIdsRaw?.split(",").map((s) => s.trim()).filter(Boolean) ?? null;
    const orgId = searchParams.get("org_id")?.trim() || null;
    const sortParam = searchParams.get("sort");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const db = await createAdminClient();

    // Roles with counts (from org_members)
    let rolesQuery = db.from("roles").select("id, name, key");
    const { data: allRoles } = await rolesQuery;
    const roleCounts: Record<string, number> = {};
    const countQuery = orgId
      ? db.from("org_members").select("role_id", { count: "exact", head: false }).eq("org_id", orgId)
      : db.from("org_members").select("role_id", { count: "exact", head: false });
    const { data: roleRows } = await countQuery;
    for (const r of roleRows ?? []) {
      roleCounts[r.role_id] = (roleCounts[r.role_id] ?? 0) + 1;
    }
    const role_unique_values = (allRoles ?? []).map((r: { id: string; name: string; key: string }) => ({
      id: r.id,
      title: r.name || r.key,
      available: roleCounts[r.id] ?? 0,
      total: roleCounts[r.id] ?? 0,
    }));

    // Build query for users
    let query = db.from("users").select("id, email, name, phone, created_at, updated_at", { count: "exact" });

    if (emailSearch) query = query.ilike("email", `%${emailSearch}%`);
    if (nameSearch) query = query.ilike("name", `%${nameSearch}%`);
    if (phoneSearch) query = query.ilike("phone", `%${phoneSearch}%`);

    const sortDir = sortParam?.toLowerCase().includes("desc") ? "desc" : "asc";
    const sortCol = sortParam?.toLowerCase().split(":")[0]?.trim() ?? "name";
    const sortByRole = sortCol === "role" || sortCol === "role_name";

    if (sortByRole) {
      query = query.order("id", { ascending: sortDir === "asc" });
    } else {
      query = query.order(sortCol === "name" ? "name" : "created_at", { ascending: sortDir === "asc" });
    }

    const { data: userRows, error: listError, count } = await query.range(from, to);

    if (listError) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    let users = userRows ?? [];
    let total = count ?? 0;

    if (orgId || (roleIds && roleIds.length > 0)) {
      const userIds = users.map((u: any) => u.id);
      let memQuery = db.from("org_members").select("user_id, org_id, role_id, orgs(*), roles(*)");
      memQuery = memQuery.in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
      if (orgId) memQuery = memQuery.eq("org_id", orgId);
      if (roleIds && roleIds.length > 0) memQuery = memQuery.in("role_id", roleIds);
      const { data: mems } = await memQuery;
      const allowedUserIds = new Set((mems ?? []).map((m: any) => m.user_id));
      users = users.filter((u: any) => allowedUserIds.has(u.id));
      if (!sortByRole) {
        const countQuery2 = db.from("users").select("id", { count: "exact", head: true });
        if (emailSearch) countQuery2.ilike("email", `%${emailSearch}%`);
        if (nameSearch) countQuery2.ilike("name", `%${nameSearch}%`);
        if (phoneSearch) countQuery2.ilike("phone", `%${phoneSearch}%`);
        const { count: totalCount } = await countQuery2;
        total = totalCount ?? 0;
      }
    }

    const userIds = users.map((u: any) => u.id);
    const { data: memberships } = await db
      .from("org_members")
      .select("user_id, org_id, role_id, created_at, orgs(*), roles(*)")
      .in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

    const memByUser: Record<string, any[]> = {};
    for (const m of memberships ?? []) {
      const uid = m.user_id;
      if (!memByUser[uid]) memByUser[uid] = [];
      memByUser[uid].push({
        org_id: m.org_id,
        user_id: m.user_id,
        role_id: m.role_id,
        created_at: m.created_at,
        org: m.orgs,
        role: m.roles,
      });
    }

    const data = users.map((u: any) => ({
      ...u,
      org_memberships: memByUser[u.id] ?? [],
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      total,
      uniqueValues: { role_unique_values },
      page,
      limit,
      totalPages,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Create a new user (Supabase Auth + public.users) and org_members relation
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, phone, role_id, org_id } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (!role_id) {
      return NextResponse.json({ error: "role_id is required" }, { status: 400 });
    }

    const orgId = org_id ?? INTERNAL_ORG_ID;

    const result = await createUserWithOrgMembership({
      email,
      password,
      name: name ?? null,
      phone: phone ?? null,
      role_id,
      org_id: orgId,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.user, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
