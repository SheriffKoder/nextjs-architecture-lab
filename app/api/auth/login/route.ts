import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * POST /api/auth/login
 * Login with email and password, then set user data in auth metadata
 * Body: { email, password }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Sign in with email and password
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      );
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
      .select("id, email, name, created_at, updated_at")
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
      .select("org_id, user_id, role_id, created_at, orgs(id, name, org_types), roles(id, name, key)")
      .eq("user_id", userId);
    const org_memberships = (memberships ?? []).map((m: any) => ({
      ...m,
      org: m.orgs,
      role: m.roles,
    }));
    const user = { ...userRow, org_memberships };

    // Prepare user metadata for Supabase JWT
    const userMetadata: Record<string, any> = {
      email: user.email,
      name: user.name,
      // We store the primary membership info if available, or just the fact that metadata was synced
      synced_at: new Date().toISOString(),
    };

    // Update auth user metadata with user profile data
    const { error: updateError } = await supabase.auth.updateUser({
      data: userMetadata,
    });

    if (updateError) {
      console.error("Error updating user metadata:", updateError);
    }

    // Prepare response data
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      memberships: user.org_memberships,
      session: authData.session,
    };

    // Return user data and memberships
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}

