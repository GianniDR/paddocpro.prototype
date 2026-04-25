import { FinanceGrid } from "@/components/finance/finance-grid";
import { FinanceTabs } from "@/components/finance/finance-tabs";

export default function AllInvoicesPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FinanceTabs />
      <FinanceGrid />
    </div>
  );
}
