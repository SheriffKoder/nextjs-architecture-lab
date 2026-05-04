import { createAdminClient } from "@/lib/supabase/server";
import { isInternalAdmin, isInternalAdminOrUser } from "@/lib/utils";
import { getUserData } from "@/lib/utils-server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/companies/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const db = await createAdminClient();
    const { data: company, error } = await db.from("companies").select("*").eq("id", id).single();

    if (error || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}

/**
 * PUT /api/companies/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const db = await createAdminClient();
    const { data: company, error } = await db.from("companies").update({ name }).eq("id", id).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company, { status: 200 });
  } catch (error: any) {
    console.error("Error updating company:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}

/**
 * DELETE /api/companies/[id]
 * Returns 409 with relatedOrgs when the company has orgs linked to it.
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

    const { id } = await params;
    const db = await createAdminClient();

    const { data: relatedOrgs, error: fetchError } = await db
      .from("orgs")
      .select("id, name, org_types")
      .eq("company_id", id);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (relatedOrgs && relatedOrgs.length > 0) {
      return NextResponse.json(
        {
          error: "Company cannot be deleted because it has organizations linked to it.",
          code: "HAS_RELATED_ORGS",
          relatedOrgs: relatedOrgs.map((o: { id: string; name: string; org_types?: string[] }) => ({
            id: o.id,
            name: o.name,
            org_types: o.org_types ?? [],
          })),
        },
        { status: 409 }
      );
    }

    const { error } = await db.from("companies").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Company deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting company:", error);
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
