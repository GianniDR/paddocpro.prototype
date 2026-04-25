"use client";

import type { ColDef } from "ag-grid-community";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ClientDetail } from "@/components/clients/client-detail";
import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { StatusBadge } from "@/components/shell/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth/current";
import { formatDate, formatGbp } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  fullName: string;
  email: string;
  horseCount: number;
  outstandingPence: number;
  oldestOverdueDays: number;
  insuranceExpiry: string | null;
  ridingAbility: string;
  portalAccessStatus: string;
  paymentMethod: string;
}

export function ClientsGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useIdParam();

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    const tenantNow = now().getTime();
    return dataset.clients
      .filter((c) => c.tenantId === tenantId)
      .map((c): Row => {
        const u = dataset.users.find((u) => u.id === c.userAccountId);
        const horses = dataset.horses.filter((h) => h.primaryOwnerId === c.id);
        const unpaidInvs = dataset.invoices.filter((i) => i.clientId === c.id && i.status === "authorised");
        const outstanding = unpaidInvs.reduce((s, i) => s + (i.totalPence - i.paidAmountPence), 0);
        const oldest = unpaidInvs.length
          ? Math.max(0, Math.floor((tenantNow - Math.min(...unpaidInvs.map((i) => Date.parse(i.dueAt)))) / 86_400_000))
          : 0;
        return {
          id: c.id,
          fullName: u ? `${u.firstName} ${u.lastName}` : "—",
          email: u?.email ?? "—",
          horseCount: horses.length,
          outstandingPence: outstanding,
          oldestOverdueDays: oldest,
          insuranceExpiry: c.insuranceExpiry,
          ridingAbility: c.ridingAbility,
          portalAccessStatus: c.portalAccessStatus,
          paymentMethod: c.paymentMethod,
        };
      });
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      {
        field: "fullName",
        headerName: "Client",
        width: 220,
        pinned: "left",
        cellRenderer: (p: { data?: Row }) => {
          if (!p.data) return null;
          return (
            <div className="flex flex-col py-1">
              <span className="font-medium leading-tight">{p.data.fullName}</span>
              <span className="text-[11px] text-muted-foreground leading-tight truncate">{p.data.email}</span>
            </div>
          );
        },
      },
      { field: "horseCount", headerName: "Horses", width: 90 },
      {
        field: "outstandingPence",
        headerName: "Outstanding",
        width: 130,
        cellRenderer: (p: { value?: number }) => (
          <span className={p.value && p.value > 0 ? "text-destructive font-medium" : ""}>
            {formatGbp(p.value ?? 0)}
          </span>
        ),
      },
      {
        field: "oldestOverdueDays",
        headerName: "Oldest overdue",
        width: 140,
        cellRenderer: (p: { value?: number }) => {
          const v = p.value ?? 0;
          if (v === 0) return <StatusBadge status="paid" />;
          if (v <= 30) return <StatusBadge status="due_30d" />;
          return <StatusBadge status="overdue" />;
        },
      },
      {
        field: "insuranceExpiry",
        headerName: "Insurance",
        width: 120,
        cellRenderer: (p: { value?: string | null }) => formatDate(p.value),
      },
      { field: "ridingAbility", headerName: "Ability", width: 130 },
      {
        field: "portalAccessStatus",
        headerName: "Portal",
        width: 110,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "active"} />,
      },
      { field: "paymentMethod", headerName: "Payment", width: 130 },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 text-sm bg-card"
            data-testid="clients-grid-search"
          />
        </div>
        <Button size="sm" data-testid="clients-grid-cta">+ Add client</Button>
      </div>
      <FeatureGrid
        testId="clients-grid"
        rowData={rows}
        columnDefs={columnDefs}
        quickFilterText={search}
        defaultSortField="fullName"
        onRowClick={(row) => setSelectedId(row.id)}
      />
      <DetailSheet
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={rows.find((r) => r.id === selectedId)?.fullName ?? "Client"}
        subtitle={rows.find((r) => r.id === selectedId)?.email}
        testId="client-sheet"
      >
        {selectedId && <ClientDetail clientId={selectedId} />}
      </DetailSheet>
    </div>
  );
}
