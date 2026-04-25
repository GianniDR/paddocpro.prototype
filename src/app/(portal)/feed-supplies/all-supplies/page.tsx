import { FeedGrid } from "@/components/feed-supplies/feed-grid";
import { FeedSuppliesTabs } from "@/components/feed-supplies/feed-supplies-tabs";

export default function FeedSuppliesAllPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FeedSuppliesTabs />
      <FeedGrid />
    </div>
  );
}
