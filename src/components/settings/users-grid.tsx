"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { FeatureGrid } from "@/components/shell/feature-grid";
import { StatusBadge } from "@/components/shell/status-badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/current";
import { formatDate } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  mfa: string;
  lastSeen: string | null;
}

export function SettingsUsersGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.users
      .filter((u) => u.tenantId === tenantId)
      .map((u): Row => ({
        id: u.id,
        fullName: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.role.replace("_", " "),
        status: u.status,
        mfa: u.mfaEnabled ? "On" : "Off",
        lastSeen: u.lastSeenAt,
      }));
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      { field: "fullName", headerName: "Name", width: 220, pinned: "left" },
      { field: "email", headerName: "Email", width: 280 },
      { field: "role", headerName: "Role", width: 160 },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "active"} />,
      },
      { field: "mfa", headerName: "MFA", width: 90 },
      {
        field: "lastSeen",
        headerName: "Last seen",
        width: 140,
        cellRenderer: (p: { value?: string | null }) => formatDate(p.value),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1" data-testid="settings-users">
      <div className="flex justify-end">
        <Button size="sm" data-testid="settings-users-invite">+ Invite user</Button>
      </div>
      <FeatureGrid testId="settings-users-grid" rowData={rows} columnDefs={columnDefs} defaultSortField="fullName" />
    </div>
  );
}
