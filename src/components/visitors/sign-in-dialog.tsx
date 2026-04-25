"use client";

import { DoorOpen, Plus } from "lucide-react";
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
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { newId } from "@/lib/mock/id-prefixes";
import { mutate } from "@/lib/mock/store";
import type { VisitorLog } from "@/types";

const TYPES: VisitorLog["visitorType"][] = [
  "vet",
  "farrier",
  "dentist",
  "supplier",
  "contractor",
  "family",
  "other",
];

export function SignInVisitorDialog() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<VisitorLog["visitorType"]>("vet");
  const [purpose, setPurpose] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");

  function reset() {
    setName("");
    setType("vet");
    setPurpose("");
    setVehicleReg("");
  }

  async function submit() {
    if (!session) return;
    setSubmitting(true);
    await mutate((d) => {
      d.visitors.unshift({
        id: newId("visitor", `signin-${Date.now()}`),
        tenantId: session.tenantId,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        visitorName: name,
        visitorType: type,
        purpose,
        vehicleReg: vehicleReg || null,
        arrivedAt: now().toISOString(),
        departedAt: null,
        expectedBookingId: null,
        inductionStatus: type === "contractor" ? "complete" : null,
        insuranceCertDocId: null,
      });
    });
    setSubmitting(false);
    toast.success(`${name || "Visitor"} signed in`);
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
          <Button size="sm" data-testid="visitors-signin-trigger">
            <Plus className="h-3.5 w-3.5" /> Sign in visitor
          </Button>
        }
      />
      <DialogContent className="max-w-md" data-testid="dialog-signin-visitor">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4 text-primary" /> Sign in visitor
          </DialogTitle>
          <DialogDescription>Records arrival now; sign-out when they leave.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Stourbridge Equine Clinic"
              data-testid="dialog-signin-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => v && setType(v as VisitorLog["visitorType"])}>
              <SelectTrigger data-testid="dialog-signin-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Purpose *</Label>
            <Input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Routine vaccinations"
              data-testid="dialog-signin-purpose"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Vehicle reg</Label>
            <Input
              value={vehicleReg}
              onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
              placeholder="BV21 EQU"
              data-testid="dialog-signin-vehicle"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="dialog-signin-cancel">
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || name.trim().length < 2 || purpose.trim().length < 3}
            data-testid="dialog-signin-submit"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
