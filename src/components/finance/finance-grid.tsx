"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { FeatureGrid } from "@/components/shell/feature-grid";
import { StatusBadge } from "@/components/shell/status-badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/current";
import { formatDate, formatGbp } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  invoiceNumber: string;
  client: string;
  issuedAt: string;
  dueAt: string;
  totalPence: number;
  paidPence: number;
  status: string;
}

export function FinanceGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.invoices
      .filter((i) => i.tenantId === tenantId)
      .map((i): Row => {
        const c = dataset.clients.find((x) => x.id === i.clientId);
        const u = dataset.users.find((u) => u.id === c?.userAccountId);
        return {
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          client: u ? `${u.firstName} ${u.lastName}` : "—",
          issuedAt: i.issuedAt,
          dueAt: i.dueAt,
          totalPence: i.totalPence,
          paidPence: i.paidAmountPence,
          status: i.status,
        };
      });
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      { field: "invoiceNumber", headerName: "Invoice #", width: 130, pinned: "left" },
      { field: "client", headerName: "Client", width: 200 },
      {
        field: "issuedAt",
        headerName: "Issued",
        width: 130,
        cellRenderer: (p: { value?: string }) => formatDate(p.value),
      },
      {
        field: "dueAt",
        headerName: "Due",
        width: 130,
        cellRenderer: (p: { value?: string }) => formatDate(p.value),
      },
      {
        field: "totalPence",
        headerName: "Total",
        width: 130,
        cellRenderer: (p: { value?: number }) => formatGbp(p.value ?? 0),
      },
      {
        field: "paidPence",
        headerName: "Paid",
        width: 130,
        cellRenderer: (p: { value?: number }) => formatGbp(p.value ?? 0),
      },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "draft"} />,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <div className="flex justify-end">
        <Button size="sm" data-testid="finance-grid-cta">Run monthly invoicing</Button>
      </div>
      <FeatureGrid testId="finance-grid" rowData={rows} columnDefs={columnDefs} defaultSortField="issuedAt" defaultSortDirection="desc" />
    </div>
  );
}
