"use client";

import { Edit, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { now } from "@/lib/mock/clock";
import { mutate, useDataset } from "@/lib/mock/store";
import type { Horse } from "@/types";

export function EditHorseDialog({ horse }: { horse: Horse }) {
  const dataset = useDataset();
  const [open, setOpen] = useState(false);
  const [stableName, setStableName] = useState(horse.stableName);
  const [registeredName, setRegisteredName] = useState(horse.registeredName);
  const [colour, setColour] = useState(horse.colour);
  const [markings, setMarkings] = useState(horse.markings ?? "");
  const [liveryPackageId, setLiveryPackageId] = useState(horse.liveryPackageId);
  const [insuranceProvider, setInsuranceProvider] = useState(horse.insuranceProvider ?? "");
  const [submitting, setSubmitting] = useState(false);

  const tenantPackages = dataset.liveryPackages.filter((p) => p.tenantId === horse.tenantId);

  async function save() {
    setSubmitting(true);
    await mutate((d) => {
      const target = d.horses.find((h) => h.id === horse.id);
      if (!target) return;
      target.stableName = stableName;
      target.registeredName = registeredName;
      target.colour = colour;
      target.markings = markings || null;
      target.liveryPackageId = liveryPackageId;
      target.insuranceProvider = insuranceProvider || null;
      target.updatedAt = now().toISOString();
    });
    setSubmitting(false);
    toast.success(`${stableName}'s profile updated`);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" data-testid="horse-profile-toolbar-edit">
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
        }
      />
      <DialogContent className="max-w-lg" data-testid="dialog-edit-horse">
        <DialogHeader>
          <DialogTitle>Edit {horse.stableName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Stable name</Label>
            <Input
              value={stableName}
              onChange={(e) => setStableName(e.target.value)}
              data-testid="dialog-edit-horse-stableName"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Registered name</Label>
            <Input
              value={registeredName}
              onChange={(e) => setRegisteredName(e.target.value)}
              data-testid="dialog-edit-horse-registeredName"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Colour</Label>
            <Input value={colour} onChange={(e) => setColour(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Markings</Label>
            <Input
              value={markings}
              onChange={(e) => setMarkings(e.target.value)}
              placeholder="Star and snip; near-fore white sock"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Livery package</Label>
            <Select value={liveryPackageId} onValueChange={(v) => v && setLiveryPackageId(v)}>
              <SelectTrigger data-testid="dialog-edit-horse-livery">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tenantPackages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — £{(p.basePriceMonthlyPence / 100).toFixed(2)}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Insurance provider</Label>
            <Input value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="dialog-edit-horse-cancel">
            Cancel
          </Button>
          <Button onClick={save} disabled={submitting} data-testid="dialog-edit-horse-save">
            <Save className="h-3.5 w-3.5" /> {submitting ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
