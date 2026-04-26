"use client";

import {
  ArrowRightLeft,
  ChevronLeft,
  Edit,
  Grid3x3,
  History,
  MoreVertical,
  Sparkles,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DetailScaffold } from "@/components/shell/detail-scaffold";
import { type DetailTab, DetailTabBar } from "@/components/shell/detail-tab-bar";
import { DetailToolbar } from "@/components/shell/detail-toolbar";
import { StatusBadge } from "@/components/shell/status-badge";
import { MarkMaintenanceDialog } from "@/components/stables/mark-maintenance-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";
import type { Stable } from "@/types";

export function StableProfile({ stableId }: { stableId: string }) {
  const dataset = useDataset();
  const stable = dataset.stables.find((s) => s.id === stableId);

  if (!stable) {
    return (
      <div className="p-6">
        <Card className="max-w-xl">
          <CardContent className="p-6 space-y-3">
            <p className="text-sm">We couldn&apos;t find that stable.</p>
            <Button render={<Link href="/stables" />} variant="outline" size="sm">
              <ChevronLeft className="h-3.5 w-3.5" /> Back to stables
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <StableProfileBody stable={stable} />;
}

function StableProfileBody({ stable }: { stable: Stable }) {
  const dataset = useDataset();
  const occupant = stable.currentHorseId
    ? dataset.horses.find((h) => h.id === stable.currentHorseId)
    : null;

  const movements = useMemo(
    () =>
      dataset.movements
        .filter((m) => m.to.stableId === stable.id || m.from.stableId === stable.id)
        .sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
    [dataset.movements, stable.id],
  );

  const [tab, setTab] = useState("profile");
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);

  const isOccupied = stable.status === "occupied";
  const isMaintenance = stable.status === "maintenance";

  const subtitle = `${stable.designation} · ${stable.dimensions} · ${stable.defaultBeddingType} bedding`;

  const tabs: DetailTab[] = [
    { value: "profile", label: "Profile", testId: "stable-profile-tab-profile" },
    {
      value: "movement",
      label: "Movement history",
      Icon: History,
      count: movements.length,
      testId: "stable-profile-tab-movement",
    },
    { value: "activity", label: "Activity", testId: "stable-profile-tab-activity" },
  ];

  const toolbar = (
    <DetailToolbar testId="stable-profile-toolbar">
      <Button
        variant="outline"
        size="sm"
        className="bg-white border-[#202228] text-[#202228] hover:bg-[#f2f5f8]"
        data-testid="stable-profile-toolbar-paddy"
        onClick={() => {
          if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("paddy:toggle"));
        }}
      >
        <Sparkles className="h-3.5 w-3.5" /> Ask Paddy
      </Button>
      <Button
        size="sm"
        className="bg-[#202228] text-white hover:bg-[#2c3038]"
        data-testid="stable-profile-toolbar-mark-maintenance"
        onClick={() => setMaintenanceOpen(true)}
      >
        <Wrench className="h-3.5 w-3.5" /> {isMaintenance ? "End maintenance" : "Mark maintenance"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="size-9 p-0 bg-white border-[#202228]"
              aria-label="More actions"
              data-testid="stable-profile-toolbar-more"
            >
              <MoreVertical size={16} />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => toast("Edit — coming soon")}
            data-testid="stable-profile-toolbar-edit"
          >
            <Edit size={14} /> Edit
          </DropdownMenuItem>
          {isOccupied && (
            <DropdownMenuItem
              onClick={() => toast("Move horse out — coming soon")}
              data-testid="stable-profile-toolbar-move-horse"
            >
              <ArrowRightLeft size={14} /> Move horse out
            </DropdownMenuItem>
          )}
          {isOccupied && (
            <DropdownMenuItem
              onClick={() => toast("Reassign occupant first")}
              data-testid="stable-profile-toolbar-mark-out-of-service"
            >
              <Wrench size={14} /> Mark out of service
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <MarkMaintenanceDialog
        stableId={stable.id}
        open={maintenanceOpen}
        onOpenChange={setMaintenanceOpen}
      />
    </DetailToolbar>
  );

  return (
    <DetailScaffold
      title={`Stable ${stable.block} ${stable.number}`}
      subtitle={subtitle}
      Icon={Grid3x3}
      tabs={[]}
      stickyToolbar={toolbar}
    >
      <div className="flex-1 flex flex-col w-full min-w-0">
        <div className="flex flex-wrap gap-2 mb-3">
          <StatusBadge status={stable.status} />
          <Badge variant="outline" className="font-normal">
            {stable.designation}
          </Badge>
          <Badge variant="outline" className="font-normal">
            Block {stable.block}
          </Badge>
          {occupant && (
            <Badge variant="outline" className="font-normal">
              Occupant: {occupant.stableName}
            </Badge>
          )}
        </div>

        <DetailTabBar
          tabs={tabs}
          active={tab}
          onChange={setTab}
          testId="stable-profile-tabs"
          className="-mx-4 mb-3"
        />

        {tab === "profile" && (
          <div data-testid="stable-profile-tabpanel-profile" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Stable details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Field label="Block">{stable.block}</Field>
                  <Field label="Number">{stable.number}</Field>
                  <Field label="Dimensions">{stable.dimensions}</Field>
                  <Field label="Designation">{stable.designation}</Field>
                  <Field label="Default bedding">{stable.defaultBeddingType}</Field>
                  <Separator />
                  <Field label="Status">
                    <StatusBadge status={stable.status} />
                  </Field>
                  <Field label="Currently housing">
                    {occupant ? (
                      <Link
                        href={`/horses/${occupant.id}`}
                        className="text-primary hover:underline"
                        data-testid={`drill-horse-${occupant.id}`}
                      >
                        {occupant.stableName}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </Field>
                </CardContent>
              </Card>
              {isMaintenance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Out of service</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <Field label="Reason">{stable.outOfServiceReason ?? "—"}</Field>
                    <Field label="Expected return">{formatDate(stable.outOfServiceUntil)}</Field>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {tab === "movement" && (
          <div data-testid="stable-profile-tabpanel-movement" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">When</th>
                      <th className="text-left font-medium px-3 py-2">Horse</th>
                      <th className="text-left font-medium px-3 py-2">Direction</th>
                      <th className="text-left font-medium px-3 py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m) => {
                      const horse = dataset.horses.find((h) => h.id === m.horseId);
                      const direction =
                        m.to.stableId === stable.id ? "Moved in" : "Moved out";
                      return (
                        <tr key={m.id} className="border-t">
                          <td className="px-3 py-2">{formatDateTime(m.at)}</td>
                          <td className="px-3 py-2">
                            {horse ? (
                              <Link
                                href={`/horses/${horse.id}`}
                                className="text-primary hover:underline"
                                data-testid={`drill-horse-${horse.id}`}
                              >
                                {horse.stableName}
                              </Link>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-3 py-2">{direction}</td>
                          <td className="px-3 py-2">{m.reason ?? "—"}</td>
                        </tr>
                      );
                    })}
                    {movements.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                          No prior occupants recorded
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "activity" && (
          <div data-testid="stable-profile-tabpanel-activity" className="mt-0">
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                <p>Activity log shows audit history of this stable.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
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
