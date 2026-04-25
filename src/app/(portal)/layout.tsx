import { AgGridLicense } from "@/components/ag-grid-license";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SessionBootstrap } from "@/components/layout/session-bootstrap";
import { PaddyPanel } from "@/components/paddy/paddy-panel";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Portal pages depend on URL search params (sheet detail state) + in-memory data
// — never prerender statically.
export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionBootstrap>
      <AgGridLicense />
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-svh pb-16 md:pb-0">
          <main id="main" className="flex-1 flex flex-col">
            {children}
          </main>
        </SidebarInset>
        <MobileBottomNav />
        <PaddyPanel />
      </SidebarProvider>
    </SessionBootstrap>
  );
}
