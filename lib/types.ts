export interface Role {
  id: string;
  key: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

/** Role assignment exposed to the app (orgs are not modeled in this starter). */
export interface UserRole {
  role_id: string;
  role: Pick<Role, "id" | "key" | "name">;
}
