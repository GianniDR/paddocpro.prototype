"use client";

import { Check, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { mutate, useDataset } from "@/lib/mock/store";
import { cn } from "@/lib/utils";
import type { IncidentWorkflow } from "@/types";

const STAGES: { state: IncidentWorkflow; label: string }[] = [
  { state: "logged", label: "Logged" },
  { state: "under_review", label: "Under Review" },
  { state: "action_taken", label: "Action Taken" },
  { state: "closed", label: "Closed" },
];

export function IncidentWorkflowStepper({ incidentId }: { incidentId: string }) {
  const dataset = useDataset();
  const session = useSession();
  const incident = dataset.incidents.find((i) => i.id === incidentId);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!incident) return null;

  const currentIdx = STAGES.findIndex((s) => s.state === incident.workflowState);
  const nextStage = currentIdx < STAGES.length - 1 ? STAGES[currentIdx + 1] : null;

  async function advance() {
    if (!nextStage) return;
    if (note.trim().length < 10) {
      toast.error("Please add at least 10 characters of notes before advancing.");
      return;
    }
    setSubmitting(true);
    const userId = session?.userId ?? "";
    const fromState = incident!.workflowState;
    const toState = nextStage.state;
    await mutate((d) => {
      const target = d.incidents.find((i) => i.id === incident!.id);
      if (!target) return;
      target.workflowState = toState;
      target.updatedAt = now().toISOString();
      if (toState === "closed") target.resolutionNotes = note.trim();
      target.auditTrail.push({
        at: now().toISOString(),
        byUserId: userId,
        action: "incident.advance_workflow",
        before: { workflowState: fromState },
        after: { workflowState: toState, note: note.trim() },
      });
    });
    setSubmitting(false);
    setNote("");
    toast.success(`Workflow advanced to ${nextStage.label}.`);
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-sm font-medium">Workflow</h3>
        <div className="flex items-center gap-1 flex-wrap">
          {STAGES.map((s, i) => (
            <div key={s.state} className="flex items-center gap-1">
              <Badge
                data-testid={`incident-workflow-stage-${s.state}`}
                className={cn(
                  "gap-1 font-medium",
                  i < currentIdx
                    ? "bg-emerald-500 text-white hover:bg-emerald-500"
                    : i === currentIdx
                      ? "bg-primary text-primary-foreground hover:bg-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted",
                )}
              >
                {i < currentIdx && <Check className="h-3 w-3" />} {s.label}
              </Badge>
              {i < STAGES.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {nextStage ? (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Advance to <span className="font-medium text-foreground">{nextStage.label}</span> — note required (min 10
              chars).
            </p>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`Note for ${nextStage.label}…`}
              data-testid="incident-workflow-note"
            />
            <Button
              size="sm"
              onClick={advance}
              disabled={submitting || note.trim().length < 10}
              data-testid="incident-workflow-advance"
            >
              Advance to {nextStage.label}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground pt-2 border-t">Incident is closed. Resolution: {incident.resolutionNotes}</p>
        )}

        {incident.auditTrail.length > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Audit trail</h4>
            <ol className="space-y-1 text-xs">
              {incident.auditTrail.map((a, i) => (
                <li key={i}>
                  <span className="text-muted-foreground">{formatDateTime(a.at)}</span> ·{" "}
                  <span className="font-medium">{a.action}</span>
                  {a.after && typeof a.after === "object" && "workflowState" in a.after && (
                    <> → <span className="font-medium">{String(a.after.workflowState)}</span></>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
