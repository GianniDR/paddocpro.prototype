"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo, useState } from "react";

import { RecordPaymentDialog } from "@/components/finance/record-payment-dialog";
import { RunMonthlyInvoicingDialog } from "@/components/finance/run-monthly-invoicing-dialog";
import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { FeatureToolbar } from "@/components/shell/feature-toolbar";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
import { type StatusChip, StatusChipRow } from "@/components/shell/status-chip-row";
import { useSession } from "@/lib/auth/current";
import { formatDate, formatGbp } from "@/lib/format";
import { now } from "@/lib/mock/clock";
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
  outstandingPence: number;
  status: string;
}

export function FinanceGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [selectedId, setSelectedId] = useIdParam();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set(["all"]));

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
          outstandingPence: i.totalPence - i.paidAmountPence,
          status: i.status,
        };
      });
  }, [dataset, tenantId]);

  const counts = useMemo(() => {
    const tenantNow = now().getTime();
    return {
      all: rows.length,
      draft: rows.filter((r) => r.status === "draft").length,
      authorised: rows.filter((r) => r.status === "authorised").length,
      overdue: rows.filter(
        (r) =>
          r.status === "authorised" &&
          r.outstandingPence > 0 &&
          Date.parse(r.dueAt) < tenantNow,
      ).length,
      paid: rows.filter((r) => r.status === "paid").length,
    };
  }, [rows]);

  const chips: StatusChip[] = [
    { slug: "all", label: "All", count: counts.all },
    { slug: "overdue", label: "Overdue", count: counts.overdue },
    { slug: "draft", label: "Draft", count: counts.draft },
    { slug: "authorised", label: "Authorised", count: counts.authorised },
    { slug: "paid", label: "Paid", count: counts.paid },
  ];

  const filtered = useMemo(() => {
    if (active.has("all")) return rows;
    const tenantNow = now().getTime();
    return rows.filter((r) => {
      if (
        active.has("overdue") &&
        r.status === "authorised" &&
        r.outstandingPence > 0 &&
        Date.parse(r.dueAt) < tenantNow
      ) {
        return true;
      }
      if (active.has(r.status)) return true;
      return false;
    });
  }, [rows, active]);

  const toggleChip = (slug: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (slug === "all") return new Set(["all"]);
      next.delete("all");
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      if (next.size === 0) next.add("all");
      return next;
    });
  };

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      { field: "invoiceNumber", headerName: "Invoice #", width: 130 },
      { field: "client", headerName: "Client", width: 200 },
      {
        field: "issuedAt",
        headerName: "Issued",
        width: 130,
        valueFormatter: (p) => formatDate(p.value as string),
      },
      {
        field: "dueAt",
        headerName: "Due",
        width: 130,
        valueFormatter: (p) => formatDate(p.value as string),
      },
      {
        field: "totalPence",
        headerName: "Total",
        width: 130,
        valueFormatter: (p) => formatGbp((p.value as number) ?? 0),
      },
      {
        field: "paidPence",
        headerName: "Paid",
        width: 130,
        valueFormatter: (p) => formatGbp((p.value as number) ?? 0),
      },
      {
        field: "outstandingPence",
        headerName: "Outstanding",
        width: 140,
        valueFormatter: (p) => formatGbp((p.value as number) ?? 0),
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
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search invoices, clients…"
        >
          <RunMonthlyInvoicingDialog />
        </FeatureToolbar>
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="finance-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="finance-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          quickFilterText={search}
          defaultSortField="issuedAt"
          defaultSortDirection="desc"
          onRowClick={(row) => setSelectedId(row.id)}
        />
      </div>

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
                  {
                    label: "Outstanding",
                    value: formatGbp(sel.totalPence - sel.paidAmountPence),
                  },
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
                ? [
                    {
                      label: `Open ${clientUser?.firstName} ${clientUser?.lastName}`,
                      href: `/clients?id=${client.id}`,
                      testId: `drill-client-${client.id}`,
                    },
                  ]
                : []
            }
          />
        )}
      </DetailSheet>
    </div>
  );
}
