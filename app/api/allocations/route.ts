import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { NextResponse, type NextRequest } from "next/server";
import { isInternalAdminOrUser, parseDDMMYYYY } from "@/lib/utils";
import { AllocationStatusEnum } from "@/lib/constants";

export function mapAllocationsVariables(allocationsList: any[]) {
  if (!allocationsList || !Array.isArray(allocationsList)) return [];
  return allocationsList.map((allocation) => {
    const allocationAmount = Number(allocation.allocation_amount) || 0;
    const interestRatePercentage = Number(allocation.interest_rate_percentage) || 0;
    const profitSplitPercentage = allocation.profit_split_percentage ? Number(allocation.profit_split_percentage) : null;
    const distributedToDate = Number(allocation.distributed_to_date) || 0;
    const project = allocation.project
      ? {
          ...allocation.project,
          purchase_price: allocation.project.purchase_price ? Number(allocation.project.purchase_price) : null,
          rehab_budget: allocation.project.rehab_budget ? Number(allocation.project.rehab_budget) : null,
          after_repair_value: allocation.project.after_repair_value ? Number(allocation.project.after_repair_value) : null,
          mortgage_amount: allocation.project.mortgage_amount ? Number(allocation.project.mortgage_amount) : null,
        }
      : allocation.project;
    let accrued_interest = 0;
    if (allocation.investment_date && allocationAmount && interestRatePercentage) {
      const investmentDate = new Date(allocation.investment_date);
      const today = new Date();
      const diffInMs =
        allocation.inactive_date && allocation.status === AllocationStatusEnum.INACTIVE
          ? new Date(allocation.inactive_date).getTime() - investmentDate.getTime()
          : today.getTime() - investmentDate.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      accrued_interest = (interestRatePercentage / 100) * allocationAmount * (diffInDays / 365) - distributedToDate;
    }
    let days_left = null;
    if (allocation.note_maturity_date) {
      const maturity = new Date(allocation.note_maturity_date);
      const today = new Date();
      days_left = Math.ceil((maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    return {
      ...allocation,
      allocation_amount: allocationAmount,
      interest_rate_percentage: interestRatePercentage,
      profit_split_percentage: profitSplitPercentage,
      distributed_to_date: distributedToDate,
      project,
      accrued_interest: Number(accrued_interest.toFixed(2)),
      current_investment: Number((allocationAmount + accrued_interest).toFixed(2)),
      days_left,
    };
  });
}

function buildAllocationCreateData(body: any, createdByUserId: string) {
  const {
    investor_org_id,
    project_id,
    allocation_amount,
    interest_rate_percentage,
    investment_method,
    investment_type,
    profit_split_percentage,
    payment_term,
    note_maturity_date,
    investment_date,
  } = body;
  return {
    investor_org_id,
    project_id,
    created_by_user_id: createdByUserId,
    allocation_amount: Number(allocation_amount),
    interest_rate_percentage: Number(interest_rate_percentage),
    investment_method: investment_method ?? "cash",
    investment_type: investment_type ?? "compounded interest",
    profit_split_percentage: profit_split_percentage ? Number(profit_split_percentage) : null,
    payment_term: payment_term ?? "monthly",
    note_maturity_date: note_maturity_date ? parseDDMMYYYY(note_maturity_date) : null,
    investment_date: investment_date ? parseDDMMYYYY(investment_date) : null,
    status: "active",
  };
}

/**
 * GET /api/allocations
 */
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const investorOrgIdsParam = searchParams.get("investorOrgIds");
    const projectIdsParam = searchParams.get("projectIds");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const db = await createAdminClient();
    let query = db
      .from("allocations")
      .select("*, investor_org:orgs(*), created_by:users(*), project:projects(*, company:companies(*))", { count: "exact" })
      .order("created_at", { ascending: false });

    const isInternal = isInternalAdminOrUser(userData);
    if (!isInternal) {
      const userOrgIds = userData.org_memberships.map((m: any) => m.org_id);
      query = query.in("investor_org_id", userOrgIds);
    } else if (investorOrgIdsParam) {
      const orgIds = investorOrgIdsParam.split(",").map((id) => id.trim()).filter(Boolean);
      if (orgIds.length > 0) query = query.in("investor_org_id", orgIds);
    }

    if (projectIdsParam) {
      const projectIds = projectIdsParam.split(",").map((id) => id.trim()).filter(Boolean);
      if (projectIds.length > 0) query = query.in("project_id", projectIds);
    }

    const { data: allocations, count, error } = await query.range(from, to);
    if (error) {
      return NextResponse.json({ error: "Failed to fetch allocations" }, { status: 500 });
    }

    const mappedAllocations = mapAllocationsVariables(allocations ?? []);
    const totalPages = Math.ceil((count ?? 0) / limit);

    return NextResponse.json({
      data: mappedAllocations,
      total: count ?? 0,
      page,
      limit,
      totalPages,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching allocations:", error);
    return NextResponse.json({ error: "Failed to fetch allocations" }, { status: 500 });
  }
}

/**
 * POST /api/allocations
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const isBulk = Array.isArray(body);
    const items = isBulk ? body : [body];

    if (items.length === 0) {
      return NextResponse.json({ error: "No allocations to create" }, { status: 400 });
    }

    const isInternal = isInternalAdminOrUser(userData);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const investor_org_id = item?.investor_org_id;
      if (
        !investor_org_id ||
        !item?.project_id ||
        item?.allocation_amount == null ||
        item?.interest_rate_percentage == null
      ) {
        return NextResponse.json(
          {
            error: `Item ${i + 1}: Missing required fields (investor_org_id, project_id, allocation_amount, interest_rate_percentage)`,
          },
          { status: 400 }
        );
      }
      const isMemberOfOrg = userData.org_memberships.some((m: any) => m.org_id === investor_org_id);
      if (!isInternal && !isMemberOfOrg) {
        return NextResponse.json(
          { error: "Forbidden: Not a member of the investing organization" },
          { status: 403 }
        );
      }
    }

    const db = await createAdminClient();
    const insertRows = items.map((item: any) => buildAllocationCreateData(item, userData.id));
    const { data: created, error } = await db.from("allocations").insert(insertRows).select("*, investor_org:orgs(*), project:projects(*)");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = mapAllocationsVariables(created ?? []);
    if (isBulk) {
      return NextResponse.json({ data: mapped }, { status: 201 });
    }
    return NextResponse.json(mapped[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating allocation(s):", error);
    return NextResponse.json({ error: "Failed to create allocation(s)" }, { status: 500 });
  }
}
