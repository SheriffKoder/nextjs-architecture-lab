import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { isInternalAdminOrUser } from "@/lib/utils";
import { ProjectStatusEnum } from "@/lib/constants";
import { NextResponse, type NextRequest } from "next/server";
import { mapAllocationsVariables } from "../allocations/route";
import { parseDDMMYYYY } from "@/lib/utils";

/**
 * GET /api/projects
 */
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const db = await createAdminClient();
    let query = db
      .from("projects")
      .select("*, company:companies(*), allocations(*), lender_org:orgs!lender_org_id(*), realtor_org:orgs!realtor_org_id(*), contractor_org:orgs!contractor_org_id(*), title_company:title_companies(*)", { count: "exact" })
      .order("created_at", { ascending: false });

    const isInternal = isInternalAdminOrUser(userData);
    if (!isInternal) {
      const userOrgIds = userData.org_memberships.map((m: any) => m.org_id);
      const { data: allocProjectIds } = await db.from("allocations").select("project_id").in("investor_org_id", userOrgIds);
      const projectIdsFromAlloc = [...new Set((allocProjectIds ?? []).map((a: any) => a.project_id))];
      const { data: visibleProjects } = await db
        .from("projects")
        .select("id")
        .or(`lender_org_id.in.(${userOrgIds.join(",")}),realtor_org_id.in.(${userOrgIds.join(",")}),contractor_org_id.in.(${userOrgIds.join(",")})`);
      const visibleIds = [...new Set([...(visibleProjects ?? []).map((p: any) => p.id), ...projectIdsFromAlloc])];
      if (visibleIds.length === 0) {
        return NextResponse.json({ data: [], total: 0, page, limit, totalPages: 0 }, { status: 200 });
      }
      query = query.in("id", visibleIds);
    }

    const addressSearch = searchParams.get("address_search");
    const companySearch = searchParams.get("company_search");
    const lenderSearch = searchParams.get("lender_search");
    const realtorSearch = searchParams.get("realtor_search");
    const contractorSearch = searchParams.get("contractor_search");
    const status = searchParams.get("status");
    const lenderIds = searchParams.get("lender_ids");
    const companyIds = searchParams.get("company_ids");
    const investorOrgId = searchParams.get("investor_org_id");

    if (addressSearch) query = query.ilike("address", `%${addressSearch.toLowerCase()}%`);
    if (status) query = query.ilike("status", `%${status.toLowerCase()}%`);
    if (lenderIds) {
      const ids = lenderIds.split(",").map((id) => id.trim()).filter(Boolean);
      if (ids.length) query = query.in("lender_org_id", ids);
    }
    if (companyIds) {
      const ids = companyIds.split(",").map((id) => id.trim()).filter(Boolean);
      if (ids.length) query = query.in("company_id", ids);
    }
    if (investorOrgId) {
      const { data: projIds } = await db.from("allocations").select("project_id").eq("investor_org_id", investorOrgId);
      const ids = (projIds ?? []).map((p: any) => p.project_id);
      if (ids.length) query = query.in("id", ids);
      else query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    }
    if (companySearch) {
      const { data: companies } = await db.from("companies").select("id").ilike("name", `%${companySearch.toLowerCase()}%`);
      const cids = (companies ?? []).map((c: any) => c.id);
      if (cids.length) query = query.in("company_id", cids);
      else query = query.eq("company_id", "00000000-0000-0000-0000-000000000000");
    }
    if (lenderSearch) {
      const { data: orgs } = await db.from("orgs").select("id").ilike("name", `%${lenderSearch.toLowerCase()}%`);
      const oids = (orgs ?? []).map((o: any) => o.id);
      if (oids.length) query = query.in("lender_org_id", oids);
    }
    if (realtorSearch) {
      const { data: orgs } = await db.from("orgs").select("id").ilike("name", `%${realtorSearch.toLowerCase()}%`);
      const oids = (orgs ?? []).map((o: any) => o.id);
      if (oids.length) query = query.in("realtor_org_id", oids);
    }
    if (contractorSearch) {
      const { data: orgs } = await db.from("orgs").select("id").ilike("name", `%${contractorSearch.toLowerCase()}%`);
      const oids = (orgs ?? []).map((o: any) => o.id);
      if (oids.length) query = query.in("contractor_org_id", oids);
    }

    const arvFrom = searchParams.get("after_repair_value_filter_from");
    const arvTo = searchParams.get("after_repair_value_filter_to");
    if (arvFrom) query = query.gte("after_repair_value", Number(arvFrom));
    if (arvTo) query = query.lte("after_repair_value", Number(arvTo));
    const mortgageFrom = searchParams.get("mortgage_amount_filter_from");
    const mortgageTo = searchParams.get("mortgage_amount_filter_to");
    if (mortgageFrom) query = query.gte("mortgage_amount", Number(mortgageFrom));
    if (mortgageTo) query = query.lte("mortgage_amount", Number(mortgageTo));
    const purchasePriceFrom = searchParams.get("purchase_price_filter_from");
    const purchasePriceTo = searchParams.get("purchase_price_filter_to");
    if (purchasePriceFrom) query = query.gte("purchase_price", Number(purchasePriceFrom));
    if (purchasePriceTo) query = query.lte("purchase_price", Number(purchasePriceTo));
    const rehabBudgetFrom = searchParams.get("rehab_budget_filter_from");
    const rehabBudgetTo = searchParams.get("rehab_budget_filter_to");
    if (rehabBudgetFrom) query = query.gte("rehab_budget", Number(rehabBudgetFrom));
    if (rehabBudgetTo) query = query.lte("rehab_budget", Number(rehabBudgetTo));
    const purchaseDateStart = searchParams.get("purchase_date_filter_start");
    const purchaseDateEnd = searchParams.get("purchase_date_filter_end");
    if (purchaseDateStart) query = query.gte("purchase_closing_date", purchaseDateStart);
    if (purchaseDateEnd) query = query.lte("purchase_closing_date", purchaseDateEnd);
    const saleDateStart = searchParams.get("sale_date_filter_start");
    const saleDateEnd = searchParams.get("sale_date_filter_end");
    if (saleDateStart) query = query.gte("sale_date", saleDateStart);
    if (saleDateEnd) query = query.lte("sale_date", saleDateEnd);
    const createdAtStart = searchParams.get("created_at_filter_start");
    const createdAtEnd = searchParams.get("created_at_filter_end");
    if (createdAtStart) query = query.gte("created_at", createdAtStart);
    if (createdAtEnd) query = query.lte("created_at", createdAtEnd);

    const search = searchParams.get("search");
    if (search) {
      const searchLower = search.toLowerCase();
      const { data: comps } = await db.from("companies").select("id").ilike("name", `%${searchLower}%`);
      const { data: orgList } = await db.from("orgs").select("id").ilike("name", `%${searchLower}%`);
      const companyIdsSearch = (comps ?? []).map((c: any) => c.id);
      const orgIdsSearch = (orgList ?? []).map((o: any) => o.id);
      query = query.or(
        `address.ilike.%${searchLower}%,company_id.in.(${companyIdsSearch.length ? companyIdsSearch.join(",") : "00000000-0000-0000-0000-000000000000"}),lender_org_id.in.(${orgIdsSearch.length ? orgIdsSearch.join(",") : "00000000-0000-0000-0000-000000000000"}),contractor_org_id.in.(${orgIdsSearch.length ? orgIdsSearch.join(",") : "00000000-0000-0000-0000-000000000000"})`
      );
    }

    const { data: projects, count, error } = await query.range(from, to);
    if (error) {
      return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }

    const mappedProjects = mapProjectsVariables(projects ?? []);
    const totalPages = Math.ceil((count ?? 0) / limit);

    return NextResponse.json({
      data: mappedProjects,
      total: count ?? 0,
      page,
      limit,
      totalPages,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

/**
 * POST /api/projects
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      company_id,
      address,
      purchase_price,
      rehab_budget,
      after_repair_value,
      mortgage_amount,
      lender_org_id,
      realtor_org_id,
      contractor_org_id,
      title_company_id,
      purchase_closing_date,
      sale_date,
    } = body;

    if (!company_id || !address) {
      return NextResponse.json({ error: "company_id and address are required" }, { status: 400 });
    }

    const db = await createAdminClient();
    const { data: project, error } = await db
      .from("projects")
      .insert({
        company_id,
        address,
        purchase_price: purchase_price ? Number(purchase_price) : null,
        rehab_budget: rehab_budget ? Number(rehab_budget) : null,
        after_repair_value: after_repair_value ? Number(after_repair_value) : null,
        mortgage_amount: mortgage_amount ? Number(mortgage_amount) : null,
        lender_org_id: lender_org_id ?? null,
        realtor_org_id: realtor_org_id ?? null,
        contractor_org_id: contractor_org_id ?? null,
        title_company_id: title_company_id ?? null,
        purchase_closing_date: purchase_closing_date ? parseDDMMYYYY(purchase_closing_date) : null,
        sale_date: sale_date ? parseDDMMYYYY(sale_date) : null,
        status: ProjectStatusEnum.ACTIVE_CONSTRUCTION,
      })
      .select("*, company:companies(*), lender_org:orgs!lender_org_id(*), realtor_org:orgs!realtor_org_id(*), contractor_org:orgs!contractor_org_id(*), title_company:title_companies(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export function mapProjectsVariables(projectsList: any[]) {
  if (!projectsList || !Array.isArray(projectsList)) return [];
  return projectsList.map((project) => {
    const allocations = project.allocations || [];
    const modifiedProjectAllocations = allocations.length > 0 ? mapAllocationsVariables(allocations) : [];
    const investor_current_value = modifiedProjectAllocations.reduce((acc: number, a: any) => acc + (a.current_investment || 0), 0);
    const investor_capital = modifiedProjectAllocations.reduce((acc: number, a: any) => acc + (a.allocation_amount || 0), 0);
    const purchasePrice = project.purchase_price ? Number(project.purchase_price) : 0;
    const rehabBudget = project.rehab_budget ? Number(project.rehab_budget) : 0;
    const afterRepairValue = project.after_repair_value ? Number(project.after_repair_value) : 0;
    const mortgageAmount = project.mortgage_amount ? Number(project.mortgage_amount) : 0;
    const total_cost = purchasePrice + rehabBudget;
    const equity = afterRepairValue - (mortgageAmount + investor_current_value);
    const leverage_percentage = afterRepairValue > 0 ? (mortgageAmount + investor_current_value) / afterRepairValue : 0;
    return {
      ...project,
      total_cost,
      equity,
      investor_current_value,
      investor_capital,
      leverage_percentage,
    };
  });
}
