import { BookingsGrid } from "@/components/bookings/bookings-grid";
import { BookingsTabs } from "@/components/bookings/bookings-tabs";

export default function BookingsGridPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <BookingsTabs />
      <BookingsGrid />
    </div>
  );
}
