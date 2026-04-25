import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  DoorOpen,
  FolderOpen,
  Gauge,
  Grid3x3,
  HeartPulse,
  Home,
  ListChecks,
  type LucideIcon,
  MessageSquare,
  Receipt,
  Settings,
  Sparkles,
  UserCog,
  Users,
  Wheat,
} from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
  Icon?: LucideIcon;
}

const SEGMENT_LABEL: Record<string, { label: string; Icon?: LucideIcon }> = {
  home: { label: "Home", Icon: Home },
  dashboard: { label: "Home", Icon: Home },
  horses: { label: "Horses", Icon: Sparkles },
  "all-horses": { label: "All horses", Icon: Grid3x3 },
  clients: { label: "Clients", Icon: Users },
  "all-clients": { label: "All clients", Icon: Grid3x3 },
  stables: { label: "Stables & Paddocks", Icon: Grid3x3 },
  "all-stables": { label: "All stables", Icon: Grid3x3 },
  bookings: { label: "Bookings", Icon: CalendarDays },
  "all-bookings": { label: "All bookings", Icon: Grid3x3 },
  tasks: { label: "Tasks", Icon: ListChecks },
  "all-tasks": { label: "All tasks", Icon: Grid3x3 },
  health: { label: "Health", Icon: HeartPulse },
  "all-events": { label: "All events", Icon: Grid3x3 },
  "feed-supplies": { label: "Feed & Supplies", Icon: Wheat },
  "all-supplies": { label: "All supplies", Icon: Grid3x3 },
  staff: { label: "Staff", Icon: UserCog },
  "all-staff": { label: "All staff", Icon: Grid3x3 },
  documents: { label: "Documents", Icon: FolderOpen },
  "all-documents": { label: "All documents", Icon: Grid3x3 },
  communication: { label: "Communication", Icon: MessageSquare },
  "all-threads": { label: "All threads", Icon: Grid3x3 },
  notifications: { label: "Notifications", Icon: MessageSquare },
  incidents: { label: "Incidents", Icon: AlertTriangle },
  "all-incidents": { label: "All incidents", Icon: Grid3x3 },
  visitors: { label: "Visitors", Icon: DoorOpen },
  "all-visitors": { label: "All visitors", Icon: Grid3x3 },
  finance: { label: "Finance", Icon: Receipt },
  "all-invoices": { label: "All invoices", Icon: Grid3x3 },
  reports: { label: "Reports", Icon: BarChart3 },
  settings: { label: "Settings", Icon: Settings },
  "yard-profile": { label: "Yard profile", Icon: Settings },
  users: { label: "Users & roles", Icon: Users },
  rbac: { label: "Roles & permissions", Icon: Settings },
  xero: { label: "Xero", Icon: Settings },
  integrations: { label: "Integrations", Icon: Settings },
  "audit-log": { label: "Audit log", Icon: Settings },
  "ask-paddy": { label: "Ask Paddy", Icon: Sparkles },
  insights: { label: "Insights", Icon: Sparkles },
  overview: { label: "Overview", Icon: Gauge },
  new: { label: "New" },
};

export function buildCrumbs(
  pathname: string,
  _params?: URLSearchParams,
  entityLabels?: Map<string, string>,
): Crumb[] {
  void _params;
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let acc = "";
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    acc += "/" + seg;
    const meta = SEGMENT_LABEL[seg];
    if (meta) {
      crumbs.push({
        label: meta.label,
        href: i < parts.length - 1 ? acc : undefined,
        Icon: meta.Icon,
      });
      continue;
    }
    const entityLabel = entityLabels?.get(seg);
    crumbs.push({ label: entityLabel ?? seg, href: i < parts.length - 1 ? acc : undefined });
  }
  return crumbs;
}
