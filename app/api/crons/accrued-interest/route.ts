import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/crons/accrued-interest
 * Cron job to update accrued interest for all active allocations.
 * Note: Requires an "accrued_interest" column on allocations table (add via migration if missing).
 */
export async function GET(req: NextRequest) {
  try {
    const db = await createAdminClient();
    const { data: activeAllocations, error: fetchError } = await db
      .from("allocations")
      .select("id, allocation_amount, interest_rate_percentage, accrued_interest")
      .eq("status", "active");

    if (fetchError) {
      return NextResponse.json(
        { message: "Failed to fetch allocations", error: fetchError.message },
        { status: 500 }
      );
    }

    if (!activeAllocations || activeAllocations.length === 0) {
      return NextResponse.json(
        {
          message: "No active allocations found",
          updated: 0,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    const updates = activeAllocations.map((allocation: any) => {
      const interestIncrement =
        (Number(allocation.interest_rate_percentage) / 100) * Number(allocation.allocation_amount);
      const newAccruedInterest = Number(allocation.accrued_interest ?? 0) + interestIncrement;
      return db.from("allocations").update({ accrued_interest: newAccruedInterest }).eq("id", allocation.id);
    });

    await Promise.all(updates);

    return NextResponse.json(
      {
        message: "Accrued interest updated successfully",
        updated: activeAllocations.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing accrued interest:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
