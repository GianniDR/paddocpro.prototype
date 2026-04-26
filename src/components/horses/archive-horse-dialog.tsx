"use client";

import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { now } from "@/lib/mock/clock";
import { mutate, useDataset } from "@/lib/mock/store";
import type { Horse } from "@/types";

interface ArchiveHorseDialogProps {
  horse: Horse;
  /** Controlled open state. When provided, the trigger is not rendered. */
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
}

export function ArchiveHorseDialog({ horse, open: openProp, onOpenChange }: ArchiveHorseDialogProps) {
  const dataset = useDataset();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Block if outstanding charges or isolating
  const outstandingCharges = dataset.charges.filter(
    (c) => c.horseId === horse.id && !c.invoiceId,
  ).length;
  const isolating = horse.healthStatus === "isolating";
  const blocked = isolating || outstandingCharges > 0;

  async function archive() {
    setSubmitting(true);
    await mutate((d) => {
      const h = d.horses.find((h) => h.id === horse.id);
      if (!h) return;
      h.archivedAt = now().toISOString();
      h.updatedAt = now().toISOString();
      // Vacate the stable
      if (h.currentStableId) {
        const s = d.stables.find((s) => s.id === h.currentStableId);
        if (s) {
          s.currentHorseId = null;
          s.status = "vacant";
        }
        h.currentStableId = null;
      }
    });
    setSubmitting(false);
    toast.success(`${horse.stableName} archived`);
    router.push("/horses");
  }

  return (
    <AlertDialog open={openProp} onOpenChange={onOpenChange}>
      {openProp === undefined && (
        <AlertDialogTrigger
          render={
            <Button variant="outline" size="sm" data-testid="horse-profile-toolbar-archive" disabled={blocked}>
              <Archive className="h-3.5 w-3.5" /> Archive
            </Button>
          }
        />
      )}
      <AlertDialogContent data-testid="dialog-archive-horse">
        <AlertDialogHeader>
          <AlertDialogTitle>Archive {horse.stableName}?</AlertDialogTitle>
          <AlertDialogDescription>
            {blocked ? (
              <>
                Cannot archive: {isolating && "horse is isolating. "}
                {outstandingCharges > 0 &&
                  `${outstandingCharges} outstanding charges pending invoice.`}{" "}
                Resolve these first.
              </>
            ) : (
              <>
                Archived horses are hidden from the active list and the assigned stable becomes
                vacant. Use this when a horse leaves the yard or is sold.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="dialog-archive-horse-cancel">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={blocked || submitting}
            onClick={(e) => {
              e.preventDefault();
              if (!blocked) void archive();
            }}
            data-testid="dialog-archive-horse-confirm"
          >
            Archive horse
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
