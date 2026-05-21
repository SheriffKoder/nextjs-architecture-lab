import { getUserData } from "@/features/auth/server";
import { connection } from "next/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/users/me — current user and role (no org payload).
 */
export async function GET(request: NextRequest) {
  await connection();
  try {
    const userData = await getUserData(request);

    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        role: userData.role,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
