"use client";

import { CalendarDays, Plus } from "lucide-react";
import { useMemo, useState } from "react";
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
import { mutate, useDataset } from "@/lib/mock/store";
import type { BookingType } from "@/types";

const TYPES: { value: BookingType; label: string; resourceKinds: string[] }[] = [
  { value: "arena_slot", label: "Arena slot", resourceKinds: ["arena", "manege_outdoor"] },
  { value: "lesson", label: "Lesson", resourceKinds: ["arena", "manege_outdoor", "instructor"] },
  { value: "vet_appt", label: "Vet appointment", resourceKinds: ["vet"] },
  { value: "farrier_appt", label: "Farrier appointment", resourceKinds: ["farrier"] },
  { value: "dentist_appt", label: "Dentist appointment", resourceKinds: ["dentist"] },
];

export function NewBookingDialog() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<BookingType>("arena_slot");
  const [resourceId, setResourceId] = useState("");
  const [horseId, setHorseId] = useState("");
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState("2026-04-26");
  const [time, setTime] = useState("10:00");
  const [durationMins, setDurationMins] = useState("60");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resourceKinds = TYPES.find((t) => t.value === type)?.resourceKinds ?? [];
  const tenantResources = dataset.resources.filter(
    (r) => r.tenantId === tenantId && resourceKinds.includes(r.kind),
  );
  const tenantHorses = dataset.horses.filter((h) => h.tenantId === tenantId && !h.archivedAt);
  const tenantClients = dataset.clients.filter((c) => c.tenantId === tenantId);

  const proposedStart = useMemo(() => Date.parse(`${date}T${time}:00.000Z`), [date, time]);
  const proposedEnd = proposedStart + parseInt(durationMins, 10) * 60_000;

  const clash = useMemo(() => {
    if (!resourceId) return null;
    return dataset.bookings.find(
      (b) =>
        b.tenantId === tenantId &&
        b.resourceId === resourceId &&
        b.status !== "cancelled" &&
        Date.parse(b.startAt) < proposedEnd &&
        Date.parse(b.endAt) > proposedStart,
    );
  }, [dataset.bookings, tenantId, resourceId, proposedStart, proposedEnd]);

  function reset() {
    setType("arena_slot");
    setResourceId("");
    setHorseId("");
    setClientId("");
    setDate("2026-04-26");
    setTime("10:00");
    setDurationMins("60");
    setNotes("");
    setError(null);
  }

  async function submit() {
    if (clash) {
      setError(
        `Clashes with an existing booking on this resource at ${new Date(clash.startAt).toUTCString().slice(17, 22)}.`,
      );
      return;
    }
    if (!resourceId) {
      setError("Pick a resource.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const userId = session?.userId ?? "";
    await mutate((d) => {
      d.bookings.unshift({
        id: newId("booking", `new-${Date.now()}`),
        tenantId: tenantId!,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        type,
        resourceId,
        clientId: clientId || null,
        horseId: horseId || null,
        staffIds: [userId].filter(Boolean),
        startAt: new Date(proposedStart).toISOString(),
        endAt: new Date(proposedEnd).toISOString(),
        status: "confirmed",
        recurrenceRule: null,
        notes: notes || null,
      });
    });
    setSubmitting(false);
    toast.success("Booking confirmed");
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
          <Button size="sm" data-testid="bookings-new-trigger">
            <Plus className="h-3.5 w-3.5" /> New booking
          </Button>
        }
      />
      <DialogContent className="max-w-lg" data-testid="dialog-new-booking">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" /> New booking
          </DialogTitle>
          <DialogDescription>
            Clash detection runs against the chosen resource for the selected window.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                if (!v) return;
                setType(v as BookingType);
                setResourceId("");
              }}
            >
              <SelectTrigger data-testid="dialog-new-booking-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Resource</Label>
            <Select value={resourceId} onValueChange={(v) => v && setResourceId(v)}>
              <SelectTrigger data-testid="dialog-new-booking-resource">
                <SelectValue placeholder="Pick a resource" />
              </SelectTrigger>
              <SelectContent>
                {tenantResources.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-1">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5 col-span-1">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-1.5 col-span-1">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={durationMins}
                onChange={(e) => setDurationMins(e.target.value)}
                min={15}
                step={15}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Horse (optional)</Label>
              <Select value={horseId} onValueChange={(v) => v && setHorseId(v)}>
                <SelectTrigger data-testid="dialog-new-booking-horse">
                  <SelectValue placeholder="Pick a horse" />
                </SelectTrigger>
                <SelectContent>
                  {tenantHorses.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.stableName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Client (optional)</Label>
              <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
                <SelectTrigger data-testid="dialog-new-booking-client">
                  <SelectValue placeholder="Pick a client" />
                </SelectTrigger>
                <SelectContent>
                  {tenantClients.map((c) => {
                    const u = dataset.users.find((u) => u.id === c.userAccountId);
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        {u ? `${u.firstName} ${u.lastName}` : c.id}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {clash && (
            <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive" data-testid="dialog-new-booking-clash">
              Clashes with an existing booking on this resource between{" "}
              {new Date(clash.startAt).toUTCString().slice(17, 22)} and{" "}
              {new Date(clash.endAt).toUTCString().slice(17, 22)}. Pick another slot.
            </div>
          )}
          {error && !clash && (
            <p className="text-xs text-destructive" data-testid="dialog-new-booking-error">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="dialog-new-booking-cancel">
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || !resourceId || !!clash}
            data-testid="dialog-new-booking-submit"
          >
            {submitting ? "Creating…" : "Create booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
