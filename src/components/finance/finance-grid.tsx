"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { RecordPaymentDialog } from "@/components/finance/record-payment-dialog";
import { RunMonthlyInvoicingDialog } from "@/components/finance/run-monthly-invoicing-dialog";
import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
import { useSession } from "@/lib/auth/current";
import { formatDate, formatGbp } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  invoiceNumber: string;
  clientId: string;
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
  const [selectedId, setSelectedId] = useIdParam();

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
          clientId: i.clientId,
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

  const sel = dataset.invoices.find((i) => i.id === selectedId);
  const client = sel ? dataset.clients.find((c) => c.id === sel.clientId) : null;
  const clientUser = client ? dataset.users.find((u) => u.id === client.userAccountId) : null;
  const payments = sel ? dataset.payments.filter((p) => p.invoiceId === sel.id) : [];

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <div className="flex justify-end">
        <RunMonthlyInvoicingDialog />
      </div>
      <FeatureGrid
        testId="finance-grid"
        rowData={rows}
        columnDefs={columnDefs}
        defaultSortField="issuedAt"
        defaultSortDirection="desc"
        onRowClick={(row) => setSelectedId(row.id)}
      />
      <DetailSheet
        open={!!sel}
        onClose={() => setSelectedId(null)}
        title={sel ? `Invoice ${sel.invoiceNumber}` : "Invoice"}
        subtitle={clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : ""}
        testId="invoice-sheet"
        toolbar={sel ? <RecordPaymentDialog invoice={sel} /> : null}
      >
        {sel && (
          <GenericDetail
            sections={[
              {
                fields: [
                  { label: "Status", value: <StatusBadge status={sel.status} /> },
                  { label: "Invoice number", value: sel.invoiceNumber },
                  { label: "Issued", value: formatDate(sel.issuedAt) },
                  { label: "Due", value: formatDate(sel.dueAt) },
                  { label: "Subtotal", value: formatGbp(sel.subtotalPence) },
                  { label: "VAT (20%)", value: formatGbp(sel.vatPence) },
                  { label: "Total", value: formatGbp(sel.totalPence) },
                  { label: "Paid", value: formatGbp(sel.paidAmountPence) },
                  { label: "Outstanding", value: formatGbp(sel.totalPence - sel.paidAmountPence) },
                ],
              },
              {
                title: "Lines",
                fields: sel.lines.map((l) => ({
                  label: `${l.description} × ${l.quantity}`,
                  value: formatGbp(l.totalPence),
                })),
              },
              {
                title: `Payments (${payments.length})`,
                fields: payments.map((p) => ({
                  label: `${p.method.replace("_", " ")} on ${formatDate(p.paidAt)}`,
                  value: formatGbp(p.amountPence),
                })),
              },
            ]}
            drillLinks={
              client
                ? [{ label: `Open ${clientUser?.firstName} ${clientUser?.lastName}`, href: `/clients?id=${client.id}`, testId: `drill-client-${client.id}` }]
                : []
            }
          />
        )}
      </DetailSheet>
    </div>
  );
}
