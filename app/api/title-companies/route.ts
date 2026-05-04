import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { isInternalAdminOrUser } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/title-companies
 */
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "100", 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const db = await createAdminClient();
    let query = db.from("title_companies").select("*", { count: "exact" }).order("name", { ascending: true });
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, count, error } = await query.range(from, to);
    if (error) {
      return NextResponse.json({ error: "Failed to fetch title companies" }, { status: 500 });
    }

    const totalPages = Math.ceil((count ?? 0) / limit);

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching title companies:", error);
    return NextResponse.json({ error: "Failed to fetch title companies" }, { status: 500 });
  }
}

/**
 * POST /api/title-companies
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const db = await createAdminClient();
    const { data: titleCompany, error } = await db.from("title_companies").insert({ name }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(titleCompany, { status: 201 });
  } catch (error: any) {
    console.error("Error creating title company:", error);
    return NextResponse.json({ error: "Failed to create title company" }, { status: 500 });
  }
}
