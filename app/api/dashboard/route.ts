import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { isInternalAdminOrUser } from "@/lib/utils";
import { AllocationStatusEnum } from "@/lib/constants";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/dashboard
 * Returns pre-aggregated dashboard summary data using Supabase.
 */
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const now = new Date();
    const in14Days = new Date(now);
    in14Days.setDate(now.getDate() + 14);
    const in90Days = new Date(now);
    in90Days.setDate(now.getDate() + 90);

    const db = await createAdminClient();

    const [
      { count: projectCount },
      { data: allProjects },
      { data: allAllocations },
      { data: projectsWithCompany },
      { data: upcomingExpirations },
      { data: leverageEquityProjects },
      { data: recentAllocationsForTable },
    ] = await Promise.all([
      db.from("projects").select("id", { count: "exact", head: true }),
      db.from("projects").select("after_repair_value, mortgage_amount"),
      db.from("allocations").select("allocation_amount, distributed_to_date, note_maturity_date, investment_date, inactive_date, status"),
      db.from("projects").select("company_id, companies(name)"),
      db
        .from("allocations")
        .select("allocation_amount, note_maturity_date, project:projects(address)")
        .gte("note_maturity_date", now.toISOString().split("T")[0])
        .lte("note_maturity_date", in14Days.toISOString().split("T")[0])
        .order("note_maturity_date", { ascending: true }),
      db
        .from("projects")
        .select("id, address, after_repair_value, mortgage_amount, allocations(allocation_amount, interest_rate_percentage, investment_date, inactive_date, status, distributed_to_date)")
        .order("created_at", { ascending: false })
        .limit(30),
      db
        .from("allocations")
        .select("id, created_at, investor_org:orgs(name), project:projects(address, company:companies(name))")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const totalArv = (allProjects ?? []).reduce((s, p) => s + Number(p.after_repair_value ?? 0), 0);
    const totalMortgages = (allProjects ?? []).reduce((s, p) => s + Number(p.mortgage_amount ?? 0), 0);
    const allocationAggregates = (allAllocations ?? []).reduce(
      (acc, a) => ({
        allocation_amount: acc.allocation_amount + Number(a.allocation_amount ?? 0),
        distributed_to_date: acc.distributed_to_date + Number(a.distributed_to_date ?? 0),
      }),
      { allocation_amount: 0, distributed_to_date: 0 }
    );
    const totalPrivateInvestment = allocationAggregates.allocation_amount;
    const totalDistributed = allocationAggregates.distributed_to_date;

    const expiringIn90Count = (allAllocations ?? []).filter((a) => {
      const d = a.note_maturity_date ? new Date(a.note_maturity_date) : null;
      return d && d >= now && d <= in90Days;
    }).length;

    const projectsByStatusMap: Record<string, number> = {};
    const { data: statusRows } = await db.from("projects").select("status");
    for (const r of statusRows ?? []) {
      const s = (r as any).status ?? "unknown";
      projectsByStatusMap[s] = (projectsByStatusMap[s] ?? 0) + 1;
    }

    const projectsByCompanyMap: Record<string, number> = {};
    for (const p of projectsWithCompany ?? []) {
      const name = (p as any).companies?.name ?? "Unknown";
      projectsByCompanyMap[name] = (projectsByCompanyMap[name] ?? 0) + 1;
    }

    let totalCurrentInvestment = 0;
    let totalAccruedInterest = 0;
    for (const project of leverageEquityProjects ?? []) {
      const allocs = (project as any).allocations ?? [];
      for (const a of allocs) {
        const amount = Number(a.allocation_amount) || 0;
        const rate = Number(a.interest_rate_percentage) || 0;
        const distributed = Number(a.distributed_to_date) || 0;
        let accrued = 0;
        if (a.investment_date && amount && rate) {
          const investDate = new Date(a.investment_date);
          const endDate = a.inactive_date && a.status === AllocationStatusEnum.INACTIVE ? new Date(a.inactive_date) : now;
          const diffDays = Math.floor((endDate.getTime() - investDate.getTime()) / (1000 * 60 * 60 * 24));
          accrued = (rate / 100) * amount * (diffDays / 365) - distributed;
        }
        totalAccruedInterest += Math.max(accrued, 0);
        totalCurrentInvestment += amount + Math.max(accrued, 0);
      }
    }

    const netEquity = totalArv - totalMortgages - totalCurrentInvestment;
    const weightedLeverage = totalArv > 0 ? Math.round(((totalMortgages + totalCurrentInvestment) / totalArv) * 100) : 0;

    const leverageEquity = (leverageEquityProjects ?? []).map((p: any) => {
      const mortgage = Number(p.mortgage_amount) || 0;
      const arv = Number(p.after_repair_value) || 0;
      let investorCurrent = 0;
      for (const a of p.allocations ?? []) {
        const amount = Number(a.allocation_amount) || 0;
        const rate = Number(a.interest_rate_percentage) || 0;
        const distributed = Number(a.distributed_to_date) || 0;
        let accrued = 0;
        if (a.investment_date && amount && rate) {
          const investDate = new Date(a.investment_date);
          const endDate = a.inactive_date && a.status === AllocationStatusEnum.INACTIVE ? new Date(a.inactive_date) : now;
          const diffDays = Math.floor((endDate.getTime() - investDate.getTime()) / (1000 * 60 * 60 * 24));
          accrued = Math.max((rate / 100) * amount * (diffDays / 365) - distributed, 0);
        }
        investorCurrent += amount + accrued;
      }
      const leverage = mortgage + investorCurrent;
      const equity = arv - leverage;
      return { address: p.address, leverage: Math.round(leverage), equity: Math.round(equity) };
    });

    const timelineExpirations = (upcomingExpirations ?? []).map((a: any) => {
      const mat = new Date(a.note_maturity_date);
      const month = String(mat.getMonth() + 1).padStart(2, "0");
      const day = String(mat.getDate()).padStart(2, "0");
      const year = mat.getFullYear();
      return {
        date: `${month}/${day}/${year}`,
        note: `Note expiration — ${a.project?.address ?? "Unknown project"}`,
        amount: Number(a.allocation_amount) || 0,
      };
    });

    const tableRows = (recentAllocationsForTable ?? []).map((a: any) => ({
      id: a.id,
      created_at: typeof a.created_at === "string" ? a.created_at : new Date(a.created_at).toISOString(),
      company: a.project?.company?.name ?? "",
      investor: a.investor_org?.name ?? "",
      project: a.project?.address ?? "",
    }));

    return NextResponse.json(
      {
        liveProjects: projectCount ?? 0,
        totalPortfolioArv: totalArv,
        totalMortgages,
        totalPrivateInvestment,
        totalCurrentInvestment: Math.round(totalCurrentInvestment),
        totalAccruedInterest: Math.round(totalAccruedInterest * 100) / 100,
        totalDistributed,
        netEquity: Math.round(netEquity),
        weightedLeverage,
        expiringIn90Days: expiringIn90Count,
        leverageExceedsThreshold: weightedLeverage > 70,
        projectsByStatus: projectsByStatusMap,
        projectsByCompany: projectsByCompanyMap,
        leverageEquity,
        timelineExpirations,
        tableRows,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard summary" }, { status: 500 });
  }
}
