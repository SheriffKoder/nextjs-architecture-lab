import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { isInternalAdminOrUser } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/title-companies/[id]
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
    const { data: titleCompany, error } = await db
      .from("title_companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !titleCompany) {
      return NextResponse.json({ error: "Title company not found" }, { status: 404 });
    }

    return NextResponse.json(titleCompany, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching title company:", error);
    return NextResponse.json({ error: "Failed to fetch title company" }, { status: 500 });
  }
}

/**
 * PUT /api/title-companies/[id]
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
    const { data: titleCompany, error } = await db
      .from("title_companies")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!titleCompany) {
      return NextResponse.json({ error: "Title company not found" }, { status: 404 });
    }

    return NextResponse.json(titleCompany, { status: 200 });
  } catch (error: any) {
    console.error("Error updating title company:", error);
    return NextResponse.json({ error: "Failed to update title company" }, { status: 500 });
  }
}

/**
 * DELETE /api/title-companies/[id]
 * Returns 409 with relatedProjects when any project uses this title company.
 */
export async function DELETE(
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

    const { data: relatedProjects, error: fetchError } = await db
      .from("projects")
      .select("id, address, status")
      .eq("title_company_id", id);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (relatedProjects && relatedProjects.length > 0) {
      return NextResponse.json(
        {
          error: "Title company cannot be deleted because it has projects linked to it.",
          code: "HAS_RELATED_PROJECTS",
          relatedProjects: relatedProjects.map((p: { id: string; address: string; status?: string }) => ({
            id: p.id,
            address: p.address,
            status: p.status ?? "",
          })),
        },
        { status: 409 }
      );
    }

    const { error } = await db.from("title_companies").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Title company deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting title company:", error);
    return NextResponse.json({ error: "Failed to delete title company" }, { status: 500 });
  }
}
