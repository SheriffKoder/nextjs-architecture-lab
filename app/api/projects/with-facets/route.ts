import { isInternalAdminOrUser } from "@/lib/utils";
import { connection } from "next/server";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserData, EXPORT_CSV_LIMIT, toCsv } from "@/lib/utils-server";

/**
 * GET /api/projects/with-facets
 * Get all projects with optional filters and pagination using Supabase RPC.
 * Optional query: export_as=csv returns a CSV file instead of JSON.
 */
export async function GET(request: NextRequest) {
  await connection();
  try {
    const userData = await getUserData(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exportAsCsv = searchParams.get("export_as") === "csv";

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = exportAsCsv
      ? EXPORT_CSV_LIMIT
      : Math.min(1000, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const offset = (page - 1) * limit;

    // Parse compound sort: "arv:asc,mortgage:desc" -> [{"column":"arv","direction":"asc"}, ...]
    const sortParam = searchParams.get("sort");
    const p_sort_specs =
      sortParam && sortParam.trim()
        ? sortParam.split(",").map((part) => {
            const [col, dir] = part.split(":").map((s) => s.trim());
            const d = dir?.toLowerCase() === "desc" ? "desc" : "asc";
            return { column: col || "created_at", direction: d };
          })
        : [{ column: "created_at", direction: "desc" }];

    const supabase = await createClient();
    const isInternal = isInternalAdminOrUser(userData);
    const userOrgIds = userData.org_memberships.map((m: any) => m.org_id);

    // Normalize status filter: DB stores lowercase (e.g. "active construction"); support "Active Construction" from UI
    const statusRaw = searchParams.get("status");
    const p_statuses = statusRaw
      ? statusRaw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
      : null;

    // Call the Supabase RPC function
    const { data: rpcResult, error } = await supabase.rpc('get_projects_with_facets', {
      p_search: searchParams.get("search"),
      p_address_search: searchParams.get("address_search"),
      p_company_ids: searchParams.get("company_ids")?.split(',').filter(Boolean),
      p_lender_ids: searchParams.get("lender_ids")?.split(',').filter(Boolean),
      p_statuses,
      p_user_org_ids: userOrgIds.length > 0 ? userOrgIds : null,
      p_is_internal: isInternal,
      p_facet_columns: ['company', 'lender', 'status'], // ADD THIS

      // Computed field filters
      p_investor_capital_min: searchParams.get("investor_capital_filter_from") ? Number(searchParams.get("investor_capital_filter_from")) : null,
      p_investor_capital_max: searchParams.get("investor_capital_filter_to") ? Number(searchParams.get("investor_capital_filter_to")) : null,
      p_equity_min: searchParams.get("equity_filter_from") ? Number(searchParams.get("equity_filter_from")) : null,
      p_equity_max: searchParams.get("equity_filter_to") ? Number(searchParams.get("equity_filter_to")) : null,
      p_leverage_min: searchParams.get("leverage_percentage_filter_from") ? Number(searchParams.get("leverage_percentage_filter_from")) : null,
      p_leverage_max: searchParams.get("leverage_percentage_filter_to") ? Number(searchParams.get("leverage_percentage_filter_to")) : null,
      // Range filters
      p_arv_min: searchParams.get("after_repair_value_filter_from") ? Number(searchParams.get("after_repair_value_filter_from")) : null,
      p_arv_max: searchParams.get("after_repair_value_filter_to") ? Number(searchParams.get("after_repair_value_filter_to")) : null,
      p_mortgage_min: searchParams.get("mortgage_amount_filter_from") ? Number(searchParams.get("mortgage_amount_filter_from")) : null,
      p_mortgage_max: searchParams.get("mortgage_amount_filter_to") ? Number(searchParams.get("mortgage_amount_filter_to")) : null,
      p_purchase_price_min: searchParams.get("purchase_price_filter_from") ? Number(searchParams.get("purchase_price_filter_from")) : null,
      p_purchase_price_max: searchParams.get("purchase_price_filter_to") ? Number(searchParams.get("purchase_price_filter_to")) : null,
      p_rehab_budget_min: searchParams.get("rehab_budget_filter_from") ? Number(searchParams.get("rehab_budget_filter_from")) : null,
      p_rehab_budget_max: searchParams.get("rehab_budget_filter_to") ? Number(searchParams.get("rehab_budget_filter_to")) : null,
      // Pagination
      p_limit: limit,
      p_offset: offset,
      // Compound sort (primary, secondary, ...)
      p_sort_specs: p_sort_specs,
    });

    if (error) throw error;

    const data = rpcResult.data.map((project: any) => {
      const out = { ...project };
      for (const key of Object.keys(out)) {
        if (key.startsWith("f_") || key.endsWith("_json")) delete out[key];
      }
      return out as Record<string, unknown>;
    });

    if (exportAsCsv) {
      const csv = toCsv(data);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="projects.csv"',
        },
      });
    }

    return NextResponse.json({
      data,
      total: rpcResult.total,
      uniqueValues: rpcResult.uniqueValues,
      summary: rpcResult.summary ?? { total_arv: 0, total_equity: 0, total_investor_capital: 0 },
      page,
      limit,
      totalPages: Math.ceil(rpcResult.total / limit),
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
