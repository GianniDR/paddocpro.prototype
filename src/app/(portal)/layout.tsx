import { AgGridLicense } from "@/components/ag-grid-license";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SessionBootstrap } from "@/components/layout/session-bootstrap";
import { PaddyPanel } from "@/components/paddy/paddy-panel";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionBootstrap>
      <AgGridLicense />
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-svh">
          <main id="main" className="flex-1 flex flex-col">
            {children}
          </main>
        </SidebarInset>
        <PaddyPanel />
      </SidebarProvider>
    </SessionBootstrap>
  );
}
