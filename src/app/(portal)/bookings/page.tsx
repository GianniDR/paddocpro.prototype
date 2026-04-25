import { BookingsDashboard } from "@/components/bookings/bookings-dashboard";
import { BookingsTabs } from "@/components/bookings/bookings-tabs";

export default function BookingsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <BookingsTabs />
      <BookingsDashboard />
    </div>
  );
}
