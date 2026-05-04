import { ProjectStatusEnum } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/server";
import { isInternalAdmin, isInternalAdminOrUser } from "@/lib/utils";
import { getUserData } from "@/lib/utils-server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/orgs/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const db = await createAdminClient();
    const { data: org, error } = await db.from("orgs").select("*").eq("id", id).single();

    if (error || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(org, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching org:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
  }
}

/**
 * PUT /api/orgs/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdminOrUser(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const db = await createAdminClient();
    const { data: org, error } = await db
      .from("orgs")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(org, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating org:", error);
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
  }
}

/** Active = any project that is not sold (user can't delete org while assigned to these). */
const ACTIVE_PROJECT_STATUSES = [
  ProjectStatusEnum.ACTIVE_CONSTRUCTION,
  ProjectStatusEnum.FOR_SALE,
  ProjectStatusEnum.PENDING_PURCHASE,
  ProjectStatusEnum.RENTAL_PROPERTIES,
];

type RemoveType = "contractor" | "lender";

type RelatedProject = { id: string; address: string; status: string };

type DbClient = Awaited<ReturnType<typeof createAdminClient>>;

const toRelatedProject = (p: { id: string; address: string; status?: string }): RelatedProject => ({
  id: p.id,
  address: p.address,
  status: p.status ?? "",
});

const dedupeById = (projects: RelatedProject[]): RelatedProject[] =>
  Array.from(new Map(projects.map((p) => [p.id, p])).values());

const typesAfterRemoval = (currentTypes: string[] | unknown, removeType: string): string[] =>
  (Array.isArray(currentTypes) ? currentTypes : []).filter((t) => t !== removeType);

const conflictPayload = (relatedProjects: RelatedProject[]) => ({
  error: "This organization cannot be deleted because it is assigned to active projects.",
  code: "HAS_ACTIVE_PROJECTS" as const,
  relatedProjects,
});

async function fetchActiveProjectsByContractor(
  db: DbClient,
  orgId: string
): Promise<RelatedProject[]> {
  const { data } = await db
    .from("projects")
    .select("id, address, status")
    .eq("contractor_org_id", orgId)
    .in("status", ACTIVE_PROJECT_STATUSES);
  return (data ?? []).map(toRelatedProject);
}

async function fetchActiveProjectsByLender(
  db: DbClient,
  orgId: string
): Promise<RelatedProject[]> {
  const { data } = await db
    .from("projects")
    .select("id, address, status")
    .eq("lender_org_id", orgId)
    .in("status", ACTIVE_PROJECT_STATUSES);
  return (data ?? []).map(toRelatedProject);
}

async function fetchOrgTypes(
  db: DbClient,
  orgId: string
): Promise<{ id: string; org_types: string[] } | null> {
  const { data, error } = await db
    .from("orgs")
    .select("id, org_types")
    .eq("id", orgId)
    .single();
  return error || !data ? null : data as { id: string; org_types: string[] };
}

async function collectActiveProjectsForOrg(
  db: DbClient,
  orgId: string,
  removeType: RemoveType | null
): Promise<RelatedProject[]> {
  const shouldCheckContractor = !removeType || removeType === "contractor";
  const shouldCheckLender = !removeType || removeType === "lender";

  const [byContractor, byLender] = await Promise.all([
    shouldCheckContractor ? fetchActiveProjectsByContractor(db, orgId) : [],
    shouldCheckLender ? fetchActiveProjectsByLender(db, orgId) : [],
  ]);

  return dedupeById([...byContractor, ...byLender]);
}

/**
 * DELETE /api/orgs/[id]
 * Query param: remove_type=contractor | lender — when set, only that type is removed from org_types
 * (and the org is only fully deleted if no types remain). Otherwise the org is deleted entirely.
 * Returns 409 with relatedProjects when the org is assigned to any active (non-sold) project
 * for the relevant role(s).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userData = await getUserData(request);
    if (!isInternalAdmin(userData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const removeType = new URL(request.url).searchParams.get("remove_type") as RemoveType | null;
    const db = await createAdminClient();

    const relatedProjects = await collectActiveProjectsForOrg(db, id, removeType);
    if (relatedProjects.length > 0) {
      return NextResponse.json(conflictPayload(relatedProjects), { status: 409 });
    }

    if (removeType === "contractor" || removeType === "lender") {
      const org = await fetchOrgTypes(db, id);
      if (!org) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      const newTypes = typesAfterRemoval(org.org_types, removeType);

      if (newTypes.length === 0) {
        const { error } = await db.from("orgs").delete().eq("id", id);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Organization deleted successfully" }, { status: 200 });
      }

      const { data: updated, error } = await db
        .from("orgs")
        .update({ org_types: newTypes })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(
        { message: "Organization type removed", org: updated },
        { status: 200 }
      );
    }

    const { error } = await db.from("orgs").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Organization deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting org:", error);
    return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 });
  }
}
