"use client";

import { Megaphone, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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

type Audience = "all_clients" | "yard_staff" | "full_livery_clients" | "diy_livery_clients";

const AUDIENCE_LABEL: Record<Audience, string> = {
  all_clients: "All clients",
  yard_staff: "Yard staff",
  full_livery_clients: "Full Livery clients",
  diy_livery_clients: "DIY Livery clients",
};

interface BroadcastDialogProps {
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
}

export function BroadcastDialog({
  open: openProp,
  onOpenChange,
}: BroadcastDialogProps = {}) {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    if (openProp === undefined) setInternalOpen(v);
  };
  const [audience, setAudience] = useState<Audience>("all_clients");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const recipients = useMemo(() => {
    if (!tenantId) return [];
    if (audience === "yard_staff")
      return dataset.users.filter((u) => u.tenantId === tenantId && u.role !== "client_owner");
    if (audience === "all_clients")
      return dataset.users.filter((u) => u.tenantId === tenantId && u.role === "client_owner");
    // Livery tier filter
    const tier = audience === "full_livery_clients" ? "full" : "diy";
    const horsesInTier = dataset.horses.filter((h) => {
      const pkg = dataset.liveryPackages.find((p) => p.id === h.liveryPackageId);
      return pkg?.tier === tier && h.tenantId === tenantId;
    });
    const ownerIds = new Set<string>();
    horsesInTier.forEach((h) => {
      const c = dataset.clients.find((c) => c.id === h.primaryOwnerId);
      if (c) ownerIds.add(c.userAccountId);
    });
    return dataset.users.filter((u) => ownerIds.has(u.id));
  }, [audience, dataset, tenantId]);

  function reset() {
    setAudience("all_clients");
    setSubject("");
    setBody("");
  }

  async function send() {
    if (!tenantId || recipients.length === 0) return;
    setSubmitting(true);
    await mutate((d) => {
      const threadId = newId("thread", `bcast-${Date.now()}`);
      d.threads.unshift({
        id: threadId,
        tenantId,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        participantUserIds: recipients.map((r) => r.id),
        subject,
        kind: audience === "yard_staff" ? "yard_broadcast" : "group_clients",
        pinnedToNoticeBoard: false,
      });
      const messageId = newId("message", threadId);
      d.messages.unshift({
        id: messageId,
        tenantId,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        threadId,
        authorId: session?.userId ?? "",
        bodyMarkdown: body,
        attachmentDocIds: [],
        readBy: [],
        acknowledgedBy: [],
      });
      // Notification dispatches per recipient
      for (const r of recipients) {
        d.notifications.unshift({
          id: newId("notification", `bcast-${threadId}-${r.id}`),
          tenantId,
          createdAt: now().toISOString(),
          updatedAt: now().toISOString(),
          recipientUserId: r.id,
          category: "announcement",
          channel: "email",
          subject: subject || "Yard announcement",
          body,
          relatedEntityType: "thread",
          relatedEntityId: threadId,
          state: "sent",
          sentAt: now().toISOString(),
          deliveredAt: now().toISOString(),
          readAt: null,
        });
      }
    });
    setSubmitting(false);
    toast.success(`Broadcast sent to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}`);
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
      {openProp === undefined && (
        <DialogTrigger
          render={
            <Button size="sm" data-testid="comms-broadcast-trigger">
              <Megaphone className="h-3.5 w-3.5" /> New broadcast
            </Button>
          }
        />
      )}
      <DialogContent className="max-w-lg" data-testid="dialog-broadcast">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" /> New broadcast
          </DialogTitle>
          <DialogDescription>
            Send a message to all clients, all staff, or a livery tier — dispatched as in-app +
            email.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={(v) => v && setAudience(v as Audience)}>
              <SelectTrigger data-testid="dialog-broadcast-audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => (
                  <SelectItem key={a} value={a}>
                    {AUDIENCE_LABEL[a]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 pt-1">
              <Badge variant="secondary" data-testid="dialog-broadcast-recipient-count">
                {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
              </Badge>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Farrier visit Friday"
              data-testid="dialog-broadcast-subject"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Please bring horses in by 09:00 on Friday for the farrier round."
              data-testid="dialog-broadcast-body"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="dialog-broadcast-cancel">
            Cancel
          </Button>
          <Button
            onClick={send}
            disabled={submitting || subject.trim().length < 3 || body.trim().length < 5 || recipients.length === 0}
            data-testid="dialog-broadcast-send"
          >
            <Send className="h-3.5 w-3.5" /> {submitting ? "Sending…" : "Send broadcast"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
