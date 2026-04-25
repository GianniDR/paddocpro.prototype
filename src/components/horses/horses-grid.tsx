"use client";

import type { ColDef } from "ag-grid-community";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AddHorseModal } from "@/components/horses/add-horse-modal";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { FeatureToolbar } from "@/components/shell/feature-toolbar";
import { StatusBadge } from "@/components/shell/status-badge";
import { type StatusChip, StatusChipRow } from "@/components/shell/status-chip-row";
import { useSession } from "@/lib/auth/current";
import { formatDate, formatHands } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  stableName: string;
  registeredName: string;
  breed: string;
  sex: string;
  heightHands: number;
  ownerName: string;
  stableLabel: string;
  liveryName: string;
  healthStatus: string;
  vaccStatus: string;
  passportExpiry: string;
}

export function HorsesGrid() {
  const dataset = useDataset();
  const session = useSession();
  const router = useRouter();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set(["all"]));

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    const tenantNow = now().getTime();
    return dataset.horses
      .filter((h) => h.tenantId === tenantId && !h.archivedAt)
      .map((h): Row => {
        const owner = dataset.clients.find((c) => c.id === h.primaryOwnerId);
        const ownerUser = dataset.users.find((u) => u.id === owner?.userAccountId);
        const stable = dataset.stables.find((s) => s.id === h.currentStableId);
        const livery = dataset.liveryPackages.find((p) => p.id === h.liveryPackageId);
        const vacc = dataset.healthEvents
          .filter((e) => e.horseId === h.id && e.kind === "vaccination" && e.nextDueDate)
          .sort((a, b) => Date.parse(b.eventDate) - Date.parse(a.eventDate))[0];
        const vaccStatus =
          !vacc || !vacc.nextDueDate
            ? "scheduled"
            : Date.parse(vacc.nextDueDate) < tenantNow
              ? "overdue"
              : Date.parse(vacc.nextDueDate) - tenantNow < 30 * 86_400_000
                ? "due_30d"
                : "current";
        return {
          id: h.id,
          stableName: h.stableName,
          registeredName: h.registeredName,
          breed: h.breed,
          sex: h.sex,
          heightHands: h.heightHands,
          ownerName: ownerUser ? `${ownerUser.firstName} ${ownerUser.lastName}` : "—",
          stableLabel: stable ? `${stable.block.split(" ")[0]} ${stable.number}` : "—",
          liveryName: livery?.name ?? "—",
          healthStatus: h.healthStatus,
          vaccStatus,
          passportExpiry: h.passportExpiry,
        };
      });
  }, [dataset, tenantId]);

  const counts = useMemo(() => {
    const tenantNow = now().getTime();
    return {
      all: rows.length,
      isolating: rows.filter((r) => r.healthStatus === "isolating").length,
      vet_care: rows.filter((r) => r.healthStatus === "vet_care").length,
      "vacc-overdue": rows.filter((r) => r.vaccStatus === "overdue").length,
      "passport-expiring": rows.filter((r) => {
        const exp = Date.parse(r.passportExpiry);
        return exp - tenantNow < 60 * 86_400_000 && exp - tenantNow > -1 * 86_400_000;
      }).length,
    };
  }, [rows]);

  const chips: StatusChip[] = [
    { slug: "all", label: "All", count: counts.all },
    { slug: "isolating", label: "Isolating", count: counts.isolating },
    { slug: "vet_care", label: "Vet care", count: counts.vet_care },
    { slug: "overdue", label: "Vacc overdue", count: counts["vacc-overdue"] },
    { slug: "passport-expiring", label: "Passport expiring", count: counts["passport-expiring"] },
  ];

  const filtered = useMemo(() => {
    if (active.has("all")) return rows;
    const tenantNow = now().getTime();
    return rows.filter((r) => {
      if (active.has("isolating") && r.healthStatus === "isolating") return true;
      if (active.has("vet_care") && r.healthStatus === "vet_care") return true;
      if (active.has("overdue") && r.vaccStatus === "overdue") return true;
      if (active.has("passport-expiring")) {
        const exp = Date.parse(r.passportExpiry);
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
      { field: "stableName", headerName: "Stable name", width: 160 },
      { field: "registeredName", headerName: "Registered name", width: 200 },
      {
        field: "healthStatus",
        headerName: "Health",
        width: 140,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "healthy"} />,
      },
      { field: "ownerName", headerName: "Owner", width: 180 },
      { field: "stableLabel", headerName: "Stable", width: 110 },
      { field: "liveryName", headerName: "Livery", width: 200 },
      {
        field: "vaccStatus",
        headerName: "Vacc status",
        width: 140,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "current"} />,
      },
      { field: "breed", headerName: "Breed", width: 160 },
      {
        field: "sex",
        headerName: "Sex",
        width: 100,
        valueFormatter: (p) =>
          p.value ? String(p.value).charAt(0).toUpperCase() + String(p.value).slice(1) : "",
      },
      {
        field: "heightHands",
        headerName: "Height",
        width: 100,
        valueFormatter: (p) => (p.value ? formatHands(p.value as number) : ""),
      },
      {
        field: "passportExpiry",
        headerName: "Passport exp.",
        width: 140,
        valueFormatter: (p) => formatDate(p.value as string),
      },
    ],
    [],
  );

  const handleRowClick = (row: Row) => router.push(`/horses/${row.id}`);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search horses, owners, stables…"
        >
          <AddHorseModal />
        </FeatureToolbar>
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="horses-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="horses-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          onRowClick={handleRowClick}
          quickFilterText={search}
          defaultSortField="stableName"
        />
      </div>
    </div>
  );
}
