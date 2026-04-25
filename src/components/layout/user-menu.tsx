"use client";

import { LogOut, Sun, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setRole, setSession, useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";
import type { Role } from "@/types";

const ROLE_LABEL: Record<Role, string> = {
  system_admin: "System admin",
  group_admin: "Group admin",
  yard_manager: "Yard manager",
  yard_staff: "Yard staff",
  client_owner: "Client owner",
  visiting_pro: "Visiting professional",
};

const ROLE_ORDER: Role[] = [
  "yard_manager",
  "yard_staff",
  "group_admin",
  "client_owner",
  "visiting_pro",
  "system_admin",
];

export function UserMenu() {
  const dataset = useDataset();
  const session = useSession();
  const router = useRouter();
  const user = dataset.users.find((u) => u.id === session?.userId);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2" data-testid="topbar-user-menu">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            {user.avatarInitials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{ROLE_LABEL[session!.role]}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger data-testid="topbar-user-menu-role-switch">
            <UserCog className="h-4 w-4" /> Switch role (demo)
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {ROLE_ORDER.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => setRole(r)}
                data-testid={`role-switch-${r}`}
              >
                {ROLE_LABEL[r]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem data-testid="topbar-user-menu-darkmode">
          <Sun className="h-4 w-4" /> Toggle theme
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid="topbar-user-menu-signout"
          onClick={() => {
            setSession(null);
            router.push("/login");
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
