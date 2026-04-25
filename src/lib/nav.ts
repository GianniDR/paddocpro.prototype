import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  DoorOpen,
  FolderOpen,
  Grid3x3,
  HeartPulse,
  LayoutDashboard,
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

export interface NavEntry {
  slug: string;
  label: string;
  icon: LucideIcon;
  route: string;
}

export const PRIMARY_NAV: NavEntry[] = [
  { slug: "dashboard", label: "Overview", icon: LayoutDashboard, route: "/dashboard" },
  { slug: "horses", label: "Horses", icon: Sparkles, route: "/horses" },
  { slug: "clients", label: "Clients", icon: Users, route: "/clients" },
  { slug: "stables", label: "Stables & Paddocks", icon: Grid3x3, route: "/stables" },
  { slug: "bookings", label: "Bookings", icon: CalendarDays, route: "/bookings" },
  { slug: "tasks", label: "Tasks", icon: ListChecks, route: "/tasks" },
  { slug: "health", label: "Health", icon: HeartPulse, route: "/health" },
  { slug: "feed-supplies", label: "Feed & Supplies", icon: Wheat, route: "/feed-supplies" },
  { slug: "staff", label: "Staff", icon: UserCog, route: "/staff" },
  { slug: "documents", label: "Documents", icon: FolderOpen, route: "/documents" },
  { slug: "communication", label: "Communication", icon: MessageSquare, route: "/communication" },
  { slug: "incidents", label: "Incidents", icon: AlertTriangle, route: "/incidents" },
  { slug: "visitors", label: "Visitors", icon: DoorOpen, route: "/visitors" },
  { slug: "finance", label: "Finance", icon: Receipt, route: "/finance" },
  { slug: "reports", label: "Reports", icon: BarChart3, route: "/reports" },
];

export const SETTINGS_NAV: NavEntry = {
  slug: "settings",
  label: "Settings",
  icon: Settings,
  route: "/settings",
};
