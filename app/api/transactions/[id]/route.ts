import { createAdminClient } from "@/lib/supabase/server";
import { getUserData } from "@/lib/utils-server";
import { isInternalAdminOrUser } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

function mapTransactionVariables(transactions: any[]) {
  return transactions.map((t) => ({ ...t, amount: Number(t.amount) }));
}

/**
 * GET /api/transactions/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userData = await getUserData(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createAdminClient();
    const { data: transaction, error } = await db
      .from("transactions")
      .select("*, from_company:companies(*), to_org:orgs(*), allocation:allocations(*, investor_org:orgs(*)), project:projects(*, company:companies(*))")
      .eq("id", id)
      .single();

    if (error || !transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const isInternal = isInternalAdminOrUser(userData);
    const userOrgIds = userData.org_memberships.map((m: any) => m.org_id);
    const isToOrgMember = userOrgIds.includes(transaction.to_org_id);

    if (!isInternal && !isToOrgMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [mapped] = mapTransactionVariables([transaction]);
    return NextResponse.json(mapped, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 });
  }
}

/**
 * PUT /api/transactions/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userData = await getUserData(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Forbidden: Only internal admins can update transactions" }, { status: 403 });
    }

    const db = await createAdminClient();
    const { data: existingTransaction, error: fetchError } = await db
      .from("transactions")
      .select("id, amount, allocation_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.amount !== undefined) {
      const newAmount = Number(body.amount);
      if (newAmount <= 0) {
        return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
      }
      updateData.amount = newAmount;
    }
    if (body.from_company_id !== undefined) {
      const { data: company } = await db.from("companies").select("id").eq("id", body.from_company_id).single();
      if (!company) return NextResponse.json({ error: `Company ${body.from_company_id} not found` }, { status: 404 });
      updateData.from_company_id = body.from_company_id;
    }
    if (body.to_org_id !== undefined) {
      const { data: org } = await db.from("orgs").select("id").eq("id", body.to_org_id).single();
      if (!org) return NextResponse.json({ error: `Organization ${body.to_org_id} not found` }, { status: 404 });
      updateData.to_org_id = body.to_org_id;
    }
    if (body.allocation_id !== undefined) {
      const { data: alloc } = await db.from("allocations").select("id").eq("id", body.allocation_id).single();
      if (!alloc) return NextResponse.json({ error: `Allocation ${body.allocation_id} not found` }, { status: 404 });
      updateData.allocation_id = body.allocation_id;
    }
    if (body.project_id !== undefined) {
      const { data: proj } = await db.from("projects").select("id").eq("id", body.project_id).single();
      if (!proj) return NextResponse.json({ error: `Project ${body.project_id} not found` }, { status: 404 });
      updateData.project_id = body.project_id;
    }

    let amountDifference = 0;
    if (updateData.amount !== undefined) {
      amountDifference = updateData.amount - Number(existingTransaction.amount);
    }

    const { data: updatedTransaction, error: updateError } = await db
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .select("*, from_company:companies(*), to_org:orgs(*), allocation:allocations(*, investor_org:orgs(*)), project:projects(*, company:companies(*))")
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    if (amountDifference !== 0) {
      const allocationId = updateData.allocation_id ?? existingTransaction.allocation_id;
      const { data: currentAllocation } = await db.from("allocations").select("distributed_to_date").eq("id", allocationId).single();
      if (currentAllocation) {
        const currentDistributed = Number(currentAllocation.distributed_to_date);
        const newDistributed = currentDistributed + amountDifference;
        await db.from("allocations").update({ distributed_to_date: newDistributed }).eq("id", allocationId);
      }
    }

    const [mapped] = mapTransactionVariables([updatedTransaction!]);
    return NextResponse.json(mapped, { status: 200 });
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

/**
 * DELETE /api/transactions/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userData = await getUserData(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Forbidden: Only internal admins can delete transactions" }, { status: 403 });
    }

    const db = await createAdminClient();
    const { data: existingTransaction, error: fetchError } = await db
      .from("transactions")
      .select("id, amount, allocation_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const transactionAmount = Number(existingTransaction.amount);
    const allocationId = existingTransaction.allocation_id;

    const { error: deleteError } = await db.from("transactions").delete().eq("id", id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    const { data: currentAllocation } = await db.from("allocations").select("distributed_to_date").eq("id", allocationId).single();
    if (currentAllocation) {
      const currentDistributed = Number(currentAllocation.distributed_to_date);
      const newDistributed = Math.max(0, currentDistributed - transactionAmount);
      await db.from("allocations").update({ distributed_to_date: newDistributed }).eq("id", allocationId);
    }

    return NextResponse.json({ message: "Transaction deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
