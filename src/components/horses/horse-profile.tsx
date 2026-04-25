"use client";

import {
  CalendarDays,
  ChevronLeft,
  FileText,
  HeartPulse,
  Move,
  Receipt,
  Sparkles,
  Wheat,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { ArchiveHorseDialog } from "@/components/horses/archive-horse-dialog";
import { EditHorseDialog } from "@/components/horses/edit-horse-dialog";
import { LogHealthEventDialog } from "@/components/horses/log-health-event-dialog";
import { MarkIsolatingDialog } from "@/components/horses/mark-isolating-dialog";
import { DetailScaffold } from "@/components/shell/detail-scaffold";
import { DetailToolbar } from "@/components/shell/detail-toolbar";
import { StatusBadge } from "@/components/shell/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatDateTime, formatGbp, formatHands } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";
import type { Horse } from "@/types";

export function HorseProfile({ horseId }: { horseId: string }) {
  const dataset = useDataset();
  const horse = dataset.horses.find((h) => h.id === horseId);

  if (!horse) {
    return (
      <div className="p-6">
        <Card className="max-w-xl">
          <CardContent className="p-6 space-y-3">
            <p className="text-sm">We couldn&apos;t find that horse.</p>
            <Button render={<Link href="/horses" />} variant="outline" size="sm">
              <ChevronLeft className="h-3.5 w-3.5" /> Back to horses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <HorseProfileBody horse={horse} />;
}

function HorseProfileBody({ horse }: { horse: Horse }) {
  const dataset = useDataset();
  const owner = dataset.clients.find((c) => c.id === horse.primaryOwnerId);
  const ownerUser = dataset.users.find((u) => u.id === owner?.userAccountId);
  const stable = dataset.stables.find((s) => s.id === horse.currentStableId);
  const livery = dataset.liveryPackages.find((p) => p.id === horse.liveryPackageId);

  const horseHealthEvents = useMemo(
    () =>
      dataset.healthEvents
        .filter((e) => e.horseId === horse.id)
        .sort((a, b) => Date.parse(b.eventDate) - Date.parse(a.eventDate)),
    [dataset.healthEvents, horse.id],
  );

  const upcomingDues = useMemo(() => {
    const grouped: Record<string, { kind: string; nextDue: string | null }> = {};
    for (const ev of horseHealthEvents) {
      if (!grouped[ev.kind] && ev.nextDueDate) {
        grouped[ev.kind] = { kind: ev.kind, nextDue: ev.nextDueDate };
      }
    }
    return Object.values(grouped)
      .filter((g) => g.nextDue)
      .sort((a, b) => Date.parse(a.nextDue!) - Date.parse(b.nextDue!));
  }, [horseHealthEvents]);

  const horseBookings = dataset.bookings
    .filter((b) => b.horseId === horse.id)
    .sort((a, b) => Date.parse(b.startAt) - Date.parse(a.startAt))
    .slice(0, 20);

  const horseDocs = dataset.documents.filter((d) => d.entityType === "horse" && d.entityId === horse.id);
  const feedPlan = dataset.feedPlans.find((f) => f.id === horse.feedPlanId);
  const horseCharges = dataset.charges.filter((c) => c.horseId === horse.id);

  const ageYears = Math.floor(
    (Date.parse("2026-04-25") - Date.parse(horse.dateOfBirth)) / (365 * 86_400_000),
  );

  const subtitle = `${horse.registeredName} · ${formatHands(horse.heightHands)} ${horse.colour} ${horse.sex} · ${ageYears}y · Microchip ${horse.microchipNumber.slice(-6)}`;

  const toolbar = (
    <DetailToolbar testId="horse-profile-toolbar">
      <EditHorseDialog horse={horse} />
      <Button variant="outline" size="sm" data-testid="horse-profile-toolbar-move">
        <Move className="h-3.5 w-3.5" /> Move
      </Button>
      <MarkIsolatingDialog horseId={horse.id} horseName={horse.stableName} />
      <ArchiveHorseDialog horse={horse} />
      <Button
        variant="outline"
        size="sm"
        data-testid="horse-profile-toolbar-paddy"
        onClick={() => {
          if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("paddy:toggle"));
        }}
      >
        <Sparkles className="h-3.5 w-3.5" /> Ask Paddy about {horse.stableName}
      </Button>
      <LogHealthEventDialog horseId={horse.id} horseName={horse.stableName} />
    </DetailToolbar>
  );

  return (
    <DetailScaffold
      title={horse.stableName}
      subtitle={subtitle}
      Icon={Sparkles}
      tabs={[]}
      stickyToolbar={toolbar}
    >
      <Tabs defaultValue="profile" className="flex-1 flex flex-col w-full min-w-0">
        <div className="flex flex-wrap gap-2 mb-3">
          <StatusBadge status={horse.healthStatus} />
          <Badge variant="outline" className="font-normal">
            {livery?.name ?? "No livery"}
          </Badge>
          <Badge variant="outline" className="font-normal">
            Stable {stable ? `${stable.block.split(" ")[0]} ${stable.number}` : "—"}
          </Badge>
          {ownerUser && (
            <Badge variant="outline" className="font-normal">
              Owner: {ownerUser.firstName} {ownerUser.lastName}
            </Badge>
          )}
        </div>

        <TabsList className="h-auto bg-transparent gap-2 px-0 py-2 mb-3" data-testid="horse-profile-tabs">
          <TabsTrigger value="profile" data-testid="horse-profile-tab-profile" className="gap-1.5">
            Profile
          </TabsTrigger>
          <TabsTrigger value="health" data-testid="horse-profile-tab-health" className="gap-1.5">
            <HeartPulse className="h-3.5 w-3.5" /> Health
            <Badge variant="secondary" className="h-4 text-[10px]">
              {horseHealthEvents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="bookings" data-testid="horse-profile-tab-bookings" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> Bookings
            <Badge variant="secondary" className="h-4 text-[10px]">
              {horseBookings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="documents" data-testid="horse-profile-tab-documents" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Documents
            <Badge variant="secondary" className="h-4 text-[10px]">
              {horseDocs.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="feed" data-testid="horse-profile-tab-feed" className="gap-1.5">
            <Wheat className="h-3.5 w-3.5" /> Feed plan
          </TabsTrigger>
          <TabsTrigger value="charges" data-testid="horse-profile-tab-charges" className="gap-1.5">
            <Receipt className="h-3.5 w-3.5" /> Charges
            <Badge variant="secondary" className="h-4 text-[10px]">
              {horseCharges.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="horse-profile-tab-activity">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" data-testid="horse-profile-tabpanel-profile" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label="Registered name">{horse.registeredName}</Field>
                <Field label="Stable name">{horse.stableName}</Field>
                <Field label="Breed">{horse.breed}</Field>
                <Field label="Sex">{horse.sex}</Field>
                <Field label="Colour">{horse.colour}</Field>
                <Field label="Markings">{horse.markings ?? "—"}</Field>
                <Field label="Height">{formatHands(horse.heightHands)}</Field>
                <Field label="Date of birth">{formatDate(horse.dateOfBirth)}</Field>
                <Separator />
                <Field label="Microchip">{horse.microchipNumber}</Field>
                <Field label="Passport number">{horse.passportNumber}</Field>
                <Field label="Passport expiry">{formatDate(horse.passportExpiry)}</Field>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ownership & assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label="Primary owner">
                  {ownerUser ? (
                    <Link
                      href={`/clients?id=${owner!.id}`}
                      className="text-primary hover:underline"
                      data-testid={`drill-client-${owner!.id}`}
                    >
                      {ownerUser.firstName} {ownerUser.lastName}
                    </Link>
                  ) : (
                    "—"
                  )}
                </Field>
                <Field label="Stable">
                  {stable ? (
                    <Link
                      href={`/stables?id=${stable.id}`}
                      className="text-primary hover:underline"
                      data-testid={`drill-stable-${stable.id}`}
                    >
                      {stable.block} {stable.number}
                    </Link>
                  ) : (
                    "—"
                  )}
                </Field>
                <Field label="Livery package">{livery?.name ?? "—"}</Field>
                <Field label="Livery start">{formatDate(horse.liveryStartDate)}</Field>
                <Field label="Bedding">{horse.beddingType}</Field>
                <Separator />
                <Field label="Insurer">{horse.insuranceProvider ?? "—"}</Field>
                <Field label="Policy">{horse.insurancePolicyNumber ?? "—"}</Field>
                <Field label="Policy expiry">{formatDate(horse.insuranceExpiry)}</Field>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" data-testid="horse-profile-tabpanel-health" className="mt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {upcomingDues.slice(0, 4).map((d) => (
              <Card key={d.kind}>
                <CardContent className="p-3">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {d.kind.replace("_", " ")}
                  </div>
                  <div className="text-sm font-medium mt-1">Next due {formatDate(d.nextDue)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Event history</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">Date</th>
                    <th className="text-left font-medium px-3 py-2">Kind</th>
                    <th className="text-left font-medium px-3 py-2">Practitioner</th>
                    <th className="text-left font-medium px-3 py-2">Product / treatment</th>
                    <th className="text-left font-medium px-3 py-2">Next due</th>
                  </tr>
                </thead>
                <tbody>
                  {horseHealthEvents.slice(0, 25).map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-3 py-2">{formatDate(e.eventDate)}</td>
                      <td className="px-3 py-2 capitalize">{e.kind.replace("_", " ")}</td>
                      <td className="px-3 py-2">{e.practitionerName}</td>
                      <td className="px-3 py-2">{e.productOrTreatment ?? "—"}</td>
                      <td className="px-3 py-2">{formatDate(e.nextDueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" data-testid="horse-profile-tabpanel-bookings" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">When</th>
                    <th className="text-left font-medium px-3 py-2">Type</th>
                    <th className="text-left font-medium px-3 py-2">Resource</th>
                    <th className="text-left font-medium px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {horseBookings.map((b) => {
                    const r = dataset.resources.find((res) => res.id === b.resourceId);
                    return (
                      <tr key={b.id} className="border-t">
                        <td className="px-3 py-2">{formatDateTime(b.startAt)}</td>
                        <td className="px-3 py-2 capitalize">{b.type.replace("_", " ")}</td>
                        <td className="px-3 py-2">{r?.name ?? "—"}</td>
                        <td className="px-3 py-2">
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    );
                  })}
                  {horseBookings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                        No bookings for this horse.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" data-testid="horse-profile-tabpanel-documents" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">Title</th>
                    <th className="text-left font-medium px-3 py-2">Category</th>
                    <th className="text-left font-medium px-3 py-2">Size</th>
                    <th className="text-left font-medium px-3 py-2">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {horseDocs.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="px-3 py-2">{d.title}</td>
                      <td className="px-3 py-2 capitalize">{d.category.replace("_", " ")}</td>
                      <td className="px-3 py-2">{(d.fileSizeBytes / 1024).toFixed(0)} KB</td>
                      <td className="px-3 py-2">{formatDate(d.expiryDate)}</td>
                    </tr>
                  ))}
                  {horseDocs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                        No documents uploaded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feed" data-testid="horse-profile-tabpanel-feed" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily feed plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {feedPlan?.feeds.map((f, i) => {
                const product = dataset.inventory.find((it) => it.id === f.feedProductId);
                return (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <span className="font-medium">{f.time}</span>{" "}
                      <span className="text-muted-foreground">{product?.name ?? "—"}</span>
                    </div>
                    <Badge variant="outline">{f.quantityKg} kg</Badge>
                  </div>
                );
              })}
              {!feedPlan && <p className="text-muted-foreground">No feed plan set.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charges" data-testid="horse-profile-tabpanel-charges" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">Date</th>
                    <th className="text-left font-medium px-3 py-2">Description</th>
                    <th className="text-left font-medium px-3 py-2">Qty</th>
                    <th className="text-left font-medium px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {horseCharges.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-3 py-2">{formatDate(c.occurredAt)}</td>
                      <td className="px-3 py-2">{c.description}</td>
                      <td className="px-3 py-2">{c.quantity}</td>
                      <td className="px-3 py-2">{formatGbp(c.unitPricePence * c.quantity)}</td>
                    </tr>
                  ))}
                  {horseCharges.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                        No charges recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" data-testid="horse-profile-tabpanel-activity" className="mt-0">
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              <p>Activity log shows audit history of this horse — moves, package changes, health events, etc.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DetailScaffold>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right truncate">{children}</span>
    </div>
  );
}
