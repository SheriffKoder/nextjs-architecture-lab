import { createAdminClient } from "@/features/auth/supabase/server";
import { getUserData } from "@/features/auth/server";
import { isInternalAdminOrUser } from "@/features/auth/roles/authorization";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/roles
 */
export async function GET(request: NextRequest) {
  try {
    await getUserData(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const db = await createAdminClient();
    const { data: roles, count, error } = await db
      .from("roles")
      .select("*", { count: "exact" })
      .order("name", { ascending: true })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }

    const totalPages = Math.ceil((count ?? 0) / limit);

    return NextResponse.json({
      data: roles ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

/**
 * POST /api/roles
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;
    let { key } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!key) {
      key = name.toLowerCase().trim().replace(/\s+/g, "_");
    }

    const db = await createAdminClient();
    const { data: role, error } = await db.from("roles").insert({ key, name }).select().single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Role with this key already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(role, { status: 201 });
  } catch (error: any) {
    console.error("Error creating role:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
