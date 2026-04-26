"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo, useState } from "react";

import { BookingSheetShell } from "@/components/bookings/booking-sheet-shell";
import { NewBookingDialog } from "@/components/bookings/new-booking-dialog";
import { useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { FeatureToolbar } from "@/components/shell/feature-toolbar";
import { StatusBadge } from "@/components/shell/status-badge";
import { type StatusChip, StatusChipRow } from "@/components/shell/status-chip-row";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  whenLabel: string;
  startAt: string;
  type: string;
  resource: string;
  horse: string;
  client: string;
  status: string;
  notes: string;
}

export function BookingsGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set());
  const [, setSelectedId] = useIdParam();

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.bookings
      .filter((b) => b.tenantId === tenantId)
      .map((b): Row => {
        const r = dataset.resources.find((x) => x.id === b.resourceId);
        const horse = dataset.horses.find((h) => h.id === b.horseId);
        const client = dataset.clients.find((c) => c.id === b.clientId);
        const clientUser = dataset.users.find((u) => u.id === client?.userAccountId);
        return {
          id: b.id,
          whenLabel: formatDateTime(b.startAt),
          startAt: b.startAt,
          type: b.type,
          resource: r?.name ?? "—",
          horse: horse?.stableName ?? "—",
          client: clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "—",
          status: b.status,
          notes: b.notes ?? "",
        };
      });
  }, [dataset, tenantId]);

  const counts = useMemo(() => {
    const today = (() => {
      const d = now();
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime();
    })();
    const tomorrow = today + 86_400_000;
    return {
      today: rows.filter((r) => {
        const s = Date.parse(r.startAt);
        return s >= today && s < tomorrow;
      }).length,
      tentative: rows.filter((r) => r.status === "tentative").length,
      confirmed: rows.filter((r) => r.status === "confirmed").length,
      cancelled: rows.filter((r) => r.status === "cancelled").length,
    };
  }, [rows]);

  const chips: StatusChip[] = [
    { slug: "today", label: "Today", count: counts.today },
    { slug: "tentative", label: "Tentative", count: counts.tentative },
    { slug: "confirmed", label: "Confirmed", count: counts.confirmed },
    { slug: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  const filtered = useMemo(() => {
    if (active.size === 0) return rows;
    const today = (() => {
      const d = now();
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime();
    })();
    const tomorrow = today + 86_400_000;
    return rows.filter((r) => {
      if (active.has("today")) {
        const s = Date.parse(r.startAt);
        if (s >= today && s < tomorrow) return true;
      }
      if (active.has("tentative") && r.status === "tentative") return true;
      if (active.has("confirmed") && r.status === "confirmed") return true;
      if (active.has("cancelled") && r.status === "cancelled") return true;
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
      { field: "whenLabel", headerName: "When", width: 200, sort: "asc" },
      {
        field: "type",
        headerName: "Type",
        width: 140,
        valueFormatter: (p) => (p.value ? String(p.value).replace("_", " ") : ""),
      },
      { field: "resource", headerName: "Resource", width: 200 },
      { field: "horse", headerName: "Horse", width: 160 },
      { field: "client", headerName: "Client", width: 180 },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "confirmed"} />,
      },
      { field: "notes", headerName: "Notes", width: 240 },
    ],
    [],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search bookings, horses, clients…"
        >
          <NewBookingDialog />
        </FeatureToolbar>
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="bookings-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="bookings-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          quickFilterText={search}
          defaultSortField="whenLabel"
          onRowClick={(row) => setSelectedId(row.id)}
        />
      </div>

      <BookingSheetShell />
    </div>
  );
}
