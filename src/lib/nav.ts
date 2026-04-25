import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  DoorOpen,
  FileText,
  FolderOpen,
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

export interface NavLeaf {
  slug: string;
  label: string;
  route: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
}

export const PRIMARY_NAV: (NavLeaf | NavGroup)[] = [
  { slug: "home", label: "Home", route: "/dashboard", icon: Home },
  { slug: "horses", label: "Horses", route: "/horses", icon: Sparkles },
  { slug: "clients", label: "Clients", route: "/clients", icon: Users },
  { slug: "stables", label: "Stables & Paddocks", route: "/stables", icon: Grid3x3 },
  { slug: "bookings", label: "Bookings", route: "/bookings", icon: CalendarDays },
  { slug: "tasks", label: "Tasks", route: "/tasks", icon: ListChecks },
  { slug: "health", label: "Health", route: "/health", icon: HeartPulse },
  { slug: "feed-supplies", label: "Feed & Supplies", route: "/feed-supplies", icon: Wheat },
  { slug: "staff", label: "Staff", route: "/staff", icon: UserCog },
  { slug: "documents", label: "Documents", route: "/documents", icon: FolderOpen },
  { slug: "communication", label: "Communication", route: "/communication", icon: MessageSquare },
  { slug: "incidents", label: "Incidents", route: "/incidents", icon: AlertTriangle },
  { slug: "visitors", label: "Visitors", route: "/visitors", icon: DoorOpen },
  { slug: "finance", label: "Finance", route: "/finance", icon: Receipt },
  { slug: "reports", label: "Reports", route: "/reports", icon: BarChart3 },
];

export const SETTINGS_NAV: NavGroup = {
  label: "Settings",
  icon: Settings,
  children: [
    { slug: "yard-profile", label: "Yard profile", route: "/settings/yard-profile", icon: Settings },
    { slug: "users", label: "Users & roles", route: "/settings/users", icon: Users },
    { slug: "rbac", label: "Roles & permissions", route: "/settings/rbac", icon: Settings },
    { slug: "xero", label: "Xero", route: "/settings/xero", icon: FileText },
    { slug: "integrations", label: "Integrations", route: "/settings/integrations", icon: Settings },
    { slug: "audit", label: "Audit log", route: "/settings/audit-log", icon: FileText },
  ],
};
