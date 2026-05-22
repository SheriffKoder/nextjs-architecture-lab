import { createClient } from "@/features/auth/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * POST /api/auth/logout
 * Signs out the current user (clears Supabase session cookies).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("[auth/logout] Error:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
