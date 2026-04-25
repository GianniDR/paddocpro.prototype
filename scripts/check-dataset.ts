import { MOCK_DATASET } from "../src/lib/mock/seed";

const counts = {
  tenants: MOCK_DATASET.tenants.length,
  users: MOCK_DATASET.users.length,
  clients: MOCK_DATASET.clients.length,
  horses: MOCK_DATASET.horses.length,
  stables: MOCK_DATASET.stables.length,
  paddocks: MOCK_DATASET.paddocks.length,
  liveryPackages: MOCK_DATASET.liveryPackages.length,
  resources: MOCK_DATASET.resources.length,
  bookings: MOCK_DATASET.bookings.length,
  tasks: MOCK_DATASET.tasks.length,
  healthEvents: MOCK_DATASET.healthEvents.length,
  invoices: MOCK_DATASET.invoices.length,
  payments: MOCK_DATASET.payments.length,
  documents: MOCK_DATASET.documents.length,
  incidents: MOCK_DATASET.incidents.length,
  visitors: MOCK_DATASET.visitors.length,
  inventory: MOCK_DATASET.inventory.length,
};

console.log(JSON.stringify(counts, null, 2));
console.log("\nFirst tenant:", MOCK_DATASET.tenants[0]?.name, MOCK_DATASET.tenants[0]?.id);
console.log("First horse:", MOCK_DATASET.horses[0]?.stableName, MOCK_DATASET.horses[0]?.id);

const refOK = MOCK_DATASET.horses.every((h) => MOCK_DATASET.clients.find((c) => c.id === h.primaryOwnerId));
console.log("All horses have valid owner:", refOK);
const stableOK = MOCK_DATASET.horses.filter((h) => h.currentStableId).every((h) =>
  MOCK_DATASET.stables.find((s) => s.id === h.currentStableId)
);
console.log("All assigned horses have valid stable:", stableOK);
