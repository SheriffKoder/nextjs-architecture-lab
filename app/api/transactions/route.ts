import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { isInternalAdminOrUser } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

function mapTransactionVariables(transactions: any[]) {
  return transactions.map((t) => ({ ...t, amount: Number(t.amount) }));
}

function validateTransactionData(data: any): { valid: boolean; error?: string } {
  if (!data.from_company_id || typeof data.from_company_id !== "string") {
    return { valid: false, error: "from_company_id is required and must be a string" };
  }
  if (!data.to_org_id || typeof data.to_org_id !== "string") {
    return { valid: false, error: "to_org_id is required and must be a string" };
  }
  if (!data.amount || (typeof data.amount !== "number" && typeof data.amount !== "string")) {
    return { valid: false, error: "amount is required and must be a number" };
  }
  if (Number(data.amount) <= 0) {
    return { valid: false, error: "amount must be greater than 0" };
  }
  if (!data.allocation_id || typeof data.allocation_id !== "string") {
    return { valid: false, error: "allocation_id is required and must be a string" };
  }
  if (!data.project_id || typeof data.project_id !== "string") {
    return { valid: false, error: "project_id is required and must be a string" };
  }
  return { valid: true };
}

async function createTransactionAndUpdateAllocation(
  db: Awaited<ReturnType<typeof createAdminClient>>,
  transactionData: {
    from_company_id: string;
    to_org_id: string;
    amount: number;
    allocation_id: string;
    project_id: string;
  }
) {
  const [fromCompany, toOrg, allocation, project] = await Promise.all([
    db.from("companies").select("id").eq("id", transactionData.from_company_id).single(),
    db.from("orgs").select("id").eq("id", transactionData.to_org_id).single(),
    db.from("allocations").select("id, distributed_to_date, project_id, investor_org_id").eq("id", transactionData.allocation_id).single(),
    db.from("projects").select("id").eq("id", transactionData.project_id).single(),
  ]);

  if (!fromCompany.data) throw new Error(`Company ${transactionData.from_company_id} not found`);
  if (!toOrg.data) throw new Error(`Organization ${transactionData.to_org_id} not found`);
  if (!allocation.data) throw new Error(`Allocation ${transactionData.allocation_id} not found`);
  if (!project.data) throw new Error(`Project ${transactionData.project_id} not found`);

  const alloc = allocation.data as any;
  if (alloc.project_id !== transactionData.project_id) {
    throw new Error(`Allocation ${transactionData.allocation_id} does not belong to project ${transactionData.project_id}`);
  }
  if (alloc.investor_org_id !== transactionData.to_org_id) {
    throw new Error(`to_org_id ${transactionData.to_org_id} does not match allocation's investor_org_id ${alloc.investor_org_id}`);
  }

  const { data: transaction, error: insertError } = await db
    .from("transactions")
    .insert({
      from_company_id: transactionData.from_company_id,
      to_org_id: transactionData.to_org_id,
      amount: transactionData.amount,
      allocation_id: transactionData.allocation_id,
      project_id: transactionData.project_id,
    })
    .select("*, from_company:companies(*), to_org:orgs(*), allocation:allocations(*), project:projects(*)")
    .single();

  if (insertError) throw new Error(insertError.message);

  const currentDistributed = Number(alloc.distributed_to_date ?? 0);
  const newDistributed = currentDistributed + transactionData.amount;
  const { error: updateError } = await db
    .from("allocations")
    .update({ distributed_to_date: newDistributed })
    .eq("id", transactionData.allocation_id);

  if (updateError) throw new Error(updateError.message);
  return transaction;
}

/**
 * GET /api/transactions
 */
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fromCompanyId = searchParams.get("from_company_id");
    const toOrgId = searchParams.get("to_org_id");
    const allocationId = searchParams.get("allocation_id");
    const projectId = searchParams.get("project_id");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const db = await createAdminClient();
    let query = db
      .from("transactions")
      .select("*, from_company:companies(*), to_org:orgs(*), allocation:allocations(*, investor_org:orgs(*)), project:projects(*, company:companies(*))", { count: "exact" })
      .order("created_at", { ascending: false });

    const isInternal = isInternalAdminOrUser(userData);
    if (!isInternal) {
      const userOrgIds = userData.org_memberships.map((m: any) => m.org_id);
      query = query.in("to_org_id", userOrgIds);
    }
    if (fromCompanyId) query = query.eq("from_company_id", fromCompanyId);
    if (toOrgId) query = query.eq("to_org_id", toOrgId);
    if (allocationId) query = query.eq("allocation_id", allocationId);
    if (projectId) query = query.eq("project_id", projectId);

    const { data: transactions, count, error } = await query.range(from, to);
    if (error) {
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }

    const totalPages = Math.ceil((count ?? 0) / limit);
    const mappedTransactions = mapTransactionVariables(transactions ?? []);

    return NextResponse.json(
      {
        data: mappedTransactions,
        total: count ?? 0,
        page,
        limit,
        totalPages,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

/**
 * POST /api/transactions
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserData(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Forbidden: Only internal admins can create transactions" }, { status: 403 });
    }

    const body = await request.json();
    const isBulk = Array.isArray(body);
    const transactionsData = isBulk ? body : [body];

    if (transactionsData.length === 0) {
      return NextResponse.json({ error: "No transaction data provided" }, { status: 400 });
    }

    const validationErrors: string[] = [];
    transactionsData.forEach((data, index) => {
      const validation = validateTransactionData(data);
      if (!validation.valid) validationErrors.push(`Transaction ${index + 1}: ${validation.error}`);
    });
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 });
    }

    const normalized = transactionsData.map((data) => ({
      from_company_id: data.from_company_id,
      to_org_id: data.to_org_id,
      amount: Number(data.amount),
      allocation_id: data.allocation_id,
      project_id: data.project_id,
    }));

    const db = await createAdminClient();
    const results = await Promise.all(normalized.map((t) => createTransactionAndUpdateAllocation(db, t)));
    const mappedResults = mapTransactionVariables(results);

    if (isBulk) {
      return NextResponse.json({ data: mappedResults, count: mappedResults.length }, { status: 201 });
    }
    return NextResponse.json(mappedResults[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating transaction(s):", error);
    if (error.message?.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message?.includes("does not belong")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create transaction(s)" }, { status: 500 });
  }
}
