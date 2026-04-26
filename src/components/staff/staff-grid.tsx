"use client";

import type { ColDef, GridApi } from "ag-grid-community";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { type ActionItem, FeatureActionsMenu } from "@/components/shell/feature-actions-menu";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { FeatureToolbar } from "@/components/shell/feature-toolbar";
import { GenericDetail } from "@/components/shell/generic-detail";
import { GridFilterButton } from "@/components/shell/grid-filter-button";
import { GridRefreshButton } from "@/components/shell/grid-refresh-button";
import { StatusBadge } from "@/components/shell/status-badge";
import { type StatusChip, StatusChipRow } from "@/components/shell/status-chip-row";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth/current";
import { formatDate } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  initials: string;
  lastSeenAt: string | null;
}

export function StaffGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [selectedId, setSelectedId] = useIdParam();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set());

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.users
      .filter(
        (u) => u.tenantId === tenantId && (u.role === "yard_manager" || u.role === "yard_staff"),
      )
      .map(
        (u): Row => ({
          id: u.id,
          fullName: `${u.firstName} ${u.lastName}`,
          email: u.email,
          phone: u.phone,
          role: u.role.replace("_", " "),
          status: u.status,
          initials: u.avatarInitials,
          lastSeenAt: u.lastSeenAt,
        }),
      );
  }, [dataset, tenantId]);

  const counts = useMemo(
    () => ({
      active: rows.filter((r) => r.status === "active").length,
      invited: rows.filter((r) => r.status === "invited").length,
      suspended: rows.filter((r) => r.status === "suspended").length,
      yard_manager: rows.filter((r) => r.role === "yard manager").length,
      yard_staff: rows.filter((r) => r.role === "yard staff").length,
    }),
    [rows],
  );

  const chips: StatusChip[] = [
    { slug: "active", label: "Active", count: counts.active },
    { slug: "invited", label: "Invited", count: counts.invited },
    { slug: "suspended", label: "Suspended", count: counts.suspended },
    { slug: "yard_manager", label: "Yard managers", count: counts.yard_manager },
    { slug: "yard_staff", label: "Yard staff", count: counts.yard_staff },
  ];

  const filtered = useMemo(() => {
    if (active.size === 0) return rows;
    return rows.filter((r) => {
      if (active.has("active") && r.status === "active") return true;
      if (active.has("invited") && r.status === "invited") return true;
      if (active.has("suspended") && r.status === "suspended") return true;
      if (active.has("yard_manager") && r.role === "yard manager") return true;
      if (active.has("yard_staff") && r.role === "yard staff") return true;
      return false;
    });
  }, [rows, active]);

  const toggleChip = (slug: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      {
        colId: "avatar",
        headerName: "",
        width: 56,
        sortable: false,
        filter: false,
        cellRenderer: (p: { data?: Row }) =>
          p.data ? (
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/15 text-primary text-xs">
                {p.data.initials}
              </AvatarFallback>
            </Avatar>
          ) : null,
      },
      { field: "fullName", headerName: "Name", width: 200 },
      { field: "email", headerName: "Email", width: 240 },
      { field: "role", headerName: "Role", width: 160 },
      { field: "phone", headerName: "Phone", width: 160 },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "active"} />,
      },
      {
        field: "lastSeenAt",
        headerName: "Last seen",
        width: 140,
        valueFormatter: (p) => formatDate(p.value as string | null),
      },
    ],
    [],
  );

  const sel = dataset.users.find((u) => u.id === selectedId);
  const certs = sel ? dataset.certs.filter((c) => c.staffUserId === sel.id) : [];
  const [gridApi, setGridApi] = useState<GridApi<Row> | null>(null);

  const actions: ActionItem[] = [
    {
      label: "Add user",
      Icon: Plus,
      onClick: () => toast("Add user — coming soon"),
      testId: "staff-grid-cta",
    },
    {
      label: "Export CSV",
      onClick: () => {
        gridApi?.exportDataAsCsv({ fileName: "staff.csv" });
        toast.success("CSV exported");
      },
      testId: "staff-grid-export",
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search staff, roles, emails…"
        >
          <GridRefreshButton api={gridApi} />
          <GridFilterButton api={gridApi} />
          <FeatureActionsMenu items={actions} />
        </FeatureToolbar>
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="staff-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="staff-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          defaultSortField="fullName"
          onRowClick={(r) => setSelectedId(r.id)}
          quickFilterText={search}
          onApiReady={setGridApi}
        />
      </div>

      <DetailSheet
        open={!!sel}
        onClose={() => setSelectedId(null)}
        title={sel ? `${sel.firstName} ${sel.lastName}` : "Staff"}
        subtitle={sel?.role.replace("_", " ")}
        testId="staff-sheet"
      >
        {sel && (
          <GenericDetail
            sections={[
              {
                fields: [
                  { label: "Email", value: sel.email },
                  { label: "Phone", value: sel.phone },
                  { label: "Role", value: sel.role.replace("_", " ") },
                  { label: "Status", value: <StatusBadge status={sel.status} /> },
                  { label: "MFA", value: sel.mfaEnabled ? "Enabled" : "Disabled" },
                  { label: "Last seen", value: formatDate(sel.lastSeenAt) },
                ],
              },
              {
                title: `Certificates (${certs.length})`,
                fields: certs.map((c) => ({
                  label: `${c.name} (issued ${formatDate(c.issuedDate)})`,
                  value: `Expires ${formatDate(c.expiryDate)}`,
                })),
              },
            ]}
          />
        )}
      </DetailSheet>
    </div>
  );
}
