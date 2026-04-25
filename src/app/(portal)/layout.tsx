import { Suspense } from "react";

import { AgGridLicense } from "@/components/ag-grid-license";
import { BreadcrumbTrailProvider } from "@/components/layout/breadcrumb-trail-provider";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SessionBootstrap } from "@/components/layout/session-bootstrap";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { PaddyPanel } from "@/components/paddy/paddy-panel";

// Portal pages depend on URL search params (sheet detail state) + in-memory data
// — never prerender statically.
export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionBootstrap>
      <AgGridLicense />
      <BreadcrumbTrailProvider>
        <div className="flex h-screen overflow-hidden bg-[#e5ebf1]">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Suspense fallback={<div className="h-[54px] bg-card border-b border-[#bdccdb]" />}>
              <TopNav />
            </Suspense>
            <main id="main" className="flex flex-1 flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </div>
        <MobileBottomNav />
        <PaddyPanel />
      </BreadcrumbTrailProvider>
    </SessionBootstrap>
  );
}
