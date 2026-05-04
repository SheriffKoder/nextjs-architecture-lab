import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { isInternalAdminOrUser } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

function mapCompaniesVariables(companiesList: any[], options: { includeProjects: boolean; includeProjectsCount: boolean }) {
  if (!companiesList || !Array.isArray(companiesList)) return [];
  return companiesList.map((company) => ({
    ...company,
    projects: options.includeProjects ? company.projects : undefined,
    projects_count: options.includeProjectsCount ? (company.projects?.length || 0) : undefined,
  }));
}

/**
 * GET /api/companies
 */
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const includeProjectsCount = searchParams.get("includeProjectsCount") === "true";
    const includeProjects = searchParams.get("includeProjects") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const db = await createAdminClient();
    const selectFields = includeProjectsCount || includeProjects ? "*, projects(*)" : "*";
    let query = db.from("companies").select(selectFields, { count: "exact" }).order("name", { ascending: true });
    if (search) query = query.ilike("name", `%${search}%`);

    const { data: companies, count, error } = await query.range(from, to);
    if (error) {
      return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
    }

    const mappedCompanies = mapCompaniesVariables(companies ?? [], {
      includeProjects,
      includeProjectsCount,
    });
    const totalPages = Math.ceil((count ?? 0) / limit);

    return NextResponse.json({
      data: mappedCompanies,
      total: count ?? 0,
      page,
      limit,
      totalPages,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

/**
 * POST /api/companies
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
    const { data: company, error } = await db.from("companies").insert({ name }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    console.error("Error creating company:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}
