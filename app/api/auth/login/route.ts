import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_INTERNAL_ORG_ID } from "@/lib/constants";
import { roleFromMembershipRow } from "@/lib/utils-server";

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    const db = await createAdminClient();
    const { data: userRow, error: userError } = await db
      .from("users")
      .select("id, email, name, created_at, updated_at, phone")
      .eq("id", userId)
      .single();

    if (userError || !userRow) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const { data: memberships } = await db
      .from("org_members")
      .select("role_id, roles(id, name, key)")
      .eq("user_id", userId)
      .eq("org_id", DEFAULT_INTERNAL_ORG_ID)
      .limit(1);

    const role = memberships?.[0]
      ? roleFromMembershipRow(memberships[0] as Parameters<typeof roleFromMembershipRow>[0])
      : null;

    const userMetadata: Record<string, unknown> = {
      email: userRow.email,
      name: userRow.name,
      synced_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase.auth.updateUser({
      data: userMetadata,
    });

    if (updateError) {
      console.error("Error updating user metadata:", updateError);
    }

    return NextResponse.json(
      {
        user: userRow,
        role,
        session: authData.session,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
