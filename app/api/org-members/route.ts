import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { isInternalAdminOrUser } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/org-members
 */
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id");
    const userId = searchParams.get("user_id");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const db = await createAdminClient();
    let query = db
      .from("org_members")
      .select("org_id, user_id, role_id, created_at, orgs(*), users(*), roles(*)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (orgId) query = query.eq("org_id", orgId);
    if (userId) query = query.eq("user_id", userId);

    const { data: rows, count, error } = await query.range(from, to);
    if (error) {
      return NextResponse.json({ error: "Failed to fetch memberships" }, { status: 500 });
    }

    const memberships = (rows ?? []).map((m: any) => ({
      ...m,
      org: m.orgs,
      user: m.users,
      role: m.roles,
    }));

    const totalPages = Math.ceil((count ?? 0) / limit);

    return NextResponse.json({
      data: memberships,
      total: count ?? 0,
      page,
      limit,
      totalPages,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json({ error: "Failed to fetch memberships" }, { status: 500 });
  }
}

/**
 * POST /api/org-members
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { org_id, user_id, role_id } = body;

    if (!org_id || !user_id || !role_id) {
      return NextResponse.json({ error: "org_id, user_id, and role_id are required" }, { status: 400 });
    }

    const db = await createAdminClient();
    const { data: membership, error } = await db
      .from("org_members")
      .insert({ org_id, user_id, role_id })
      .select("org_id, user_id, role_id, created_at, orgs(*), users(*), roles(*)")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Membership already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const out = {
      ...membership,
      org: membership?.orgs,
      user: membership?.users,
      role: membership?.roles,
    };
    return NextResponse.json(out, { status: 201 });
  } catch (error: any) {
    console.error("Error creating membership:", error);
    return NextResponse.json({ error: "Failed to create membership" }, { status: 500 });
  }
}
