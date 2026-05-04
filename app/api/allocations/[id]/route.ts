import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { NextResponse, type NextRequest } from "next/server";
import { mapAllocationsVariables } from "../route";
import { isInternalAdminOrUser, parseDDMMYYYY } from "@/lib/utils";
import { AllocationStatusEnum } from "@/lib/constants";

/**
 * GET /api/allocations/[id]
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
    const { data: allocation, error } = await db
      .from("allocations")
      .select("*, investor_org:orgs(*), project:projects(*, company:companies(*)), created_by:users(*)")
      .eq("id", id)
      .single();

    if (error || !allocation) return NextResponse.json({ error: "Allocation not found" }, { status: 404 });

    const isInternal = isInternalAdminOrUser(userData);
    const userOrgIds = userData.org_memberships.map((m: any) => m.org_id);
    const isInvestor = userOrgIds.includes(allocation.investor_org_id);

    if (!isInternal && !isInvestor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [mapped] = mapAllocationsVariables([allocation]);
    return NextResponse.json(mapped, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching allocation:", error);
    return NextResponse.json({ error: "Failed to fetch allocation" }, { status: 500 });
  }
}

/**
 * PUT /api/allocations/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userData = await getUserData(request);
    if (!userData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await createAdminClient();
    const { data: existingAllocation, error: fetchError } = await db.from("allocations").select("*").eq("id", id).single();
    if (fetchError || !existingAllocation) return NextResponse.json({ error: "Allocation not found" }, { status: 404 });

    const isInternal = isInternalAdminOrUser(userData);
    const userOrgIds = userData.org_memberships.map((m: any) => m.org_id);
    const isInvestor = userOrgIds.includes(existingAllocation.investor_org_id);
    if (!isInternal && !isInvestor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const updateData: any = {
      ...body,
      note_maturity_date: body.note_maturity_date ? parseDDMMYYYY(body.note_maturity_date) : undefined,
      investment_date: body.investment_date ? parseDDMMYYYY(body.investment_date) : undefined,
    };
    if (existingAllocation.status === AllocationStatusEnum.ACTIVE && body.status && body.status !== AllocationStatusEnum.ACTIVE) {
      updateData.inactive_date = new Date().toISOString().split("T")[0];
    }

    const { data: allocation, error } = await db
      .from("allocations")
      .update(updateData)
      .eq("id", id)
      .select("*, investor_org:orgs(*), project:projects(*, company:companies(*)), created_by:users(*)")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const [mapped] = mapAllocationsVariables([allocation!]);
    return NextResponse.json(mapped, { status: 200 });
  } catch (error: any) {
    console.error("Error updating allocation:", error);
    return NextResponse.json({ error: "Failed to update allocation" }, { status: 500 });
  }
}

/**
 * DELETE /api/allocations/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userData = await getUserData(request);
    if (!userData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await createAdminClient();
    const { data: existingAllocation, error: fetchError } = await db.from("allocations").select("id, investor_org_id").eq("id", id).single();
    if (fetchError || !existingAllocation) return NextResponse.json({ error: "Allocation not found" }, { status: 404 });

    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await db.from("allocations").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: "Allocation deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting allocation:", error);
    return NextResponse.json({ error: "Failed to delete allocation" }, { status: 500 });
  }
}
