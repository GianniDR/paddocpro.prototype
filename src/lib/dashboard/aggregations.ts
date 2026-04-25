import { now } from "@/lib/mock/clock";
import type { Dataset } from "@/lib/mock/seed";

const DAY = 86_400_000;

export function dashboardKpis(dataset: Dataset, tenantId: string) {
  const tenantNow = now().getTime();
  const stables = dataset.stables.filter((s) => s.tenantId === tenantId);
  const occupiedStables = stables.filter((s) => s.status === "occupied").length;
  const totalStables = stables.length;

  const todayTasks = dataset.tasks.filter(
    (t) => t.tenantId === tenantId && Math.abs(Date.parse(t.dueAt) - tenantNow) < DAY,
  );
  const tasksDone = todayTasks.filter((t) => t.status === "completed").length;
  const tasksMissed = todayTasks.filter((t) => t.status === "missed").length;

  const vaccOverdue = dataset.healthEvents.filter(
    (e) => e.tenantId === tenantId && e.kind === "vaccination" && e.status === "overdue",
  ).length;

  const outstandingPence = dataset.invoices
    .filter((i) => i.tenantId === tenantId && i.status === "authorised")
    .reduce((s, i) => s + (i.totalPence - i.paidAmountPence), 0);

  return {
    occupancy: { occupied: occupiedStables, total: totalStables },
    todayTasks: { total: todayTasks.length, done: tasksDone, missed: tasksMissed },
    vaccOverdue,
    outstandingPence,
  };
}

export function activityTrend(dataset: Dataset, tenantId: string) {
  // 8 weeks of completed tasks vs bookings
  const tenantNow = now().getTime();
  const weeks: { week: string; tasks: number; bookings: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const start = tenantNow - (w + 1) * 7 * DAY;
    const end = tenantNow - w * 7 * DAY;
    const tasks = dataset.tasks.filter(
      (t) =>
        t.tenantId === tenantId &&
        t.completedAt &&
        Date.parse(t.completedAt) >= start &&
        Date.parse(t.completedAt) < end,
    ).length;
    const bookings = dataset.bookings.filter(
      (b) => b.tenantId === tenantId && Date.parse(b.startAt) >= start && Date.parse(b.startAt) < end,
    ).length;
    weeks.push({ week: `W-${w}`, tasks, bookings });
  }
  return weeks;
}

export function yardHealthScore(dataset: Dataset, tenantId: string): number {
  // Composite: (% horses with current vaccination) average across 3 categories
  const horses = dataset.horses.filter((h) => h.tenantId === tenantId);
  if (horses.length === 0) return 0;
  const tenantNow = now().getTime();
  const cats: Array<"vaccination" | "worming" | "farrier"> = ["vaccination", "worming", "farrier"];
  const scores = cats.map((kind) => {
    const ok = horses.filter((h) => {
      const ev = dataset.healthEvents
        .filter((e) => e.horseId === h.id && e.kind === kind && e.nextDueDate)
        .sort((a, b) => Date.parse(b.eventDate) - Date.parse(a.eventDate))[0];
      return !!ev && Date.parse(ev.nextDueDate!) > tenantNow;
    }).length;
    return ok / horses.length;
  });
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  return Math.round(avg * 100);
}

export function topOverdueHorses(dataset: Dataset, tenantId: string) {
  const horses = dataset.horses.filter((h) => h.tenantId === tenantId);
  const tenantNow = now().getTime();
  return horses
    .map((h) => {
      const overdueEvents = dataset.healthEvents.filter(
        (e) => e.horseId === h.id && e.nextDueDate && Date.parse(e.nextDueDate) < tenantNow,
      ).length;
      return { id: h.id, name: h.stableName, overdue: overdueEvents };
    })
    .filter((x) => x.overdue > 0)
    .sort((a, b) => b.overdue - a.overdue)
    .slice(0, 5);
}

export function todaySchedule(dataset: Dataset, tenantId: string) {
  const tenantNow = now().getTime();
  return dataset.bookings
    .filter((b) => b.tenantId === tenantId && Math.abs(Date.parse(b.startAt) - tenantNow) < DAY)
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
    .slice(0, 6);
}

export function activeAlerts(dataset: Dataset, tenantId: string) {
  const tenantNow = now().getTime();
  type Alert = { id: string; kind: string; title: string; href: string };
  const alerts: Alert[] = [];
  // Vacc overdue
  dataset.healthEvents
    .filter((e) => e.tenantId === tenantId && e.kind === "vaccination" && e.status === "overdue")
    .slice(0, 2)
    .forEach((e) => {
      const horse = dataset.horses.find((h) => h.id === e.horseId);
      if (horse) {
        alerts.push({
          id: e.id,
          kind: "Vaccination overdue",
          title: `${horse.stableName} — ${e.productOrTreatment ?? "vaccine"}`,
          href: `/horses/${horse.id}`,
        });
      }
    });
  // Payment overdue
  dataset.invoices
    .filter((i) => i.tenantId === tenantId && i.status === "authorised" && Date.parse(i.dueAt) < tenantNow)
    .slice(0, 2)
    .forEach((i) => {
      const client = dataset.clients.find((c) => c.id === i.clientId);
      const user = dataset.users.find((u) => u.id === client?.userAccountId);
      alerts.push({
        id: i.id,
        kind: "Payment overdue",
        title: `${i.invoiceNumber} — ${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
        href: `/finance?invoice=${i.id}`,
      });
    });
  // Critical incident
  dataset.incidents
    .filter((i) => i.tenantId === tenantId && i.workflowState !== "closed" && (i.severity === "critical" || i.severity === "serious"))
    .slice(0, 1)
    .forEach((i) =>
      alerts.push({
        id: i.id,
        kind: `${i.severity.charAt(0).toUpperCase() + i.severity.slice(1)} incident`,
        title: i.summary,
        href: `/incidents?id=${i.id}`,
      }),
    );
  return alerts;
}

export function financialStrip(dataset: Dataset, tenantId: string) {
  const tenantNow = now().getTime();
  const startOfMonth = (() => {
    const d = now();
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  })();
  const mtdRevenue = dataset.invoices
    .filter((i) => i.tenantId === tenantId && i.status === "paid" && Date.parse(i.issuedAt) >= startOfMonth)
    .reduce((s, i) => s + i.totalPence, 0);
  const outstandingInvoices = dataset.invoices.filter((i) => i.tenantId === tenantId && i.status === "authorised");
  const aged30 = dataset.invoices.filter(
    (i) => i.tenantId === tenantId && i.status === "authorised" && tenantNow - Date.parse(i.dueAt) > 30 * DAY,
  );
  return {
    mtdRevenuePence: mtdRevenue,
    outstandingInvoiceCount: outstandingInvoices.length,
    outstandingPence: outstandingInvoices.reduce((s, i) => s + (i.totalPence - i.paidAmountPence), 0),
    aged30Count: aged30.length,
    aged30Pence: aged30.reduce((s, i) => s + (i.totalPence - i.paidAmountPence), 0),
  };
}

export function liveryRevenueByTier(dataset: Dataset, tenantId: string) {
  const tenantPackages = dataset.liveryPackages.filter((p) => p.tenantId === tenantId);
  const result: Record<string, number> = { full: 0, part: 0, diy: 0, grass: 0 };
  dataset.invoices
    .filter((i) => i.tenantId === tenantId && i.status === "paid")
    .forEach((inv) => {
      inv.lines.forEach((l) => {
        const pkg = tenantPackages.find((p) => p.xeroItemCode === l.xeroItemCode);
        if (pkg) result[pkg.tier] = (result[pkg.tier] ?? 0) + l.totalPence;
      });
    });
  return Object.entries(result).map(([tier, totalPence]) => ({ tier, totalPence }));
}
