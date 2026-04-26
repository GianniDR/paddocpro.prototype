"use client";

import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { mutate, useDataset } from "@/lib/mock/store";
import type { HorseSex } from "@/types";

const horseSchema = z.object({
  stableName: z.string().min(1, "Stable name is required"),
  registeredName: z.string().min(1, "Registered name is required"),
  breed: z.string().min(1, "Breed is required"),
  sex: z.enum(["mare", "gelding", "stallion", "colt", "filly"]),
  colour: z.string().min(1, "Colour is required"),
  heightHands: z
    .string()
    .regex(/^[0-9]{1,2}(\.[0-9])?$/, "Height must be in hands (e.g. 16.2)"),
  microchipNumber: z
    .string()
    .min(15, "Microchip number must be at least 15 characters"),
  primaryOwnerId: z.string().min(1, "Primary owner is required"),
});

type HorseFormValues = z.infer<typeof horseSchema>;

const DEFAULT_VALUES: HorseFormValues = {
  stableName: "",
  registeredName: "",
  breed: "Irish Sport Horse",
  sex: "gelding",
  colour: "Bay",
  heightHands: "16.0",
  microchipNumber: "",
  primaryOwnerId: "",
};

interface AddHorseModalProps {
  trigger?: React.ReactElement;
  /** Controlled open state. When provided, the component is fully controlled. */
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
}

export function AddHorseModal({ trigger, open: openProp, onOpenChange }: AddHorseModalProps) {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    if (openProp === undefined) setInternalOpen(v);
  };
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
  } = useForm<HorseFormValues>({ defaultValues: DEFAULT_VALUES });

  // Local state for the Select fields (RHF watch() is incompatible with React Compiler).
  const [sexValue, setSexValue] = useState<HorseFormValues["sex"]>(
    DEFAULT_VALUES.sex,
  );
  const [ownerValue, setOwnerValue] = useState<string>(
    DEFAULT_VALUES.primaryOwnerId,
  );

  const tenantClients = dataset.clients.filter((c) => c.tenantId === tenantId);
  const tenantPackages = dataset.liveryPackages.filter(
    (p) => p.tenantId === tenantId,
  );

  function close() {
    setOpen(false);
    reset(DEFAULT_VALUES);
    setSexValue(DEFAULT_VALUES.sex);
    setOwnerValue(DEFAULT_VALUES.primaryOwnerId);
  }

  async function onSubmit(values: HorseFormValues) {
    const parsed = horseSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string") {
          setError(path as keyof HorseFormValues, { message: issue.message });
        }
      }
      return;
    }
    if (!tenantId) {
      toast.error("No active tenant");
      return;
    }
    setSubmitting(true);
    const isoNow = now().toISOString();
    const horseId = newId(
      "horse",
      `mod-${parsed.data.stableName.toLowerCase()}-${now().getTime()}`,
    );
    const defaultPackage = tenantPackages[0];
    const liveryPackageId = defaultPackage?.id ?? "";

    await mutate((d) => {
      d.horses.unshift({
        id: horseId,
        tenantId,
        createdAt: isoNow,
        updatedAt: isoNow,
        registeredName: parsed.data.registeredName,
        stableName: parsed.data.stableName,
        breed: parsed.data.breed,
        sex: parsed.data.sex as HorseSex,
        colour: parsed.data.colour,
        markings: null,
        heightHands: parseFloat(parsed.data.heightHands),
        dateOfBirth: new Date("2018-04-01").toISOString(),
        microchipNumber: parsed.data.microchipNumber,
        passportNumber: "",
        passportExpiry: new Date("2028-12-31").toISOString(),
        primaryOwnerId: parsed.data.primaryOwnerId,
        coOwnerIds: [],
        currentStableId: null,
        currentPaddockId: null,
        liveryPackageId,
        liveryStartDate: isoNow,
        beddingType: "shavings",
        healthStatus: "healthy",
        feedPlanId: null,
        insuranceProvider: null,
        insurancePolicyNumber: null,
        insuranceExpiry: null,
        primaryPhotoUrl: "",
        photoGalleryUrls: [],
        archivedAt: null,
      });
    });

    setSubmitting(false);
    toast.success(`${parsed.data.stableName} added`, {
      description: "New horse created in the yard.",
    });
    close();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      {openProp === undefined && (
        <DialogTrigger
          render={
            trigger ?? (
              <Button size="sm" data-testid="horses-grid-add">
                <Plus size={14} /> Add horse
              </Button>
            )
          }
        />
      )}
      <DialogContent className="max-w-lg" data-testid="dialog-add-horse">
        <DialogHeader>
          <DialogTitle>Add horse</DialogTitle>
          <DialogDescription>
            Create a new horse on the yard. You can fill in passport details,
            stable assignment and feed plan from the horse profile after.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="add-horse-stableName">Stable name</Label>
            <Input
              id="add-horse-stableName"
              placeholder="Whisper"
              data-testid="dialog-add-horse-stableName"
              {...register("stableName")}
            />
            {errors.stableName && (
              <p className="text-xs text-destructive">
                {errors.stableName.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-horse-registeredName">Registered name</Label>
            <Input
              id="add-horse-registeredName"
              placeholder="Whispered Promise of Riverbend"
              data-testid="dialog-add-horse-registeredName"
              {...register("registeredName")}
            />
            {errors.registeredName && (
              <p className="text-xs text-destructive">
                {errors.registeredName.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-horse-breed">Breed</Label>
            <Input
              id="add-horse-breed"
              data-testid="dialog-add-horse-breed"
              {...register("breed")}
            />
            {errors.breed && (
              <p className="text-xs text-destructive">{errors.breed.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Sex</Label>
            <Select
              value={sexValue}
              onValueChange={(v) => {
                if (!v) return;
                const sex = v as HorseFormValues["sex"];
                setSexValue(sex);
                setValue("sex", sex);
              }}
            >
              <SelectTrigger data-testid="dialog-add-horse-sex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mare">Mare</SelectItem>
                <SelectItem value="gelding">Gelding</SelectItem>
                <SelectItem value="stallion">Stallion</SelectItem>
                <SelectItem value="colt">Colt</SelectItem>
                <SelectItem value="filly">Filly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-horse-colour">Colour</Label>
            <Input
              id="add-horse-colour"
              data-testid="dialog-add-horse-colour"
              {...register("colour")}
            />
            {errors.colour && (
              <p className="text-xs text-destructive">
                {errors.colour.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-horse-heightHands">Height (hands)</Label>
            <Input
              id="add-horse-heightHands"
              placeholder="16.2"
              data-testid="dialog-add-horse-heightHands"
              {...register("heightHands")}
            />
            {errors.heightHands && (
              <p className="text-xs text-destructive">
                {errors.heightHands.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-horse-microchipNumber">Microchip number</Label>
            <Input
              id="add-horse-microchipNumber"
              placeholder="985121000000000"
              data-testid="dialog-add-horse-microchipNumber"
              {...register("microchipNumber")}
            />
            {errors.microchipNumber && (
              <p className="text-xs text-destructive">
                {errors.microchipNumber.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Primary owner</Label>
            <Select
              value={ownerValue}
              onValueChange={(v) => {
                if (!v) return;
                setOwnerValue(v);
                setValue("primaryOwnerId", v);
              }}
            >
              <SelectTrigger data-testid="dialog-add-horse-primaryOwnerId">
                <SelectValue placeholder="Pick an owner" />
              </SelectTrigger>
              <SelectContent>
                {tenantClients.map((c) => {
                  const u = dataset.users.find(
                    (u) => u.id === c.userAccountId,
                  );
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      {u ? `${u.firstName} ${u.lastName}` : c.id}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.primaryOwnerId && (
              <p className="text-xs text-destructive">
                {errors.primaryOwnerId.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={close}
              data-testid="dialog-add-horse-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              data-testid="dialog-add-horse-submit"
            >
              {submitting ? "Adding…" : "Add horse"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
