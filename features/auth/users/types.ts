import type { UserRole } from "../roles/types";

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

/** Authenticated user profile plus a single app role (backed by org_members in DB). */
export type UserWithRole = User & {
  role: UserRole | null;
};
