"use client";

import { Check, Shield, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Role = "yard_manager" | "yard_staff" | "client_owner" | "visiting_pro" | "group_admin";

const ROLES: { id: Role; label: string }[] = [
  { id: "yard_manager", label: "Yard manager" },
  { id: "yard_staff", label: "Yard staff" },
  { id: "client_owner", label: "Client" },
  { id: "visiting_pro", label: "Visiting pro" },
  { id: "group_admin", label: "Group admin" },
];

interface Capability {
  id: string;
  group: string;
  label: string;
}

const CAPABILITIES: Capability[] = [
  { id: "horses.view", group: "Horses", label: "View horses" },
  { id: "horses.create", group: "Horses", label: "Create horse" },
  { id: "horses.edit", group: "Horses", label: "Edit horse" },
  { id: "horses.archive", group: "Horses", label: "Archive horse" },
  { id: "clients.view", group: "Clients", label: "View clients" },
  { id: "clients.medical_notes.view", group: "Clients", label: "View medical notes" },
  { id: "clients.payment_methods.edit", group: "Clients", label: "Edit payment methods" },
  { id: "stables.maintenance", group: "Stables", label: "Manage maintenance" },
  { id: "bookings.create", group: "Bookings", label: "Create booking" },
  { id: "bookings.cancel", group: "Bookings", label: "Cancel booking" },
  { id: "tasks.complete", group: "Tasks", label: "Complete task" },
  { id: "tasks.assign", group: "Tasks", label: "Assign task" },
  { id: "health.event.log", group: "Health", label: "Log health event" },
  { id: "health.isolation.mark", group: "Health", label: "Mark isolating" },
  { id: "incidents.log", group: "Incidents", label: "Log incident" },
  { id: "incidents.advance_workflow", group: "Incidents", label: "Advance workflow" },
  { id: "incidents.confidential.view", group: "Incidents", label: "View confidential" },
  { id: "finance.charge.create", group: "Finance", label: "Record charge" },
  { id: "finance.invoice.run_monthly", group: "Finance", label: "Run monthly invoicing" },
  { id: "finance.payment.record", group: "Finance", label: "Record payment" },
  { id: "settings.users.manage", group: "Settings", label: "Manage users" },
  { id: "settings.rbac.edit", group: "Settings", label: "Edit RBAC" },
  { id: "settings.gdpr.run_sar", group: "Settings", label: "Run SAR" },
];

// Default grants based on the canonical rbac-catalogue
const DEFAULTS: Record<string, Record<Role, boolean>> = {};
const fullForRole: Role[] = ["yard_manager", "group_admin"];
const limitedForStaff: string[] = [
  "horses.view",
  "clients.view",
  "stables.maintenance",
  "bookings.create",
  "bookings.cancel",
  "tasks.complete",
  "tasks.assign",
  "health.event.log",
  "health.isolation.mark",
  "incidents.log",
];
const limitedForClient: string[] = ["horses.view", "bookings.create", "bookings.cancel"];
const limitedForPro: string[] = ["horses.view", "health.event.log"];

CAPABILITIES.forEach((c) => {
  DEFAULTS[c.id] = {
    yard_manager: fullForRole.includes("yard_manager"),
    group_admin: fullForRole.includes("group_admin"),
    yard_staff: limitedForStaff.includes(c.id),
    client_owner: limitedForClient.includes(c.id),
    visiting_pro: limitedForPro.includes(c.id),
  };
});

export function RbacMatrix() {
  const [matrix, setMatrix] = useState<Record<string, Record<Role, boolean>>>(() => structuredClone(DEFAULTS));

  function toggle(capability: string, role: Role) {
    setMatrix((prev) => ({
      ...prev,
      [capability]: { ...prev[capability], [role]: !prev[capability][role] },
    }));
    toast.success(`${role.replace("_", " ")} can now ${matrix[capability][role] ? "no longer " : ""}use ${capability}`);
  }

  function reset() {
    setMatrix(structuredClone(DEFAULTS));
    toast.success("Reset to default permissions");
  }

  // Group capabilities by section for display
  const groups = Array.from(new Set(CAPABILITIES.map((c) => c.group)));

  return (
    <div className="p-4 pb-12 flex-1 max-w-6xl space-y-4" data-testid="rbac-matrix">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-xl font-display italic font-semibold">Roles & permissions</h1>
          <p className="text-sm text-muted-foreground">
            Toggle which capabilities each role can use. Changes persist for the session.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-xs hover:bg-accent transition"
          data-testid="rbac-reset"
        >
          Reset to defaults
        </button>
      </div>

      {groups.map((group) => (
        <Card key={group} data-testid={`rbac-group-${group.toLowerCase()}`}>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left font-medium px-3 py-2 sticky left-0 bg-muted/40 z-10">
                    {group}
                  </th>
                  {ROLES.map((r) => (
                    <th key={r.id} className="text-center font-medium px-3 py-2 text-xs">
                      {r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAPABILITIES.filter((c) => c.group === group).map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2 sticky left-0 bg-card z-10">
                      <span className="font-medium">{c.label}</span>
                      <div className="text-[10px] text-muted-foreground font-mono">{c.id}</div>
                    </td>
                    {ROLES.map((r) => {
                      const granted = matrix[c.id]?.[r.id] ?? false;
                      return (
                        <td key={r.id} className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => toggle(c.id, r.id)}
                            data-testid={`rbac-cell-${c.id}-${r.id}`}
                            className={cn(
                              "inline-flex h-7 w-7 items-center justify-center rounded-md border transition",
                              granted
                                ? "bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200"
                                : "bg-muted/40 border-border text-muted-foreground hover:bg-muted",
                            )}
                            aria-label={`${r.label} ${granted ? "can" : "cannot"} ${c.label}`}
                          >
                            {granted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 opacity-40" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Badge variant="outline">{CAPABILITIES.length} capabilities</Badge>
        <Badge variant="outline">{ROLES.length} roles</Badge>
        <Badge variant="outline">
          {Object.values(matrix).reduce(
            (s, row) => s + Object.values(row).filter(Boolean).length,
            0,
          )}{" "}
          grants
        </Badge>
      </div>
    </div>
  );
}

