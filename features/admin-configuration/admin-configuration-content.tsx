"use client";

import React from "react";
import SimpleTable, {
  type SimpleTableColumn,
} from "@/components/design/simple-table";
import type { Company, Org, Project, TitleCompany } from "@/lib/types";
import type { ConfigTabId } from "./index";
import { capitalizeAllFirstLetters } from "@/lib/utils";

interface AdminConfigurationContentProps {
  tabs: { id: ConfigTabId; label: string }[];
  activeTab: ConfigTabId;
  onTabChange: (tab: ConfigTabId) => void;
  data: unknown[];
  loading: boolean;
  onAddClick?: (tab: ConfigTabId) => void;
  /** When provided (e.g. for companies tab), rows are clickable and this is called with the row. */
  onRowClick?: (row: unknown) => void;
}

const AdminConfigurationContent = ({
  tabs,
  activeTab,
  onTabChange,
  data,
  loading,
  onAddClick,
  onRowClick,
}: AdminConfigurationContentProps) => {
  const getColumns = (): SimpleTableColumn[] => {
    switch (activeTab) {
      case "companies":
        return [
          // {
          //   key: "id",
          //   label: "ID",
          //   minWidth: "280px",
          //   render: (_: unknown, row: Company) =>
          //     (row as Company).id.slice(-8) ?? "",
          // },
          { key: "name", label: "Name", minWidth: "200px" },
        ];
      case "contractors":
        return [
          {
            key: "name",
            label: "Name",
            minWidth: "200px",
            render: (_: unknown, row: Org) => {
              const org = row as Org & {
                members?: Array<{ user?: { name?: string | null } }>;
              };
              const admin =
                org.members?.length && org.members[0]?.user
                  ? org.members[0].user
                  : null;
              return admin?.name ?? org.name ?? "";
            },
          },
        ];
      case "lenders":
        return [
          {
            key: "name",
            label: "Name",
            minWidth: "200px",
            render: (_: unknown, row: Org) => {
              const org = row as Org & {
                members?: Array<{ user?: { name?: string | null } }>;
              };
              const admin =
                org.members?.length && org.members[0]?.user
                  ? org.members[0].user
                  : null;
              return admin?.name ?? org.name ?? "";
            },
          },
        ];
      case "realtors":
        return [
          {
            key: "name",
            label: "Name",
            minWidth: "200px",
            render: (_: unknown, row: Org) => {
              const org = row as Org & {
                members?: Array<{ user?: { name?: string | null } }>;
              };
              const admin =
                org.members?.length && org.members[0]?.user
                  ? org.members[0].user
                  : null;
              return admin?.name ?? org.name ?? "";
            },
          },
          {
            key: "email",
            label: "Email",
            minWidth: "200px",
            render: (_: unknown, row: Org) => {
              const org = row as Org & {
                members?: Array<{ user?: { email?: string | null } }>;
              };
              const admin =
                org.members?.length && org.members[0]?.user
                  ? org.members[0].user
                  : null;
              return admin?.email ?? "";
            },
          },
          {
            key: "phone",
            label: "Phone",
            minWidth: "200px",
            render: (_: unknown, row: Org) => {
              const org = row as Org & {
                members?: Array<{ user?: { phone?: string | null } }>;
              };
              const admin =
                org.members?.length && org.members[0]?.user
                  ? org.members[0].user
                  : null;
              return admin?.phone ?? "";
            },
          },
        ];
      case "titleCompanies":
        return [
          { key: "name", label: "Name", minWidth: "200px" },
        ];
      case "projects":
        return [
          { key: "address", label: "Address", minWidth: "200px" },
          {
            key: "company",
            label: "Company",
            minWidth: "200px",
            render: (_: unknown, row: Project) =>
              (row as Project).company?.name ??
              (row as Project).company_id ??
              "",
          },
          {
            key: "title_company",
            label: "Title Company",
            minWidth: "200px",
            render: (_: unknown, row: Project) =>
              (row as Project).title_company?.name ??
              (row as Project).title_company_id ??
              "",
          },
          { 
            key: "status", 
            label: "Status", 
            minWidth: "160px" ,
            render: (_: unknown, row: Project) =>
              capitalizeAllFirstLetters((row as Project).status ?? ""),
          },
        ];
      default:
        return [];
    }
  };

  const getRowKey = (row: unknown): string => {
    const r = row as Record<string, unknown>;
    return typeof r?.id === "string" ? r.id : String(r?.id ?? Math.random());
  };

  const columns = getColumns();
  const activeTabLabel = tabs.find((t) => t.id === activeTab)?.label ?? activeTab;

  return (
    <div className="p-4 min-h-full flex flex-col gap-4 h-fit">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-foreground/10 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-tertiary text-background border border-b-0 border-tertiary"
                : "bg-transparent text-foreground/70 hover:bg-foreground/10 border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Dynamic Add button */}
        {onAddClick && (
          <button
            type="button"
            onClick={() => onAddClick(activeTab)}
            className="ml-auto px-4 py-2 text-sm font-medium rounded-md bg-tertiary text-background hover:bg-tertiary/90 transition-colors"
          >
            Add {activeTabLabel}
          </button>
        )}
      </div>


      <div className="flex-1 min-h-0">
        <SimpleTable
          columns={columns}
          data={data}
          getRowKey={getRowKey}
          emptyMessage={`No ${activeTabLabel} found.`}
          onRowClick={onRowClick}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AdminConfigurationContent;
