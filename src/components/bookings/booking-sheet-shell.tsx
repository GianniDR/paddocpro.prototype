"use client";

import { BookingDetail } from "@/components/bookings/booking-detail";
import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { formatDateTime } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

export function BookingSheetShell() {
  const dataset = useDataset();
  const [selectedId, setSelectedId] = useIdParam();
  const sel = dataset.bookings.find((b) => b.id === selectedId);
  const r = sel ? dataset.resources.find((x) => x.id === sel.resourceId) : null;

  return (
    <DetailSheet
      open={!!sel}
      onClose={() => setSelectedId(null)}
      title={sel ? `${sel.type.replace("_", " ")} — ${formatDateTime(sel.startAt)}` : ""}
      subtitle={r?.name}
      testId="booking-sheet"
    >
      {sel && <BookingDetail bookingId={sel.id} />}
    </DetailSheet>
  );
}
