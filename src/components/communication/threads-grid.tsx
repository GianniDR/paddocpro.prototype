"use client";

import type { ColDef, GridApi } from "ag-grid-community";
import { Megaphone } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { BroadcastDialog } from "@/components/communication/broadcast-dialog";
import { type ActionItem, FeatureActionsMenu } from "@/components/shell/feature-actions-menu";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { FeatureToolbar } from "@/components/shell/feature-toolbar";
import { GridFilterButton } from "@/components/shell/grid-filter-button";
import { GridRefreshButton } from "@/components/shell/grid-refresh-button";
import { type StatusChip, StatusChipRow } from "@/components/shell/status-chip-row";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  subject: string;
  kind: string;
  participants: number;
  lastActivity: string;
  unread: number;
}

export function ThreadsGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set());

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.threads
      .filter((t) => t.tenantId === tenantId)
      .map((t): Row => {
        const unreadCount = dataset.messages.filter(
          (m) =>
            m.threadId === t.id &&
            m.authorId !== session?.userId &&
            !m.readBy.some((r) => r.userId === session?.userId),
        ).length;
        return {
          id: t.id,
          subject: t.subject ?? "(no subject)",
          kind: t.kind,
          participants: t.participantUserIds.length,
          lastActivity: t.updatedAt,
          unread: unreadCount,
        };
      });
  }, [dataset, tenantId, session]);

  const counts = useMemo(
    () => ({
      direct: rows.filter((r) => r.kind === "direct").length,
      group_clients: rows.filter((r) => r.kind === "group_clients").length,
      yard_broadcast: rows.filter((r) => r.kind === "yard_broadcast").length,
      notice_board: rows.filter((r) => r.kind === "notice_board").length,
      unread: rows.filter((r) => r.unread > 0).length,
    }),
    [rows],
  );

  const chips: StatusChip[] = [
    { slug: "unread", label: "Unread", count: counts.unread },
    { slug: "direct", label: "Direct", count: counts.direct },
    { slug: "group_clients", label: "Groups", count: counts.group_clients },
    { slug: "yard_broadcast", label: "Broadcasts", count: counts.yard_broadcast },
    { slug: "notice_board", label: "Notice board", count: counts.notice_board },
  ];

  const filtered = useMemo(() => {
    if (active.size === 0) return rows;
    return rows.filter((r) => {
      if (active.has("unread") && r.unread > 0) return true;
      if (active.has(r.kind)) return true;
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
      { field: "subject", headerName: "Subject", width: 320 },
      {
        field: "kind",
        headerName: "Kind",
        width: 160,
        valueFormatter: (p) => (p.value ? String(p.value).replace("_", " ") : ""),
      },
      { field: "participants", headerName: "Participants", width: 130 },
      {
        field: "lastActivity",
        headerName: "Last activity",
        width: 200,
        valueFormatter: (p) => formatDateTime(p.value as string),
      },
      { field: "unread", headerName: "Unread", width: 110 },
    ],
    [],
  );

  const [gridApi, setGridApi] = useState<GridApi<Row> | null>(null);
  const [bcastOpen, setBcastOpen] = useState(false);

  const actions: ActionItem[] = [
    {
      label: "New broadcast",
      Icon: Megaphone,
      onClick: () => setBcastOpen(true),
      testId: "comms-broadcast-trigger",
    },
    {
      label: "Export CSV",
      onClick: () => {
        gridApi?.exportDataAsCsv({ fileName: "threads.csv" });
        toast.success("CSV exported");
      },
      testId: "threads-grid-export",
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search threads, subjects…"
        >
          <GridRefreshButton api={gridApi} />
          <GridFilterButton api={gridApi} />
          <FeatureActionsMenu items={actions} />
        </FeatureToolbar>
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="threads-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="threads-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          quickFilterText={search}
          defaultSortField="lastActivity"
          defaultSortDirection="desc"
          onApiReady={setGridApi}
        />
      </div>

      <BroadcastDialog open={bcastOpen} onOpenChange={setBcastOpen} />
    </div>
  );
}
