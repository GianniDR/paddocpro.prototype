"use client";

import { Send, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth/current";
import { formatGbp } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";
import type { Horse } from "@/types";

interface Cite {
  label: string;
  href: string;
}

interface PaddyMsg {
  id: string;
  role: "user" | "assistant";
  body: string;
  cites?: Cite[];
}

const SUGGESTIONS = [
  "Which horses are overdue for vaccinations?",
  "What's happening on the yard today?",
  "Show me outstanding invoices",
];

export function PaddyPanel() {
  const dataset = useDataset();
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<PaddyMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const tenant = dataset.tenants.find((t) => t.id === tenantId);

  // Toggle on event + ⌘J
  useEffect(() => {
    const onToggle = () => setOpen((o) => !o);
    window.addEventListener("paddy:toggle", onToggle);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("paddy:toggle", onToggle);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  function ask(prompt: string) {
    setMessages((m) => [
      ...m,
      { id: `u_${m.length}_${prompt.length}`, role: "user", body: prompt },
    ]);
    setInput("");
    setStreaming(true);
    setTimeout(() => {
      const reply = respond(prompt, dataset, tenantId);
      setMessages((m) => [
        ...m,
        {
          id: `a_${m.length}_${reply.body.length}`,
          role: "assistant",
          body: reply.body,
          cites: reply.cites,
        },
      ]);
      setStreaming(false);
    }, 600);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[520px] p-0 flex flex-col bg-card"
        data-testid="paddy-panel"
      >
        <SheetHeader className="px-4 py-3 border-b flex-row items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          <SheetTitle className="text-sm font-medium">Paddy</SheetTitle>
          <span className="text-xs text-muted-foreground">{tenant?.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 w-7 p-0"
            onClick={() => setOpen(false)}
            data-testid="paddy-panel-close"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </SheetHeader>

        <div className="px-4 py-2 border-b text-xs text-muted-foreground bg-accent/30">
          Paddy reads {tenant?.name} records only. Cross-yard queries are blocked.
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Ask Paddy anything about the yard. Try:
              </p>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  data-testid={`paddy-composer-suggestion-${i}`}
                  className="block w-full text-left rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent/40 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              data-testid={`paddy-msg-${m.id}`}
              className={
                "flex gap-2 " + (m.role === "user" ? "justify-end" : "justify-start")
              }
            >
              {m.role === "assistant" && (
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                    P
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={
                  "rounded-lg px-3 py-2 text-sm max-w-[85%] " +
                  (m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent/40")
                }
              >
                <div className="whitespace-pre-wrap">{m.body}</div>
                {m.cites && m.cites.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.cites.map((c, i) => (
                      <Link
                        key={i}
                        href={c.href}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center"
                      >
                        <Badge variant="secondary" className="hover:bg-primary/10 cursor-pointer">
                          {c.label}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {streaming && (
            <div className="flex gap-2">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">P</AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-3 py-2 text-sm bg-accent/40">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-pulse" />
                  <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-pulse [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-pulse [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim() || streaming) return;
            ask(input.trim());
          }}
          className="border-t p-3 flex gap-2 items-end"
          data-testid="paddy-composer"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !streaming) ask(input.trim());
              }
            }}
            placeholder="Ask Paddy about the yard…"
            rows={2}
            className="resize-none flex-1 text-sm"
            data-testid="paddy-composer-input"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || streaming}
            data-testid="paddy-composer-send"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function respond(
  prompt: string,
  dataset: ReturnType<typeof useDataset>,
  tenantId: string | undefined,
): { body: string; cites: Cite[] } {
  const lower = prompt.toLowerCase();
  if (!tenantId) return { body: "I need a yard to be active first.", cites: [] };

  if (lower.includes("vacc") || lower.includes("vaccin")) {
    const overdue = dataset.healthEvents
      .filter((e) => e.tenantId === tenantId && e.kind === "vaccination" && e.status === "overdue")
      .map((e) => dataset.horses.find((h) => h.id === e.horseId))
      .filter((h): h is Horse => !!h);
    if (overdue.length === 0)
      return { body: `Good news — no horses are overdue for vaccinations at ${dataset.tenants.find((t) => t.id === tenantId)?.name}.`, cites: [] };
    const body =
      `${overdue.length} ${overdue.length === 1 ? "horse is" : "horses are"} overdue for vaccinations:\n\n` +
      overdue.map((h) => `• ${h.stableName}`).join("\n") +
      `\n\nClick any name below to open the profile.`;
    return {
      body,
      cites: overdue.map((h) => ({ label: h.stableName, href: `/horses/${h.id}` })),
    };
  }

  if (lower.includes("today") || lower.includes("happening")) {
    const tasks = dataset.tasks.filter((t) => t.tenantId === tenantId && t.dueAt.startsWith("2026-04-25"));
    const bookings = dataset.bookings.filter((b) => b.tenantId === tenantId && b.startAt.startsWith("2026-04-25"));
    const incidents = dataset.incidents.filter((i) => i.tenantId === tenantId && i.workflowState !== "closed");
    const body = `Saturday at ${dataset.tenants.find((t) => t.id === tenantId)?.name}:\n\n• ${tasks.length} tasks scheduled (${tasks.filter((t) => t.status === "completed").length} done, ${tasks.filter((t) => t.status === "missed").length} missed).\n• ${bookings.length} bookings on the calendar today.\n• ${incidents.length} open incident${incidents.length === 1 ? "" : "s"} to track.`;
    return { body, cites: [{ label: "Open today's tasks", href: "/tasks" }, { label: "Open bookings", href: "/bookings" }] };
  }

  if (lower.includes("invoice") || lower.includes("outstanding") || lower.includes("payment")) {
    const unpaid = dataset.invoices.filter((i) => i.tenantId === tenantId && i.status === "authorised");
    const total = unpaid.reduce((s, i) => s + (i.totalPence - i.paidAmountPence), 0);
    return {
      body: `${unpaid.length} unpaid invoice${unpaid.length === 1 ? "" : "s"}, totalling ${formatGbp(total)}. Need a hand running monthly invoicing?`,
      cites: [{ label: "Open finance", href: "/finance" }],
    };
  }

  // Hallucination guard — try to find an entity named in the prompt
  const known = dataset.horses
    .filter((h) => h.tenantId === tenantId)
    .find((h) => lower.includes(h.stableName.toLowerCase()));
  if (known) {
    const upcoming = dataset.healthEvents
      .filter((e) => e.horseId === known.id && e.nextDueDate)
      .sort((a, b) => Date.parse(a.nextDueDate!) - Date.parse(b.nextDueDate!))[0];
    return {
      body: `${known.stableName} (${known.registeredName}) — ${known.healthStatus}. ${upcoming ? `Next ${upcoming.kind.replace("_", " ")} due ${new Date(upcoming.nextDueDate!).toLocaleDateString("en-GB")}.` : ""}`,
      cites: [{ label: known.stableName, href: `/horses/${known.id}` }],
    };
  }

  // Default fallback
  return {
    body: `I checked the records but couldn't pin down an answer to "${prompt}". Try asking about overdue vaccinations, today's tasks, or outstanding invoices.`,
    cites: [],
  };
}
