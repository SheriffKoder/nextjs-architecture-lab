import { DEFAULT_INTERNAL_ORG_ID } from "@/features/auth";
import { createAdminClient } from "@/features/auth/supabase/server";
import { getUserData, createUserWithRole, roleFromMembershipRow } from "@/features/auth/server";
import { isInternalAdminOrUser } from "@/features/auth/roles/authorization";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/users — list users with optional filters (role filter only; no org scope).
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
    const roleIds =
      roleIdsRaw?.split(",").map((s) => s.trim()).filter(Boolean) ?? null;
    const sortParam = searchParams.get("sort");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const db = await createAdminClient();

    const { data: allRoles } = await db.from("roles").select("id, name, key");
    const roleCounts: Record<string, number> = {};
    const { data: roleRows } = await db
      .from("org_members")
      .select("role_id")
      .eq("org_id", DEFAULT_INTERNAL_ORG_ID);
    for (const r of roleRows ?? []) {
      roleCounts[r.role_id] = (roleCounts[r.role_id] ?? 0) + 1;
    }
    const role_unique_values = (allRoles ?? []).map(
      (r: { id: string; name: string; key: string }) => ({
        id: r.id,
        title: r.name || r.key,
        available: roleCounts[r.id] ?? 0,
        total: roleCounts[r.id] ?? 0,
      })
    );

    let query = db
      .from("users")
      .select("id, email, name, phone, created_at, updated_at", { count: "exact" });

    if (emailSearch) query = query.ilike("email", `%${emailSearch}%`);
    if (nameSearch) query = query.ilike("name", `%${nameSearch}%`);
    if (phoneSearch) query = query.ilike("phone", `%${phoneSearch}%`);

    const sortDir = sortParam?.toLowerCase().includes("desc") ? "desc" : "asc";
    const sortCol = sortParam?.toLowerCase().split(":")[0]?.trim() ?? "name";
    query = query.order(sortCol === "name" ? "name" : "created_at", {
      ascending: sortDir === "asc",
    });

    const { data: userRows, error: listError, count } = await query.range(
      from,
      to
    );

    if (listError) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    let users = userRows ?? [];
    let total = count ?? 0;

    if (roleIds && roleIds.length > 0) {
      const userIds = users.map((u: { id: string }) => u.id);
      const { data: mems } = await db
        .from("org_members")
        .select("user_id, role_id, roles(id, name, key)")
        .in(
          "user_id",
          userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]
        )
        .eq("org_id", DEFAULT_INTERNAL_ORG_ID)
        .in("role_id", roleIds);
      const allowedUserIds = new Set((mems ?? []).map((m) => m.user_id));
      users = users.filter((u: { id: string }) => allowedUserIds.has(u.id));
    }

    const userIds = users.map((u: { id: string }) => u.id);
    const { data: memberships } = await db
      .from("org_members")
      .select("user_id, role_id, roles(id, name, key)")
      .eq("org_id", DEFAULT_INTERNAL_ORG_ID)
      .in(
        "user_id",
        userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]
      );

    const roleByUser: Record<string, ReturnType<typeof roleFromMembershipRow>> = {};
    for (const m of memberships ?? []) {
      const mapped = roleFromMembershipRow(
        m as Parameters<typeof roleFromMembershipRow>[0]
      );
      if (mapped) roleByUser[m.user_id] = mapped;
    }

    const data = users.map((u: { id: string }) => ({
      ...u,
      role: roleByUser[u.id] ?? null,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        data,
        total,
        uniqueValues: { role_unique_values },
        page,
        limit,
        totalPages,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/**
 * POST /api/users — create user with role (default internal org in DB only).
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, phone, role_id } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    if (!role_id) {
      return NextResponse.json({ error: "role_id is required" }, { status: 400 });
    }

    const result = await createUserWithRole({
      email,
      password,
      name: name ?? null,
      phone: phone ?? null,
      role_id,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.user, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
