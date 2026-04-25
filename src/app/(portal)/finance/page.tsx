import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import { FinanceTabs } from "@/components/finance/finance-tabs";

export default function FinancePage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FinanceTabs />
      <FinanceDashboard />
    </div>
  );
}
