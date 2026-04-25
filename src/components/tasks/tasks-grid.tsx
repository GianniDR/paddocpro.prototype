"use client";

import type { ColDef } from "ag-grid-community";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
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
        pinned: "left",
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "medium"} />,
      },
      { field: "title", headerName: "Task", width: 260 },
      {
        field: "type",
        headerName: "Type",
        width: 130,
        cellRenderer: (p: { value?: string }) => (p.value ? p.value.replace("_", " ") : ""),
      },
      {
        field: "dueAt",
        headerName: "Due",
        width: 200,
        cellRenderer: (p: { value?: string }) => formatDateTime(p.value),
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
        width: 100,
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
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
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
      <FeatureGrid
        testId="tasks-grid"
        rowData={rows}
        columnDefs={columnDefs}
        defaultSortField="dueAt"
        onRowClick={(row) => setSelectedId(row.id)}
        onSelectionChanged={(rows) => setSelectedIds(rows.map((r) => r.id))}
      />
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
                ? [{ label: `Open ${horse.stableName}`, href: `/horses/${horse.id}`, testId: `drill-horse-${horse.id}` }]
                : []
            }
          />
        )}
      </DetailSheet>
    </div>
  );
}
