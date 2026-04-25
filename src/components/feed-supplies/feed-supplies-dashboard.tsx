"use client";

import { AlertTriangle, Package, PackageX, Truck } from "lucide-react";
import { useMemo } from "react";

import { KpiTile } from "@/components/shell/kpi-tile";
import { WidgetCard } from "@/components/shell/widget-card";
import { useSession } from "@/lib/auth/current";
import { formatGbp } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

export function FeedSuppliesDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const items = useMemo(
    () => dataset.inventory.filter((i) => i.tenantId === tenantId),
    [dataset.inventory, tenantId],
  );

  const lowStock = items.filter((i) => i.currentStock > 0 && i.currentStock <= i.lowStockThreshold).length;
  const outOfStock = items.filter((i) => i.currentStock <= 0).length;
  const supplierIds = new Set(items.map((i) => i.preferredSupplierId).filter(Boolean));
  const suppliers = supplierIds.size;

  const topConsumed = useMemo(() => {
    return [...items]
      .sort((a, b) => b.unitCostPence * (b.lowStockThreshold + 1) - a.unitCostPence * (a.lowStockThreshold + 1))
      .slice(0, 8)
      .map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        unit: i.unit,
        cost: i.unitCostPence,
      }));
  }, [items]);

  const byCategory = useMemo(() => {
    const out: Record<string, { count: number; stock: number }> = {};
    for (const i of items) {
      const c = (out[i.category] ??= { count: 0, stock: 0 });
      c.count += 1;
      c.stock += i.currentStock;
    }
    return Object.entries(out).sort((a, b) => b[1].count - a[1].count);
  }, [items]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="Total SKUs"
          value={items.length}
          Icon={Package}
          variant="info"
          testId="feed-supplies-kpi-skus"
        />
        <KpiTile
          label="Low stock"
          value={lowStock}
          Icon={AlertTriangle}
          variant="amber"
          testId="feed-supplies-kpi-low-stock"
        />
        <KpiTile
          label="Out of stock"
          value={outOfStock}
          Icon={PackageX}
          variant="danger"
          testId="feed-supplies-kpi-out-of-stock"
        />
        <KpiTile
          label="Suppliers"
          value={suppliers}
          Icon={Truck}
          variant="neutral"
          testId="feed-supplies-kpi-suppliers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[280px]">
        <WidgetCard title="Top consumed (30 d)">
          <table className="w-full text-sm">
            <tbody>
              {topConsumed.map((it) => (
                <tr key={it.id} className="border-b border-[#e5ebf1] last:border-b-0">
                  <td className="py-2">{it.name}</td>
                  <td className="py-2 text-muted-foreground capitalize">{it.category}</td>
                  <td className="py-2 text-right tabular-nums">{formatGbp(it.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </WidgetCard>

        <WidgetCard title="Stock by category">
          <table className="w-full text-sm">
            <tbody>
              {byCategory.map(([cat, c]) => (
                <tr key={cat} className="border-b border-[#e5ebf1] last:border-b-0">
                  <td className="py-2 capitalize">{cat}</td>
                  <td className="py-2 text-right tabular-nums">{c.count} SKU</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">
                    {c.stock.toLocaleString()} units
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </WidgetCard>
      </div>
    </div>
  );
}
