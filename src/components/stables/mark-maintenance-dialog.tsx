"use client";

import { Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { now } from "@/lib/mock/clock";
import { mutate, useDataset } from "@/lib/mock/store";

export function MarkMaintenanceDialog({ stableId }: { stableId: string }) {
  const dataset = useDataset();
  const stable = dataset.stables.find((s) => s.id === stableId);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [until, setUntil] = useState("2026-05-09");
  const [submitting, setSubmitting] = useState(false);

  if (!stable) return null;
  const isMaintenance = stable.status === "maintenance";

  async function apply() {
    setSubmitting(true);
    if (isMaintenance) {
      await mutate((d) => {
        const target = d.stables.find((s) => s.id === stableId);
        if (!target) return;
        target.status = "vacant";
        target.outOfServiceReason = null;
        target.outOfServiceUntil = null;
        target.updatedAt = now().toISOString();
      });
      toast.success(`${stable!.block} ${stable!.number} returned to service`);
    } else {
      if (stable!.status === "occupied") {
        toast.error("Reassign the occupant before taking the stable out of service.");
        setSubmitting(false);
        return;
      }
      await mutate((d) => {
        const target = d.stables.find((s) => s.id === stableId);
        if (!target) return;
        target.status = "maintenance";
        target.outOfServiceReason = reason.trim();
        target.outOfServiceUntil = new Date(until).toISOString();
        target.updatedAt = now().toISOString();
      });
      toast.success(`${stable!.block} ${stable!.number} marked for maintenance until ${until}`);
    }
    setSubmitting(false);
    setOpen(false);
    setReason("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" data-testid="stable-mark-maintenance-trigger">
            <Wrench className="h-3.5 w-3.5" /> {isMaintenance ? "End maintenance" : "Mark maintenance"}
          </Button>
        }
      />
      <DialogContent className="max-w-md" data-testid="dialog-mark-maintenance">
        <DialogHeader>
          <DialogTitle>
            {isMaintenance
              ? `Return ${stable.block} ${stable.number} to service`
              : `Take ${stable.block} ${stable.number} out of service`}
          </DialogTitle>
          <DialogDescription>
            {isMaintenance
              ? "Stable becomes vacant and assignable again."
              : "Records reason + expected return; stable hidden from new assignments."}
          </DialogDescription>
        </DialogHeader>
        {!isMaintenance && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Drainage repair to back wall"
                data-testid="dialog-mark-maintenance-reason"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Expected return</Label>
              <Input
                type="date"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
                data-testid="dialog-mark-maintenance-until"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="dialog-mark-maintenance-cancel">
            Cancel
          </Button>
          <Button
            onClick={apply}
            disabled={submitting || (!isMaintenance && reason.trim().length < 3)}
            data-testid="dialog-mark-maintenance-confirm"
          >
            {isMaintenance ? "End maintenance" : "Take out of service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
