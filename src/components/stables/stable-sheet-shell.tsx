"use client";

import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
import { formatDate } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

export function StableSheetShell() {
  const dataset = useDataset();
  const [selectedId, setSelectedId] = useIdParam();
  const sel = dataset.stables.find((s) => s.id === selectedId);
  const occHorse = sel?.currentHorseId
    ? dataset.horses.find((h) => h.id === sel.currentHorseId)
    : null;

  return (
    <DetailSheet
      open={!!sel}
      onClose={() => setSelectedId(null)}
      title={sel ? `Stable ${sel.block} ${sel.number}` : "Stable"}
      subtitle={sel?.designation}
      testId="stable-sheet"
    >
      {sel && (
        <GenericDetail
          sections={[
            {
              fields: [
                { label: "Status", value: <StatusBadge status={sel.status} /> },
                { label: "Block", value: sel.block },
                { label: "Number", value: sel.number },
                { label: "Dimensions", value: sel.dimensions },
                { label: "Default bedding", value: sel.defaultBeddingType },
                { label: "Designation", value: sel.designation },
                { label: "Currently housing", value: occHorse?.stableName ?? "—" },
                ...(sel.outOfServiceReason
                  ? [
                      { label: "Out of service reason", value: sel.outOfServiceReason },
                      { label: "Expected return", value: formatDate(sel.outOfServiceUntil) },
                    ]
                  : []),
              ],
            },
          ]}
          drillLinks={
            occHorse
              ? [{ label: `Open ${occHorse.stableName}`, href: `/horses/${occHorse.id}`, testId: `drill-horse-${occHorse.id}` }]
              : []
          }
        />
      )}
    </DetailSheet>
  );
}
