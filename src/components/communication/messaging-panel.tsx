"use client";

import { MessageSquare, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { newId } from "@/lib/mock/id-prefixes";
import { mutate, useDataset } from "@/lib/mock/store";

export function MessagingPanel() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const tenantThreads = useMemo(
    () =>
      dataset.threads
        .filter((t) => t.tenantId === tenantId)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [dataset.threads, tenantId],
  );

  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    tenantThreads[0]?.id ?? null,
  );
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const activeThread = dataset.threads.find((t) => t.id === activeThreadId);
  const threadMessages = useMemo(() => {
    if (!activeThreadId) return [];
    return dataset.messages
      .filter((m) => m.threadId === activeThreadId)
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  }, [dataset.messages, activeThreadId]);

  async function send() {
    if (!activeThreadId || !draft.trim() || !session) return;
    setSending(true);
    await mutate((d) => {
      const message = {
        id: newId("message", `${activeThreadId}-${Date.now()}`),
        tenantId: tenantId!,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        threadId: activeThreadId,
        authorId: session.userId,
        bodyMarkdown: draft.trim(),
        attachmentDocIds: [],
        readBy: [{ userId: session.userId, readAt: now().toISOString() }],
        acknowledgedBy: [],
      };
      d.messages.push(message);
      const t = d.threads.find((t) => t.id === activeThreadId);
      if (t) t.updatedAt = now().toISOString();
    });
    setDraft("");
    setSending(false);
    toast.success("Message sent");
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[280px_1fr] border rounded-md overflow-hidden bg-card min-h-[480px]"
      data-testid="messaging-panel"
    >
      <aside className="border-r bg-card overflow-y-auto" data-testid="messaging-thread-list">
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground px-3 py-2 border-b">
          Threads
        </h3>
        {tenantThreads.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            No threads yet — start a broadcast or send a message.
          </p>
        ) : (
          <ul>
            {tenantThreads.map((t) => {
              const lastMsg = dataset.messages
                .filter((m) => m.threadId === t.id)
                .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
              const isActive = t.id === activeThreadId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveThreadId(t.id)}
                    data-testid={`messaging-thread-${t.id}`}
                    className={
                      "w-full text-left px-3 py-3 border-b transition " +
                      (isActive ? "bg-primary/10" : "hover:bg-accent/30")
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {t.kind.replace("_", " ")}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {t.participantUserIds.length} pp
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-tight mt-1">
                      {t.subject ?? "(no subject)"}
                    </p>
                    {lastMsg && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {lastMsg.bodyMarkdown}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
      <section className="flex flex-col" data-testid="messaging-thread-view">
        {activeThread ? (
          <>
            <div className="border-b px-4 py-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium truncate">
                  {activeThread.subject ?? "(no subject)"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {activeThread.participantUserIds.length} participants ·{" "}
                  <span className="capitalize">{activeThread.kind.replace("_", " ")}</span>
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {threadMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No messages yet — say hi.
                </p>
              ) : (
                threadMessages.map((m) => {
                  const author = dataset.users.find((u) => u.id === m.authorId);
                  const isOwn = m.authorId === session?.userId;
                  return (
                    <div
                      key={m.id}
                      className={"flex gap-2 " + (isOwn ? "justify-end" : "justify-start")}
                    >
                      {!isOwn && (
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-primary/15 text-primary text-[10px]">
                            {author?.avatarInitials ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={
                          "rounded-lg px-3 py-2 text-sm max-w-[70%] " +
                          (isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border")
                        }
                      >
                        {!isOwn && (
                          <div className="text-[10px] font-medium opacity-80">
                            {author ? `${author.firstName} ${author.lastName}` : "—"}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed">{m.bodyMarkdown}</p>
                        <p className="text-[10px] opacity-60 mt-1">{formatDateTime(m.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) void send();
              }}
              className="border-t p-3 flex gap-2 items-end"
              data-testid="messaging-composer"
            >
              <Textarea
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (draft.trim()) void send();
                  }
                }}
                placeholder="Type a reply…"
                className="resize-none flex-1 text-sm"
                data-testid="messaging-input"
              />
              <Button
                type="submit"
                size="sm"
                disabled={sending || !draft.trim()}
                data-testid="messaging-send"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </>
        ) : (
          <Card className="m-4 border-dashed">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Pick a thread on the left, or start a broadcast to create one.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
