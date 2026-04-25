"use client";

import type { ColDef } from "ag-grid-community";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { FeatureToolbar } from "@/components/shell/feature-toolbar";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
import { type StatusChip, StatusChipRow } from "@/components/shell/status-chip-row";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { mutate, useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  dueAt: string;
  assigneeName: string;
  notes: string;
}

export function TasksGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [selectedId, setSelectedId] = useIdParam();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set(["all"]));

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.tasks
      .filter((t) => t.tenantId === tenantId)
      .map((t): Row => {
        const u = dataset.users.find((u) => u.id === t.assigneeId);
        return {
          id: t.id,
          title: t.title,
          type: t.type,
          priority: t.priority,
          status: t.status,
          dueAt: t.dueAt,
          assigneeName: u ? `${u.firstName} ${u.lastName}` : "—",
          notes: t.notes ?? "",
        };
      });
  }, [dataset, tenantId]);

  const counts = useMemo(() => {
    const tenantNow = now().getTime();
    const todayStart = (() => {
      const d = now();
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime();
    })();
    const todayEnd = todayStart + 86_400_000;
    return {
      all: rows.length,
      pending: rows.filter((r) => r.status === "pending").length,
      in_progress: rows.filter((r) => r.status === "in_progress").length,
      overdue: rows.filter((r) => r.status !== "completed" && Date.parse(r.dueAt) < tenantNow)
        .length,
      due_today: rows.filter(
        (r) =>
          r.status !== "completed" &&
          Date.parse(r.dueAt) >= todayStart &&
          Date.parse(r.dueAt) < todayEnd,
      ).length,
      completed: rows.filter((r) => r.status === "completed").length,
    };
  }, [rows]);

  const chips: StatusChip[] = [
    { slug: "all", label: "All", count: counts.all },
    { slug: "due_today", label: "Due today", count: counts.due_today },
    { slug: "overdue", label: "Overdue", count: counts.overdue },
    { slug: "pending", label: "Pending", count: counts.pending },
    { slug: "in_progress", label: "In progress", count: counts.in_progress },
    { slug: "completed", label: "Completed", count: counts.completed },
  ];

  const filtered = useMemo(() => {
    if (active.has("all")) return rows;
    const tenantNow = now().getTime();
    const todayStart = (() => {
      const d = now();
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime();
    })();
    const todayEnd = todayStart + 86_400_000;
    return rows.filter((r) => {
      if (active.has("pending") && r.status === "pending") return true;
      if (active.has("in_progress") && r.status === "in_progress") return true;
      if (active.has("completed") && r.status === "completed") return true;
      if (active.has("overdue") && r.status !== "completed" && Date.parse(r.dueAt) < tenantNow)
        return true;
      if (
        active.has("due_today") &&
        r.status !== "completed" &&
        Date.parse(r.dueAt) >= todayStart &&
        Date.parse(r.dueAt) < todayEnd
      )
        return true;
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

  async function completeOne(id: string) {
    setBusy(true);
    const userId = session?.userId ?? "";
    await mutate((d) => {
      const t = d.tasks.find((t) => t.id === id);
      if (!t || t.status === "completed") return;
      t.status = "completed";
      t.completedAt = now().toISOString();
      t.completedById = userId;
      t.updatedAt = now().toISOString();
    });
    setBusy(false);
    toast.success("Task completed");
  }

  async function bulkComplete() {
    if (selectedIds.length === 0) return;
    setBusy(true);
    const userId = session?.userId ?? "";
    await mutate((d) => {
      for (const id of selectedIds) {
        const t = d.tasks.find((t) => t.id === id);
        if (!t || t.status === "completed") continue;
        t.status = "completed";
        t.completedAt = now().toISOString();
        t.completedById = userId;
        t.updatedAt = now().toISOString();
      }
    });
    setBusy(false);
    toast.success(`${selectedIds.length} task${selectedIds.length === 1 ? "" : "s"} completed`);
    setSelectedIds([]);
  }

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      {
        field: "priority",
        headerName: "Priority",
        width: 110,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "medium"} />,
      },
      { field: "title", headerName: "Task", width: 260 },
      {
        field: "type",
        headerName: "Type",
        width: 130,
        valueFormatter: (p) => (p.value ? String(p.value).replace(/_/g, " ") : ""),
      },
      {
        field: "dueAt",
        headerName: "Due",
        width: 200,
        valueFormatter: (p) => formatDateTime(p.value as string),
      },
      { field: "assigneeName", headerName: "Assignee", width: 180 },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "pending"} />,
      },
      {
        colId: "__row-action",
        headerName: "",
        width: 110,
        sortable: false,
        filter: false,
        cellRenderer: (p: { data?: Row }) => {
          if (!p.data) return null;
          if (p.data.status === "completed")
            return <span className="text-xs text-emerald-600">✓ Done</span>;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void completeOne(p.data!.id);
              }}
              data-testid={`tasks-grid-complete-${p.data.id}`}
              className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 text-xs hover:bg-accent transition"
            >
              <Check className="h-3 w-3" /> Complete
            </button>
          );
        },
      },
      { field: "notes", headerName: "Notes", width: 200 },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const sel = dataset.tasks.find((t) => t.id === selectedId);
  const horse = sel?.horseId ? dataset.horses.find((h) => h.id === sel.horseId) : null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search tasks, assignees, notes…"
        />
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="tasks-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      {selectedIds.length > 0 && (
        <div
          className="sticky bottom-4 z-30 mx-auto inline-flex items-center gap-3 rounded-md border bg-card px-3 py-2 shadow-md self-center"
          data-testid="tasks-bulk-bar"
        >
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button
            size="sm"
            onClick={bulkComplete}
            disabled={busy}
            data-testid="tasks-bulk-complete"
          >
            <Check className="h-3.5 w-3.5" /> Mark complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedIds([])}
            data-testid="tasks-bulk-clear"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      )}

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="tasks-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          quickFilterText={search}
          defaultSortField="dueAt"
          onRowClick={(row) => setSelectedId(row.id)}
          onSelectionChanged={(rows) => setSelectedIds(rows.map((r) => r.id))}
        />
      </div>

      <DetailSheet
        open={!!sel}
        onClose={() => setSelectedId(null)}
        title={sel?.title ?? "Task"}
        subtitle={sel ? `${sel.type.replace("_", " ")} · ${sel.priority}` : ""}
        testId="task-sheet"
      >
        {sel && (
          <GenericDetail
            sections={[
              {
                fields: [
                  { label: "Title", value: sel.title },
                  { label: "Type", value: sel.type.replace("_", " ") },
                  { label: "Priority", value: <StatusBadge status={sel.priority} /> },
                  { label: "Status", value: <StatusBadge status={sel.status} /> },
                  { label: "Due", value: formatDateTime(sel.dueAt) },
                  { label: "Completed", value: formatDateTime(sel.completedAt) },
                  {
                    label: "Assignee",
                    value:
                      dataset.users.find((u) => u.id === sel.assigneeId)?.firstName +
                      " " +
                      (dataset.users.find((u) => u.id === sel.assigneeId)?.lastName ?? ""),
                  },
                  { label: "Notes", value: sel.notes ?? "—" },
                ],
              },
            ]}
            drillLinks={
              horse
                ? [
                    {
                      label: `Open ${horse.stableName}`,
                      href: `/horses/${horse.id}`,
                      testId: `drill-horse-${horse.id}`,
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
