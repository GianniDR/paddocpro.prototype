"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { FeatureGrid } from "@/components/shell/feature-grid";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  at: string;
  by: string;
  action: string;
  details: string;
}

export function AuditLogGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    // Synthesize an audit log from incidents + dataset
    const out: Row[] = [];
    dataset.incidents
      .filter((i) => i.tenantId === tenantId)
      .forEach((i) => {
        i.auditTrail.forEach((a, idx) => {
          const u = dataset.users.find((u) => u.id === a.byUserId);
          out.push({
            id: `${i.id}-${idx}`,
            at: a.at,
            by: u ? `${u.firstName} ${u.lastName}` : a.byUserId.slice(0, 16),
            action: a.action,
            details:
              a.after && typeof a.after === "object" && "workflowState" in a.after
                ? `Incident ${i.id.slice(0, 12)} → ${String(a.after.workflowState)}`
                : `Incident ${i.id.slice(0, 12)}`,
          });
        });
      });
    // Recent invoices as audit-ish entries
    dataset.invoices
      .filter((i) => i.tenantId === tenantId)
      .slice(0, 30)
      .forEach((i) => {
        out.push({
          id: `${i.id}-create`,
          at: i.createdAt,
          by: "system",
          action: "invoice.create",
          details: `${i.invoiceNumber} · ${i.lines.length} line${i.lines.length === 1 ? "" : "s"}`,
        });
      });
    // Recent horse creations
    dataset.horses
      .filter((h) => h.tenantId === tenantId)
      .slice(0, 20)
      .forEach((h) => {
        out.push({
          id: `${h.id}-create`,
          at: h.createdAt,
          by: "system",
          action: "horse.create",
          details: `${h.stableName} (${h.registeredName.slice(0, 32)})`,
        });
      });

    return out.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      {
        field: "at",
        headerName: "When",
        width: 200,
        pinned: "left",
        cellRenderer: (p: { value?: string }) => formatDateTime(p.value),
      },
      { field: "by", headerName: "Actor", width: 200 },
      { field: "action", headerName: "Action", width: 220 },
      { field: "details", headerName: "Details", width: 360 },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1" data-testid="audit-log">
      <FeatureGrid testId="audit-log-grid" rowData={rows} columnDefs={columnDefs} defaultSortField="at" defaultSortDirection="desc" />
    </div>
  );
}
