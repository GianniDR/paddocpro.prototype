"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { FeatureGrid } from "@/components/shell/feature-grid";
import { StatusBadge } from "@/components/shell/status-badge";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  recipient: string;
  category: string;
  channel: string;
  subject: string;
  state: string;
  sentAt: string | null;
}

export function NotificationsGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.notifications
      .filter((n) => n.tenantId === tenantId)
      .map((n): Row => {
        const u = dataset.users.find((u) => u.id === n.recipientUserId);
        return {
          id: n.id,
          recipient: u ? `${u.firstName} ${u.lastName}` : "—",
          category: n.category,
          channel: n.channel,
          subject: n.subject,
          state: n.state,
          sentAt: n.sentAt,
        };
      });
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      {
        field: "sentAt",
        headerName: "Sent",
        width: 200,
        pinned: "left",
        cellRenderer: (p: { value?: string | null }) => formatDateTime(p.value),
      },
      { field: "recipient", headerName: "Recipient", width: 200 },
      {
        field: "category",
        headerName: "Category",
        width: 140,
        cellRenderer: (p: { value?: string }) => (p.value ? p.value.replace("_", " ") : ""),
      },
      { field: "channel", headerName: "Channel", width: 110 },
      { field: "subject", headerName: "Subject", width: 320 },
      {
        field: "state",
        headerName: "State",
        width: 120,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value === "sent" ? "completed" : p.value === "failed" ? "overdue" : p.value ?? "scheduled"} />,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1" data-testid="notifications-grid-shell">
      <FeatureGrid
        testId="notifications-grid"
        rowData={rows}
        columnDefs={columnDefs}
        defaultSortField="sentAt"
        defaultSortDirection="desc"
      />
    </div>
  );
}
