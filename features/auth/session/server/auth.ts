import { NextRequest } from "next/server";
import { createClient } from "../../supabase/server";

export async function getAuthUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return data?.claims ?? null;
}

export function getAuthUserFromHeader(request: NextRequest) {
  const authHeader = request.headers.get("X_AUTH_USER");
  if (!authHeader) {
    return null;
  }

  try {
    const decoded = Buffer.from(authHeader, "base64").toString("utf-8");
    const authUser = JSON.parse(decoded);
    return authUser;
  } catch {
    return null;
  }
}
