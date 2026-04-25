"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

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
      { field: "notes", headerName: "Notes", width: 200 },
    ],
    [],
  );

  const sel = dataset.tasks.find((t) => t.id === selectedId);
  const horse = sel?.horseId ? dataset.horses.find((h) => h.id === sel.horseId) : null;

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <FeatureGrid
        testId="tasks-grid"
        rowData={rows}
        columnDefs={columnDefs}
        defaultSortField="dueAt"
        onRowClick={(row) => setSelectedId(row.id)}
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
