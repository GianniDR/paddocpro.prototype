"use client";

import type { ColDef } from "ag-grid-community";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { ClientDetail } from "@/components/clients/client-detail";
import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { FeatureToolbar } from "@/components/shell/feature-toolbar";
import { StatusBadge } from "@/components/shell/status-badge";
import { type StatusChip, StatusChipRow } from "@/components/shell/status-chip-row";
import { Button } from "@/components/ui/button";
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
  city: string;
}

export function ClientsGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set(["all"]));
  const [selectedId, setSelectedId] = useIdParam();

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    const tenantNow = now().getTime();
    return dataset.clients
      .filter((c) => c.tenantId === tenantId)
      .map((c): Row => {
        const u = dataset.users.find((u) => u.id === c.userAccountId);
        const horses = dataset.horses.filter((h) => h.primaryOwnerId === c.id && !h.archivedAt);
        const unpaidInvs = dataset.invoices.filter(
          (i) => i.clientId === c.id && i.status === "authorised",
        );
        const outstanding = unpaidInvs.reduce(
          (s, i) => s + (i.totalPence - i.paidAmountPence),
          0,
        );
        const oldest = unpaidInvs.length
          ? Math.max(
              0,
              Math.floor(
                (tenantNow - Math.min(...unpaidInvs.map((i) => Date.parse(i.dueAt)))) /
                  86_400_000,
              ),
            )
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
          city: c.city,
        };
      });
  }, [dataset, tenantId]);

  const counts = useMemo(() => {
    const tenantNow = now().getTime();
    return {
      all: rows.length,
      outstanding: rows.filter((r) => r.outstandingPence > 0).length,
      overdue: rows.filter((r) => r.oldestOverdueDays > 30).length,
      portal: rows.filter((r) => r.portalAccessStatus === "active").length,
      "insurance-expiring": rows.filter((r) => {
        if (!r.insuranceExpiry) return false;
        const exp = Date.parse(r.insuranceExpiry);
        return exp - tenantNow < 60 * 86_400_000 && exp - tenantNow > -1 * 86_400_000;
      }).length,
    };
  }, [rows]);

  const chips: StatusChip[] = [
    { slug: "all", label: "All", count: counts.all },
    { slug: "outstanding", label: "Outstanding", count: counts.outstanding },
    { slug: "overdue", label: "30+ overdue", count: counts.overdue },
    { slug: "portal", label: "Portal active", count: counts.portal },
    { slug: "insurance-expiring", label: "Insurance expiring", count: counts["insurance-expiring"] },
  ];

  const filtered = useMemo(() => {
    if (active.has("all")) return rows;
    const tenantNow = now().getTime();
    return rows.filter((r) => {
      if (active.has("outstanding") && r.outstandingPence > 0) return true;
      if (active.has("overdue") && r.oldestOverdueDays > 30) return true;
      if (active.has("portal") && r.portalAccessStatus === "active") return true;
      if (active.has("insurance-expiring") && r.insuranceExpiry) {
        const exp = Date.parse(r.insuranceExpiry);
        if (exp - tenantNow < 60 * 86_400_000 && exp - tenantNow > -1 * 86_400_000) return true;
      }
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
      { field: "fullName", headerName: "Client", width: 200 },
      { field: "email", headerName: "Email", width: 220 },
      { field: "city", headerName: "City", width: 140 },
      { field: "horseCount", headerName: "Horses", width: 100 },
      {
        field: "outstandingPence",
        headerName: "Outstanding",
        width: 130,
        valueFormatter: (p) => formatGbp((p.value as number) ?? 0),
        cellClass: (p) =>
          ((p.value as number) ?? 0) > 0 ? "text-destructive font-medium" : "",
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
        width: 130,
        valueFormatter: (p) => formatDate(p.value as string | null),
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
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search clients, emails, cities…"
        >
          <Button size="sm" data-testid="clients-grid-cta">
            <Plus size={14} /> Add client
          </Button>
        </FeatureToolbar>
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="clients-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="clients-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          quickFilterText={search}
          defaultSortField="fullName"
          onRowClick={(row) => setSelectedId(row.id)}
        />
      </div>

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
