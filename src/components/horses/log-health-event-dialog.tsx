"use client";

import { HeartPulse } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { newId } from "@/lib/mock/id-prefixes";
import { mutate } from "@/lib/mock/store";
import type { HealthEventKind, PractitionerKind } from "@/types";

const KINDS: { value: HealthEventKind; label: string }[] = [
  { value: "vaccination", label: "Vaccination" },
  { value: "worming", label: "Worming" },
  { value: "farrier", label: "Farrier" },
  { value: "dental", label: "Dental" },
  { value: "vet_visit", label: "Vet visit" },
  { value: "injury", label: "Injury" },
  { value: "illness", label: "Illness" },
];

const KIND_TO_PRACT: Record<HealthEventKind, PractitionerKind> = {
  vaccination: "vet",
  worming: "yard_staff",
  farrier: "farrier",
  dental: "dental_tech",
  vet_visit: "vet",
  injury: "vet",
  illness: "vet",
};

const CYCLE_DAYS: Record<HealthEventKind, number | null> = {
  vaccination: 365,
  worming: 90,
  farrier: 42,
  dental: 365,
  vet_visit: null,
  injury: null,
  illness: null,
};

export function LogHealthEventDialog({
  horseId,
  horseName,
  trigger,
}: {
  horseId: string;
  horseName: string;
  trigger?: React.ReactElement;
}) {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<HealthEventKind>("vaccination");
  const [productOrTreatment, setProductOrTreatment] = useState("");
  const [practitionerName, setPractitionerName] = useState("");
  const [eventDate, setEventDate] = useState("2026-04-25");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setKind("vaccination");
    setProductOrTreatment("");
    setPractitionerName("");
    setEventDate("2026-04-25");
    setNotes("");
  }

  async function submit() {
    setSubmitting(true);
    const tenantId = session?.tenantId ?? "";
    const cycleDays = CYCLE_DAYS[kind];
    const nextDue = cycleDays ? new Date(Date.parse(eventDate) + cycleDays * 86_400_000).toISOString() : null;
    const eventId = newId("healthEvent", `${horseId}-${kind}-log`);
    await mutate((d) => {
      d.healthEvents.unshift({
        id: eventId,
        tenantId,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        horseId,
        kind,
        eventDate: new Date(eventDate).toISOString(),
        nextDueDate: nextDue,
        practitionerName: practitionerName || "Yard staff",
        practitionerKind: KIND_TO_PRACT[kind],
        productOrTreatment: productOrTreatment || null,
        dose: null,
        batchNumber: null,
        withdrawalDays: null,
        notes: notes || null,
        documentIds: [],
        linkedTaskIds: [],
        status: "completed",
      });
    });
    setSubmitting(false);
    toast.success(`${kind.replace("_", " ")} logged for ${horseName}`);
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm" data-testid="horse-profile-toolbar-cta">
              <HeartPulse className="h-3.5 w-3.5" /> Log health event
            </Button>
          )
        }
      />
      <DialogContent className="max-w-lg" data-testid="dialog-log-health-event">
        <DialogHeader>
          <DialogTitle>Log health event — {horseName}</DialogTitle>
          <DialogDescription>
            Records a health event with the appropriate next-due date for the cycle.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Kind</Label>
            <Select value={kind} onValueChange={(v) => v && setKind(v as HealthEventKind)}>
              <SelectTrigger data-testid="dialog-log-health-event-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Event date</Label>
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              data-testid="dialog-log-health-event-date"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Practitioner</Label>
            <Input
              value={practitionerName}
              onChange={(e) => setPractitionerName(e.target.value)}
              placeholder="Stourbridge Equine Clinic"
              data-testid="dialog-log-health-event-practitioner"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Product / treatment</Label>
            <Input
              value={productOrTreatment}
              onChange={(e) => setProductOrTreatment(e.target.value)}
              placeholder="ProteqFlu-Te"
              data-testid="dialog-log-health-event-product"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="dialog-log-health-event-notes"
            />
          </div>
          {CYCLE_DAYS[kind] && (
            <p className="text-xs text-muted-foreground">
              Next due will be auto-set {CYCLE_DAYS[kind]} days from event date.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="dialog-log-health-event-cancel">
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting} data-testid="dialog-log-health-event-submit">
            {submitting ? "Logging…" : "Log event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
