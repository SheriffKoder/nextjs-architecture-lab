import { getUserData } from "@/lib/utils-server";
import { connection } from "next/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/users/me
 * Get the current authenticated user's data including memberships
 * 
 * Example response:
 * {
 *   id: "uuid",
 *   email: "user@example.com",
 *   name: "User Name",
 *   created_at: "2024-01-01T00:00:00.000Z",
 *   updated_at: "2024-01-01T00:00:00.000Z",
 *   memberships: [
 *     {
 *       org_id: "uuid",
 *       user_id: "uuid",
 *       role_id: "uuid",
 *       created_at: "2024-01-01T00:00:00.000Z",
 *       org: { id: "uuid", name: "Org Name", org_types: ["internal"] },
 *       role: { id: "uuid", key: "admin", name: "Admin" }
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  await connection();
  try {
    const userData = await getUserData(request);
    
    if (!userData) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return user data with memberships
    return NextResponse.json(
      {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        memberships: userData.org_memberships || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
