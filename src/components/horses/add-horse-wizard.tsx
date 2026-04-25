"use client";

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { newId } from "@/lib/mock/id-prefixes";
import { mutate, useDataset } from "@/lib/mock/store";

const STEPS = [
  { slug: "identity", label: "Identity" },
  { slug: "identifiers", label: "Identifiers & insurance" },
  { slug: "ownership", label: "Ownership" },
  { slug: "assignment", label: "Stable & livery" },
  { slug: "review", label: "Review" },
] as const;

type StepSlug = (typeof STEPS)[number]["slug"];

export function AddHorseWizard() {
  const router = useRouter();
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [step, setStep] = useState<StepSlug>("identity");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [stableName, setStableName] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [breed, setBreed] = useState("Irish Sport Horse");
  const [sex, setSex] = useState<"mare" | "gelding" | "stallion" | "colt" | "filly">("gelding");
  const [colour, setColour] = useState("Bay");
  const [heightHands, setHeightHands] = useState("16.0");
  const [dateOfBirth, setDateOfBirth] = useState("2018-04-01");
  const [microchipNumber, setMicrochipNumber] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("2028-12-31");
  const [insuranceProvider, setInsuranceProvider] = useState("NFU Mutual");
  const [primaryOwnerId, setPrimaryOwnerId] = useState<string>("");
  const [stableId, setStableId] = useState<string>("");
  const [liveryPackageId, setLiveryPackageId] = useState<string>("");
  const [feedNote, setFeedNote] = useState("3 feeds/day · standard cool mix · 1.5 kg AM/PM, 1 kg lunch.");

  const tenantClients = dataset.clients.filter((c) => c.tenantId === tenantId);
  const tenantStables = dataset.stables.filter((s) => s.tenantId === tenantId && s.status === "vacant");
  const tenantPackages = dataset.liveryPackages.filter((p) => p.tenantId === tenantId);

  const stepIdx = STEPS.findIndex((s) => s.slug === step);
  const stepTitle = STEPS[stepIdx]?.label ?? "";

  function next() {
    if (stepIdx < STEPS.length - 1) setStep(STEPS[stepIdx + 1].slug);
  }
  function prev() {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1].slug);
  }

  function valid(slug: StepSlug): boolean {
    switch (slug) {
      case "identity":
        return !!stableName && !!breed && !!colour && !!heightHands && /^[0-9]{1,2}(\.[0-9])?$/.test(heightHands);
      case "identifiers":
        return microchipNumber.length >= 8 && passportNumber.length >= 4;
      case "ownership":
        return !!primaryOwnerId;
      case "assignment":
        return !!liveryPackageId;
      default:
        return true;
    }
  }

  async function submit() {
    if (!tenantId) return;
    setSubmitting(true);
    const horseId = newId("horse", `wiz-${stableName.toLowerCase()}`);
    const feedPlanId = newId("feedPlan", horseId);
    const yardManager = dataset.users.find((u) => u.tenantId === tenantId && u.role === "yard_manager");
    const targetStable = stableId ? tenantStables.find((s) => s.id === stableId) : null;

    await mutate((d) => {
      const newHorse = {
        id: horseId,
        tenantId,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        registeredName: registeredName || `${stableName} ${breed.split(" ")[0]}`,
        stableName,
        breed,
        sex,
        colour,
        markings: null,
        heightHands: parseFloat(heightHands),
        dateOfBirth: new Date(dateOfBirth).toISOString(),
        microchipNumber,
        passportNumber,
        passportExpiry: new Date(passportExpiry).toISOString(),
        primaryOwnerId,
        coOwnerIds: [],
        currentStableId: targetStable?.id ?? null,
        currentPaddockId: null,
        liveryPackageId,
        liveryStartDate: now().toISOString(),
        beddingType: targetStable?.defaultBeddingType ?? "shavings",
        healthStatus: "healthy" as const,
        feedPlanId,
        insuranceProvider: insuranceProvider || null,
        insurancePolicyNumber: null,
        insuranceExpiry: null,
        primaryPhotoUrl: "",
        photoGalleryUrls: [],
        archivedAt: null,
      };
      d.horses.push(newHorse);

      d.feedPlans.push({
        id: feedPlanId,
        tenantId,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        horseId,
        feeds: [
          { time: "07:00", feedProductId: d.inventory.find((i) => i.tenantId === tenantId)?.id ?? "", quantityKg: 1.5, notes: feedNote },
        ],
        supplements: [],
        specialInstructions: feedNote || null,
        templateId: null,
      });

      if (targetStable) {
        const s = d.stables.find((s) => s.id === targetStable.id);
        if (s) {
          s.currentHorseId = horseId;
          s.status = "occupied";
        }
        d.movements.push({
          id: newId("movement", horseId),
          tenantId,
          createdAt: now().toISOString(),
          updatedAt: now().toISOString(),
          horseId,
          from: { stableId: null, paddockId: null },
          to: { stableId: targetStable.id, paddockId: null },
          at: now().toISOString(),
          byUserId: yardManager?.id ?? "",
          reason: "Initial assignment via Add Horse wizard",
        });
      }
    });

    toast.success(`${stableName} added`, {
      description: targetStable
        ? `Assigned to ${targetStable.block} ${targetStable.number}.`
        : "No stable assigned yet.",
    });
    setSubmitting(false);
    router.push(`/horses/${horseId}`);
  }

  return (
    <div className="flex flex-col flex-1 p-4 pb-12 gap-4" data-testid="add-horse-wizard">
      <Card className="bg-card border rounded-lg">
        <CardContent className="px-6 py-4 flex items-center gap-4 flex-wrap">
          {STEPS.map((s, i) => (
            <div
              key={s.slug}
              className="flex items-center gap-2"
              data-testid={`wizard-add-horse-step-${i + 1}`}
            >
              <div
                className={
                  "h-7 w-7 rounded-full text-xs font-medium flex items-center justify-center " +
                  (i === stepIdx
                    ? "bg-primary text-primary-foreground"
                    : i < stepIdx
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground")
                }
              >
                {i + 1}
              </div>
              <span className={"text-sm " + (i === stepIdx ? "font-medium" : "text-muted-foreground")}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-medium">{stepTitle}</h2>
          </div>

          {step === "identity" && (
            <>
              <Field label="Stable name *" required>
                <Input
                  value={stableName}
                  onChange={(e) => setStableName(e.target.value)}
                  placeholder="Whisper"
                  data-testid="wizard-add-horse-field-stableName"
                />
              </Field>
              <Field label="Registered name">
                <Input
                  value={registeredName}
                  onChange={(e) => setRegisteredName(e.target.value)}
                  placeholder="Whispered Promise of Riverbend"
                  data-testid="wizard-add-horse-field-registeredName"
                />
              </Field>
              <Field label="Breed *">
                <Input
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  data-testid="wizard-add-horse-field-breed"
                />
              </Field>
              <Field label="Sex">
                <Select value={sex} onValueChange={(v) => v && setSex(v as typeof sex)}>
                  <SelectTrigger data-testid="wizard-add-horse-field-sex">
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
              </Field>
              <Field label="Colour *">
                <Input value={colour} onChange={(e) => setColour(e.target.value)} />
              </Field>
              <Field label="Height (hands) *">
                <Input
                  value={heightHands}
                  onChange={(e) => setHeightHands(e.target.value)}
                  placeholder="16.2"
                  data-testid="wizard-add-horse-field-height"
                />
              </Field>
              <Field label="Date of birth">
                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </Field>
            </>
          )}

          {step === "identifiers" && (
            <>
              <Field label="Microchip number *">
                <Input
                  value={microchipNumber}
                  onChange={(e) => setMicrochipNumber(e.target.value)}
                  placeholder="985121…"
                  data-testid="wizard-add-horse-field-microchip"
                />
              </Field>
              <Field label="Passport number *">
                <Input
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="GB900123"
                  data-testid="wizard-add-horse-field-passport"
                />
              </Field>
              <Field label="Passport expiry">
                <Input type="date" value={passportExpiry} onChange={(e) => setPassportExpiry(e.target.value)} />
              </Field>
              <Field label="Insurance provider">
                <Input value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} />
              </Field>
            </>
          )}

          {step === "ownership" && (
            <Field label="Primary owner *">
              <Select value={primaryOwnerId} onValueChange={(v) => v && setPrimaryOwnerId(v)}>
                <SelectTrigger data-testid="wizard-add-horse-field-owner">
                  <SelectValue placeholder="Pick an owner" />
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
            </Field>
          )}

          {step === "assignment" && (
            <>
              <Field label="Stable (vacant only)">
                <Select value={stableId} onValueChange={(v) => v && setStableId(v)}>
                  <SelectTrigger data-testid="wizard-add-horse-field-stable">
                    <SelectValue placeholder="Pick a stable (or skip)" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenantStables.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.block} {s.number} — {s.dimensions}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Livery package *">
                <Select value={liveryPackageId} onValueChange={(v) => v && setLiveryPackageId(v)}>
                  <SelectTrigger data-testid="wizard-add-horse-field-livery">
                    <SelectValue placeholder="Pick a livery package" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenantPackages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — £{(p.basePriceMonthlyPence / 100).toFixed(2)}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Feed plan note">
                <Textarea value={feedNote} onChange={(e) => setFeedNote(e.target.value)} rows={3} />
              </Field>
            </>
          )}

          {step === "review" && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Review and confirm.</p>
              <div className="rounded-md border bg-card p-3 space-y-1.5">
                <Row k="Stable name" v={stableName || "—"} />
                <Row k="Breed" v={`${breed} · ${sex} · ${colour}`} />
                <Row k="Height" v={`${heightHands}hh`} />
                <Row k="Microchip" v={microchipNumber || "—"} />
                <Row k="Passport" v={`${passportNumber || "—"} (exp ${passportExpiry})`} />
                <Row
                  k="Owner"
                  v={(() => {
                    const c = tenantClients.find((c) => c.id === primaryOwnerId);
                    const u = dataset.users.find((u) => u.id === c?.userAccountId);
                    return u ? `${u.firstName} ${u.lastName}` : "—";
                  })()}
                />
                <Row
                  k="Stable assignment"
                  v={(() => {
                    const s = tenantStables.find((s) => s.id === stableId);
                    return s ? `${s.block} ${s.number}` : "Not assigned";
                  })()}
                />
                <Row
                  k="Livery"
                  v={tenantPackages.find((p) => p.id === liveryPackageId)?.name ?? "—"}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={stepIdx === 0}
              data-testid={`wizard-add-horse-step-${stepIdx + 1}-back`}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </Button>
            {step === "review" ? (
              <Button
                size="sm"
                onClick={submit}
                disabled={submitting}
                data-testid="wizard-add-horse-submit"
              >
                {submitting ? "Adding…" : "Add horse"}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={next}
                disabled={!valid(step)}
                data-testid={`wizard-add-horse-step-${stepIdx + 1}-next`}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground max-w-3xl">
        <Badge variant="outline">Demo</Badge> Submission writes the horse, feed plan and stable
        assignment into the in-memory mock store, then redirects to the new horse profile.
      </p>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1">
      <Label>
        {label}
        {required && <span className="sr-only"> required</span>}
      </Label>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}
