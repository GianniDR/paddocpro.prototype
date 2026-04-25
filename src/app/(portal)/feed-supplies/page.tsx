import { FeedSuppliesDashboard } from "@/components/feed-supplies/feed-supplies-dashboard";
import { FeedSuppliesTabs } from "@/components/feed-supplies/feed-supplies-tabs";

export default function FeedSuppliesPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FeedSuppliesTabs />
      <FeedSuppliesDashboard />
    </div>
  );
}
