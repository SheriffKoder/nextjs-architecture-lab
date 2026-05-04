import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { NextResponse, type NextRequest } from "next/server";
import { mapProjectsVariables } from "../route";
import { isInternalAdminOrUser, parseDDMMYYYY } from "@/lib/utils";
import { AllocationStatusEnum } from "@/lib/constants";

/**
 * GET /api/projects/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userData = await getUserData(request);
    if (!userData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await createAdminClient();
    const { data: project, error } = await db
      .from("projects")
      .select("*, company:companies(*), lender_org:orgs!lender_org_id(*), realtor_org:orgs!realtor_org_id(*), contractor_org:orgs!contractor_org_id(*), allocations(*, investor_org:orgs(*), created_by:users(*))")
      .eq("id", id)
      .single();

    if (error || !project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const isInternal = isInternalAdminOrUser(userData);
    const userOrgIds = userData.org_memberships.map((m: any) => m.org_id);
    const isLender = project.lender_org_id && userOrgIds.includes(project.lender_org_id);
    const isRealtor = project.realtor_org_id && userOrgIds.includes(project.realtor_org_id);
    const isContractor = project.contractor_org_id && userOrgIds.includes(project.contractor_org_id);
    const allocs = project.allocations ?? [];
    const isInvestor = allocs.some((a: any) => userOrgIds.includes(a.investor_org_id));

    if (!isInternal && !isLender && !isRealtor && !isContractor && !isInvestor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isInternal && !isLender && !isRealtor && !isContractor && isInvestor) {
      project.allocations = allocs.filter((a: any) => userOrgIds.includes(a.investor_org_id));
    }

    const mapped = mapProjectsVariables([project])[0];
    return NextResponse.json(mapped, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

/**
 * PUT /api/projects/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const update: any = { ...body };
    if (body.purchase_closing_date) update.purchase_closing_date = parseDDMMYYYY(body.purchase_closing_date);
    if (body.sale_date) update.sale_date = parseDDMMYYYY(body.sale_date);

    const db = await createAdminClient();
    const { data: project, error } = await db
      .from("projects")
      .update(update)
      .eq("id", id)
      .select("*, company:companies(*), lender_org:orgs!lender_org_id(*), realtor_org:orgs!realtor_org_id(*), contractor_org:orgs!contractor_org_id(*)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const db = await createAdminClient();
    const { data: allocations } = await db.from("allocations").select("id").eq("project_id", id).eq("status", AllocationStatusEnum.ACTIVE);
    if ((allocations ?? []).length > 0) {
      return NextResponse.json({ error: "Project has active allocations" }, { status: 400 });
    }

    const { error } = await db.from("projects").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
