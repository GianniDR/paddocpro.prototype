"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.users
      .filter((u) => u.tenantId === tenantId && (u.role === "yard_manager" || u.role === "yard_staff"))
      .map((u): Row => ({
        id: u.id,
        fullName: `${u.firstName} ${u.lastName}`,
        email: u.email,
        phone: u.phone,
        role: u.role.replace("_", " "),
        status: u.status,
        initials: u.avatarInitials,
        lastSeenAt: u.lastSeenAt,
      }));
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      {
        field: "fullName",
        headerName: "Staff",
        width: 240,
        pinned: "left",
        cellRenderer: (p: { data?: Row }) => {
          if (!p.data) return null;
          return (
            <div className="flex items-center gap-2 py-1">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/15 text-primary text-xs">
                  {p.data.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium leading-tight">{p.data.fullName}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">{p.data.email}</span>
              </div>
            </div>
          );
        },
      },
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
        cellRenderer: (p: { value?: string | null }) => formatDate(p.value),
      },
    ],
    [],
  );

  const sel = dataset.users.find((u) => u.id === selectedId);
  const certs = sel ? dataset.certs.filter((c) => c.staffUserId === sel.id) : [];

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <div className="flex justify-end">
        <Button size="sm" data-testid="staff-grid-cta">+ Invite staff</Button>
      </div>
      <FeatureGrid
        testId="staff-grid"
        rowData={rows}
        columnDefs={columnDefs}
        defaultSortField="fullName"
        onRowClick={(r) => setSelectedId(r.id)}
      />
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
