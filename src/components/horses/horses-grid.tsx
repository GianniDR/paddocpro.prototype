"use client";

import type { ColDef } from "ag-grid-community";
import { Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { FeatureGrid } from "@/components/shell/feature-grid";
import { StatusBadge } from "@/components/shell/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const CHIPS = [
  { slug: "all", label: "All" },
  { slug: "isolating", label: "In isolation" },
  { slug: "vet_care", label: "Vet care" },
  { slug: "vacc-overdue", label: "Vacc overdue" },
  { slug: "passport-expiring", label: "Passport expiring" },
] as const;

export function HorsesGrid() {
  const dataset = useDataset();
  const session = useSession();
  const router = useRouter();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [search, setSearch] = useState("");
  const [chip, setChip] = useState<(typeof CHIPS)[number]["slug"]>("all");

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

  const filtered = useMemo(() => {
    const tenantNow = now().getTime();
    return rows.filter((r) => {
      if (chip === "isolating" && r.healthStatus !== "isolating") return false;
      if (chip === "vet_care" && r.healthStatus !== "vet_care") return false;
      if (chip === "vacc-overdue" && r.vaccStatus !== "overdue") return false;
      if (chip === "passport-expiring") {
        const exp = Date.parse(r.passportExpiry);
        if (!(exp - tenantNow < 60 * 86_400_000 && exp - tenantNow > -1 * 86_400_000)) return false;
      }
      return true;
    });
  }, [rows, chip]);

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

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      {
        field: "stableName",
        headerName: "Horse",
        width: 220,
        pinned: "left",
        cellRenderer: (p: { data?: Row }) => {
          if (!p.data) return null;
          return (
            <div className="flex items-center gap-2 py-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium leading-tight">{p.data.stableName}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  {p.data.registeredName}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        field: "healthStatus",
        headerName: "Health",
        width: 130,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "healthy"} />,
      },
      {
        field: "ownerName",
        headerName: "Owner",
        width: 180,
      },
      {
        field: "stableLabel",
        headerName: "Stable",
        width: 110,
      },
      {
        field: "liveryName",
        headerName: "Livery",
        width: 200,
      },
      {
        field: "vaccStatus",
        headerName: "Vacc status",
        width: 140,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "current"} />,
      },
      {
        field: "breed",
        headerName: "Breed",
        width: 160,
      },
      {
        field: "sex",
        headerName: "Sex",
        width: 100,
        cellRenderer: (p: { value?: string }) => (p.value ? p.value.charAt(0).toUpperCase() + p.value.slice(1) : ""),
      },
      {
        field: "heightHands",
        headerName: "Height",
        width: 100,
        cellRenderer: (p: { value?: number }) => (p.value ? formatHands(p.value) : ""),
      },
      {
        field: "passportExpiry",
        headerName: "Passport exp.",
        width: 140,
        cellRenderer: (p: { value?: string }) => formatDate(p.value),
      },
    ],
    [],
  );

  const handleRowClick = (row: Row) => router.push(`/horses/${row.id}`);

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search horses, owners, stables…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 text-sm bg-card"
            data-testid="horses-grid-search"
          />
        </div>
        <Button
          size="sm"
          data-testid="horses-grid-cta"
          onClick={() => router.push("/horses/new")}
        >
          + Add horse
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="horses-grid-chip-row">
        {CHIPS.map((c) => (
          <button
            key={c.slug}
            type="button"
            data-testid={`chip-horses-${c.slug}`}
            onClick={() => setChip(c.slug)}
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium transition " +
              (chip === c.slug
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-accent/40 border-border text-foreground")
            }
          >
            {c.label}
            <Badge
              variant="secondary"
              className={
                "h-4 px-1.5 text-[10px] " +
                (chip === c.slug ? "bg-primary-foreground/20 text-primary-foreground" : "")
              }
            >
              {counts[c.slug]}
            </Badge>
          </button>
        ))}
      </div>

      <FeatureGrid
        testId="horses-grid"
        rowData={filtered}
        columnDefs={columnDefs}
        onRowClick={handleRowClick}
        quickFilterText={search}
        defaultSortField="stableName"
      />
    </div>
  );
}
