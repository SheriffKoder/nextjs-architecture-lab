import { RoleEnum } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/server";
import { getUserData, createUserWithOrgMembership } from "@/lib/utils-server";
import { isInternalAdminOrUser } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import { EXPORT_CSV_LIMIT, toCsv } from "@/lib/utils-server";

/**
 * GET /api/orgs
 */
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const exportAsCsv = searchParams.get("export_as") === "csv";
    const orgType = searchParams.get("org_type");
    const search = searchParams.get("search");
    const includeAdmins = searchParams.get("includeAdmins") === "true";
    const includeMembers = searchParams.get("includeMembers") === "true";
    const totalInvested = searchParams.get("totalInvested") === "true";
    const projectsCount = searchParams.get("projectsCount") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = exportAsCsv
      ? EXPORT_CSV_LIMIT
      : Math.min(1000, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const db = await createAdminClient();
    let query = db.from("orgs").select("*", { count: "exact" }).order("name", { ascending: true });

    if (orgType) {
      query = query.contains("org_types", [orgType]);
    }
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data: orgs, count, error } = await query.range(from, to);
    if (error) {
      return NextResponse.json({ error: "Failed to fetch orgs" }, { status: 500 });
    }

    const total = count ?? 0;
    let orgsWithCalculations = orgs ?? [];

    if (includeAdmins || includeMembers) {
      const orgIds = orgsWithCalculations.map((o: any) => o.id);
      let memQuery = db
        .from("org_members")
        .select("org_id, user_id, role_id, users(id, name, email, phone, created_at), roles(id, name, key)")
        .in("org_id", orgIds.length ? orgIds : ["00000000-0000-0000-0000-000000000000"]);
      if (includeAdmins && !includeMembers) {
        const { data: adminRole } = await db.from("roles").select("id").eq("key", RoleEnum.ADMIN).single();
        if (adminRole) memQuery = memQuery.eq("role_id", adminRole.id);
      } else if (includeMembers && !includeAdmins) {
        const { data: adminRole } = await db.from("roles").select("id").eq("key", RoleEnum.ADMIN).single();
        if (adminRole) memQuery = memQuery.neq("role_id", adminRole.id);
      }
      const { data: mems } = await memQuery;
      const memByOrg: Record<string, any[]> = {};
      for (const m of mems ?? []) {
        const oid = m.org_id;
        if (!memByOrg[oid]) memByOrg[oid] = [];
        memByOrg[oid].push({
          org_id: m.org_id,
          user_id: m.user_id,
          role_id: m.role_id,
          user: m.users,
          role: m.roles,
        });
      }
      orgsWithCalculations = orgsWithCalculations.map((org: any) => ({
        ...org,
        members: memByOrg[org.id] ?? [],
      }));
    }

    if (totalInvested || projectsCount) {
      const orgIds = orgsWithCalculations.map((o: any) => o.id);
      const { data: allocations } = await db
        .from("allocations")
        .select("investor_org_id, allocation_amount, project_id")
        .in("investor_org_id", orgIds.length ? orgIds : ["00000000-0000-0000-0000-000000000000"]);
      const byOrg: Record<string, { allocations: number[]; projectIds: Set<string> }> = {};
      for (const a of allocations ?? []) {
        const oid = a.investor_org_id;
        if (!byOrg[oid]) byOrg[oid] = { allocations: [], projectIds: new Set() };
        byOrg[oid].allocations.push(Number(a.allocation_amount));
        byOrg[oid].projectIds.add(a.project_id);
      }
      orgsWithCalculations = orgsWithCalculations.map((org: any) => {
        const d = byOrg[org.id] ?? { allocations: [], projectIds: new Set<string>() };
        return {
          ...org,
          totalInvested: totalInvested ? d.allocations.reduce((s, n) => s + n, 0) : undefined,
          projectsCount: projectsCount ? d.projectIds.size : undefined,
        };
      });
    }

    const totalPages = Math.ceil(total / limit);

    if (exportAsCsv) {
      const flatRows = orgsWithCalculations.map((org: any) => {
        const firstMember = org.members?.[0];
        return {
          id: org.id,
          name: org.name,
          created_at: org.created_at,
          updated_at: org.updated_at,
          org_types: Array.isArray(org.org_types) ? org.org_types.join(";") : "",
          totalInvested: org.totalInvested ?? "",
          projectsCount: org.projectsCount ?? "",
          admin_name: firstMember?.user?.name ?? "",
          admin_email: firstMember?.user?.email ?? "",
        };
      });
      const csv = toCsv(flatRows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="orgs.csv"',
        },
      });
    }

    return NextResponse.json({
      data: orgsWithCalculations,
      total,
      page,
      limit,
      totalPages,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching orgs:", error);
    return NextResponse.json({ error: "Failed to fetch orgs" }, { status: 500 });
  }
}

/**
 * POST /api/orgs
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name: orgName, org_types, company_id, adminName, adminEmail, adminPassword, adminPhone } = body;

    const requestedTypes = Array.isArray(org_types) ? org_types.map((t: string) => t.toLowerCase()) : [];
    const uniqueTypes = Array.from(new Set(requestedTypes)).filter(Boolean);

    if (!orgName || uniqueTypes.length === 0) {
      return NextResponse.json({ error: "Name and org_types are required" }, { status: 400 });
    }

    const db = await createAdminClient();
    const { data: org, error: orgError } = await db
      .from("orgs")
      .insert({
        name: orgName,
        org_types: uniqueTypes,
        ...(company_id ? { company_id } : {}),
      })
      .select()
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: orgError?.message ?? "Failed to create org" }, { status: 500 });
    }

    if (adminName && adminEmail) {
      const { data: adminRole } = await db.from("roles").select("id").eq("key", RoleEnum.ADMIN).single();
      if (!adminRole) {
        return NextResponse.json({ error: "Admin role not found" }, { status: 500 });
      }
      const result = await createUserWithOrgMembership({
        email: adminEmail,
        password: adminPassword ?? `${adminEmail.split("@")[0]}_revilo`,
        name: adminName ?? orgName,
        phone: adminPhone ?? null,
        role_id: adminRole.id,
        org_id: org.id,
      });
      if (!result.ok) {
        return NextResponse.json({ error: result.error, org }, { status: result.status });
      }
    }

    return NextResponse.json(org, { status: 201 });
  } catch (error: any) {
    console.error("Error creating org:", error);
    return NextResponse.json({ error: "Failed to create org" }, { status: 500 });
  }
}
