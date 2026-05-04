# Authorization Flow: Multi-Tenant Org-Based System

## Overview
This application uses a multi-tenant, organization-based authorization model. Authorization is enforced at the API level (Server-side) based on user memberships in various organizations. Identity is managed by Supabase Auth, while application-level permissions are managed via Organizations and Roles.

## Data Model Support
- **Users**: Connected to Supabase Auth (`auth.users`). Profiles stored in `public.users`.
- **Orgs**: Tenants/Workspaces (internal, investor, lender, realtor, contractor).
- **Roles**: Generic permission sets (admin, user, hr, viewer).
- **OrgMembers**: Links Users to Orgs with specific Roles. A user can be in multiple orgs with different roles.
- **Companies**: Internal business entities that own projects.
- **Projects**: Real estate assets owned by companies and serviced by external orgs (lenders/realtors).
- **Allocations**: Financial contributions from an **Investor Org** to a **Project**.

## Client-Side State Management (Redux)
After a successful login:
1. The API returns the `user` profile and their list of `org_memberships` (including `org` and `role` details).
2. This data is stored in the `userSlice` in Redux:
   - `state.user`: Basic profile information.
   - `state.memberships`: Array of all organizations the user belongs to and their roles within them.
3. Custom hooks (e.g., `useAuth`) provide helper methods to check permissions on the frontend for UI visibility (e.g., showing/hiding the "Admin" tab).

## Authorization Logic in API Endpoints

### 1. Identify User
Every request must be authenticated via Supabase. The `current_user.id` is retrieved from the session or a secure header (`X_AUTH_USER`).

### 2. Fetch Context (Server-Side)
The API uses the `getUserData` helper to retrieve the user's full profile and `org_memberships` directly from the database to ensure up-to-date permissions.

### 3. Permission Checks

#### **Internal Management (Projects/Companies/Users/Orgs)**
- **Action**: Create/Update Project, Manage Companies, Create Users, Manage Orgs.
- **Check**: User must have a membership in an `org` where `org_type === 'internal'` and `role.key` is `admin` or `user`.
- **Snippet**:
  ```typescript
  const userData = await getUserData(request);
  const isInternal = userData.org_memberships.some(m => 
    m.org.org_type === 'internal' && (m.role.key === 'admin' || m.role.key === 'user')
  );
  ```

#### **Project Partnerships**
- **Action**: Attach Lender/Realtor to a Project.
- **Check**: Only `internal` admins can assign external orgs to projects.

#### **Investor Allocations**
- **Action**: Create an Allocation.
- **Check**:
  1. User must be a member of the target `investor_org_id`.
  2. User's role in that org must be `admin` or `user`.
  3. The `created_by_user_id` is set to the current user's ID.

#### **Visibility (Read Access)**
- **Internal Orgs**: Can see all data (Projects, Allocations, Users, Orgs) across the platform.
- **Investor Orgs**: Can only see Allocations belonging to their specific `investor_org_id`.
- **Lender/Realtor Orgs**: Can see Projects they are specifically attached to as `lender_org_id` or `realtor_org_id`.

## Example Scenario
**User A** is:
- `admin` in **Investor Org X**
- `user` in **Realtor Org Y**

**Capabilities**:
- **As Investor**: Can create and view allocations specifically for **Org X**.
- **As Realtor**: Can view details for any project where **Org Y** is the assigned realtor.
- **Restrictions**: Cannot create new projects, manage other companies, or see allocations from other investor organizations.
