"use client";

import { Shield } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { now } from "@/lib/mock/clock";
import { newId } from "@/lib/mock/id-prefixes";
import { mutate, useDataset } from "@/lib/mock/store";
import type { HealthStatus } from "@/types";

interface MarkIsolatingDialogProps {
  horseId: string;
  horseName: string;
  /** Controlled open state. When provided, the trigger is not rendered. */
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
}

export function MarkIsolatingDialog({
  horseId,
  horseName,
  open: openProp,
  onOpenChange,
}: MarkIsolatingDialogProps) {
  const dataset = useDataset();
  const horse = dataset.horses.find((h) => h.id === horseId);
  const isIsolating = horse?.healthStatus === "isolating";

  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    if (openProp === undefined) setInternalOpen(v);
  };
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function apply() {
    if (!horse) return;
    setSubmitting(true);
    const tenantId = horse.tenantId;
    const targetStatus: HealthStatus = isIsolating ? "monitoring" : "isolating";

    await mutate((d) => {
      const target = d.horses.find((h) => h.id === horseId);
      if (!target) return;
      target.healthStatus = targetStatus;
      target.updatedAt = now().toISOString();

      if (targetStatus === "isolating") {
        // Dispatch an emergency notification to all yard staff
        const yardStaff = d.users.filter((u) => u.tenantId === tenantId && u.role !== "client_owner");
        for (const u of yardStaff) {
          d.notifications.unshift({
            id: newId("notification", `iso-${horseId}-${u.id}`),
            tenantId,
            createdAt: now().toISOString(),
            updatedAt: now().toISOString(),
            recipientUserId: u.id,
            category: "emergency",
            channel: "push",
            subject: `Horse in isolation: ${horseName}`,
            body: `${horseName} flagged isolating. Reason: ${reason || "—"}. Avoid contact unless authorised.`,
            relatedEntityType: "horse",
            relatedEntityId: horseId,
            state: "sent",
            sentAt: now().toISOString(),
            deliveredAt: now().toISOString(),
            readAt: null,
          });
        }
      }
    });

    setSubmitting(false);
    toast.success(
      targetStatus === "isolating"
        ? `${horseName} marked isolating — yard staff notified.`
        : `${horseName} returned to monitoring.`,
    );
    setOpen(false);
    setReason("");
  }

  if (!horse) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {openProp === undefined && (
        <DialogTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              data-testid="horse-profile-toolbar-mark-isolating"
            >
              <Shield className="h-3.5 w-3.5" /> {isIsolating ? "End isolation" : "Mark isolating"}
            </Button>
          }
        />
      )}
      <DialogContent className="max-w-md" data-testid="dialog-mark-isolating">
        <DialogHeader>
          <DialogTitle>
            {isIsolating ? `End isolation — ${horseName}` : `Mark ${horseName} as isolating`}
          </DialogTitle>
          <DialogDescription>
            {isIsolating
              ? "Returns the horse to monitoring status."
              : "Dispatches an emergency push notification to all yard staff and flags the horse yard-wide."}
          </DialogDescription>
        </DialogHeader>
        {!isIsolating && (
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Suspected strangles — pending vet review."
              data-testid="dialog-mark-isolating-reason"
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="dialog-mark-isolating-cancel">
            Cancel
          </Button>
          <Button
            variant={isIsolating ? "default" : "destructive"}
            onClick={apply}
            disabled={submitting || (!isIsolating && reason.trim().length < 5)}
            data-testid="dialog-mark-isolating-confirm"
          >
            {isIsolating ? "End isolation" : "Mark isolating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
