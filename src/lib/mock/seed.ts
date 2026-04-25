import { faker } from "@faker-js/faker/locale/en_GB";

import type {
  Booking,
  Charge,
  ClientProfile,
  CreditNote,
  DocumentRecord,
  FeedPlan,
  HealthEvent,
  Horse,
  IncidentRecord,
  InventoryItem,
  Invoice,
  LiveryAddOn,
  LiveryPackage,
  Message,
  MessageThread,
  MovementHistory,
  NotificationDispatch,
  Paddock,
  PaddockRotationGroup,
  Payment,
  Prescription,
  PurchaseOrder,
  Resource,
  Stable,
  StaffShift,
  Supplier,
  Task,
  TaskTemplate,
  Tenant,
  TrainingCertificate,
  UserAccount,
  VisitorLog,
} from "@/types";

import { now, setNow } from "./clock";
import { newId, resetIdCounter } from "./id-prefixes";
import {
  BEDDING_PRODUCTS,
  BREEDS,
  COLOURS,
  DENTAL_TECHS,
  FARRIERS,
  FEED_PRODUCTS,
  FIRST_NAMES_F,
  FIRST_NAMES_M,
  HAY_TYPES,
  HORSE_STABLE_NAMES,
  PADDOCK_NAMES,
  pick,
  REGISTERED_SUFFIXES,
  SUPPLEMENTS,
  SUPPLIERS,
  SURNAMES,
  VACCINES,
  VET_PRACTICES,
  WORMERS,
  YARDS,
} from "./names";

export interface Dataset {
  tenants: Tenant[];
  users: UserAccount[];
  clients: ClientProfile[];
  horses: Horse[];
  stables: Stable[];
  paddocks: Paddock[];
  paddockRotationGroups: PaddockRotationGroup[];
  movements: MovementHistory[];
  liveryPackages: LiveryPackage[];
  liveryAddOns: LiveryAddOn[];
  resources: Resource[];
  bookings: Booking[];
  tasks: Task[];
  taskTemplates: TaskTemplate[];
  feedPlans: FeedPlan[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  healthEvents: HealthEvent[];
  prescriptions: Prescription[];
  documents: DocumentRecord[];
  threads: MessageThread[];
  messages: Message[];
  incidents: IncidentRecord[];
  visitors: VisitorLog[];
  shifts: StaffShift[];
  certs: TrainingCertificate[];
  charges: Charge[];
  invoices: Invoice[];
  payments: Payment[];
  creditNotes: CreditNote[];
  notifications: NotificationDispatch[];
}

const SEED = 20260425;
const NOW_ISO = "2026-04-25T09:00:00Z";
const DAY = 86_400_000;

function iso(d: Date): string {
  return d.toISOString();
}

function daysFromNow(days: number): string {
  return iso(new Date(Date.parse(NOW_ISO) + days * DAY));
}

const initials = (first: string, last: string) => (first[0] + last[0]).toUpperCase();

function defaultPrefs(): UserAccount["notificationPrefs"] {
  return {
    health_reminder: { push: true, email: true, sms: false, in_app: true },
    payment_alert: { push: true, email: true, sms: false, in_app: true },
    booking: { push: true, email: true, sms: false, in_app: true },
    announcement: { push: false, email: true, sms: false, in_app: true },
    task: { push: true, email: false, sms: false, in_app: true },
    emergency: { push: true, email: true, sms: true, in_app: true },
  };
}

function buildLiveryPackages(tenantId: string, slug: string): LiveryPackage[] {
  const tiers = [
    {
      name: "Full Livery",
      tier: "full" as const,
      pricePence: 130_000,
      inclusions: { feedsPerDay: 3, muckOutFrequency: "daily" as const, turnoutDays: 7, rugChangesPerWeek: 7, arenaAccess: true },
      code: "LIVERY-FULL",
    },
    {
      name: "Part Livery",
      tier: "part" as const,
      pricePence: 90_000,
      inclusions: { feedsPerDay: 2, muckOutFrequency: "daily" as const, turnoutDays: 5, rugChangesPerWeek: 4, arenaAccess: true },
      code: "LIVERY-PART",
    },
    {
      name: "DIY Livery",
      tier: "diy" as const,
      pricePence: 45_000,
      inclusions: { feedsPerDay: 0, muckOutFrequency: "none" as const, turnoutDays: 0, rugChangesPerWeek: 0, arenaAccess: true },
      code: "LIVERY-DIY",
    },
    {
      name: "Grass Livery",
      tier: "grass" as const,
      pricePence: 30_000,
      inclusions: { feedsPerDay: 0, muckOutFrequency: "none" as const, turnoutDays: 7, rugChangesPerWeek: 0, arenaAccess: false },
      code: "LIVERY-GRASS",
    },
  ];
  return tiers.map((t) => ({
    id: newId("liveryPackage", `${slug}-${t.tier}`),
    tenantId,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    name: t.name,
    tier: t.tier,
    inclusions: t.inclusions,
    basePriceMonthlyPence: t.pricePence,
    effectiveFrom: daysFromNow(-365),
    effectiveTo: null,
    xeroItemCode: t.code,
    seasonalVariations: [],
    archivedAt: null,
  }));
}

function buildAddOns(tenantId: string, slug: string): LiveryAddOn[] {
  const items = [
    { name: "Additional Feed", pricePence: 350, unit: "feed", code: "FEED-EXTRA" },
    { name: "Rug Change", pricePence: 500, unit: "visit", code: "RUG-CHANGE" },
    { name: "Vet Callout Recharge", pricePence: 4500, unit: "visit", code: "VET-RECHARGE" },
    { name: "Farrier Handling Fee", pricePence: 1500, unit: "visit", code: "FARRIER-HANDLE" },
    { name: "Emergency Surcharge", pricePence: 2500, unit: "callout", code: "EMERGENCY" },
    { name: "Arena Hire (1 hour)", pricePence: 1500, unit: "hour", code: "ARENA-HIRE" },
  ];
  return items.map((it) => ({
    id: newId("liveryAddOn", `${slug}-${it.code.toLowerCase()}`),
    tenantId,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    name: it.name,
    pricePence: it.pricePence,
    unit: it.unit,
    xeroItemCode: it.code,
  }));
}

export function buildDataset(): Dataset {
  faker.seed(SEED);
  resetIdCounter();
  setNow(NOW_ISO);

  const tenants: Tenant[] = [];
  const users: UserAccount[] = [];
  const clients: ClientProfile[] = [];
  const horses: Horse[] = [];
  const stables: Stable[] = [];
  const paddocks: Paddock[] = [];
  const paddockRotationGroups: PaddockRotationGroup[] = [];
  const movements: MovementHistory[] = [];
  const liveryPackages: LiveryPackage[] = [];
  const liveryAddOns: LiveryAddOn[] = [];
  const resources: Resource[] = [];
  const bookings: Booking[] = [];
  const tasks: Task[] = [];
  const taskTemplates: TaskTemplate[] = [];
  const feedPlans: FeedPlan[] = [];
  const inventory: InventoryItem[] = [];
  const suppliers: Supplier[] = [];
  const purchaseOrders: PurchaseOrder[] = [];
  const healthEvents: HealthEvent[] = [];
  const prescriptions: Prescription[] = [];
  const documents: DocumentRecord[] = [];
  const threads: MessageThread[] = [];
  const messages: Message[] = [];
  const incidents: IncidentRecord[] = [];
  const visitors: VisitorLog[] = [];
  const shifts: StaffShift[] = [];
  const certs: TrainingCertificate[] = [];
  const charges: Charge[] = [];
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  const creditNotes: CreditNote[] = [];
  const notifications: NotificationDispatch[] = [];

  const groupId = "ten_riskhub-equine-group";

  // ============ TENANTS ============
  YARDS.forEach((y, idx) => {
    tenants.push({
      id: newId("tenant", y.slug),
      tenantId: groupId,
      createdAt: daysFromNow(-365),
      updatedAt: NOW_ISO,
      name: y.name,
      slug: y.slug,
      addressLine1: `${idx + 1} ${y.name.split(" ")[0]} Lane`,
      addressLine2: null,
      city: idx === 0 ? "Guildford" : idx === 1 ? "Basingstoke" : "Witney",
      postcode: y.postcode,
      phone: faker.phone.number({ style: "international" }),
      emergencyContactName: `${pick(FIRST_NAMES_F, idx)} ${pick(SURNAMES, idx + 5)}`,
      emergencyContactPhone: faker.phone.number({ style: "international" }),
      groupId,
      xeroTenantId: idx === 0 ? "xero_riverbend_001" : null,
      xeroConnectedAt: idx === 0 ? daysFromNow(-200) : null,
      whitelabel: { logoUrl: null, primaryColour: null, customDomain: null },
      vatNumber: idx === 0 ? "GB123456789" : null,
      billingDayOfMonth: 1,
      geofenceLatLng: { lat: 51.2 + idx * 0.05, lng: -0.6 + idx * 0.05 },
      geofenceRadiusMeters: 200,
      cancellationNoticeHours: 24,
    });
  });

  // ============ STAFF + LIVERY + RESOURCES + INVENTORY per tenant ============
  for (const tenant of tenants) {
    // Staff (10 per yard)
    for (let i = 0; i < 10; i++) {
      const isManager = i === 0;
      const first = pick([...FIRST_NAMES_F, ...FIRST_NAMES_M], i + tenants.indexOf(tenant) * 7);
      const last = pick(SURNAMES, i + tenants.indexOf(tenant) * 5);
      const role: UserAccount["role"] = isManager ? "yard_manager" : "yard_staff";
      users.push({
        id: newId("user", `${tenant.slug}-staff-${i}`),
        tenantId: tenant.id,
        createdAt: daysFromNow(-300),
        updatedAt: NOW_ISO,
        firstName: first,
        lastName: last,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@${tenant.slug}.paddocpro.test`,
        phone: faker.phone.number({ style: "international" }),
        role,
        avatarInitials: initials(first, last),
        lastSeenAt: daysFromNow(-(i % 4)),
        mfaEnabled: isManager,
        notificationPrefs: defaultPrefs(),
        status: "active",
      });
    }

    // Livery
    liveryPackages.push(...buildLiveryPackages(tenant.id, tenant.slug));
    liveryAddOns.push(...buildAddOns(tenant.id, tenant.slug));

    // Resources
    resources.push(
      {
        id: newId("resource", `${tenant.slug}-arena1`),
        tenantId: tenant.id,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
        name: "Indoor Arena",
        kind: "arena",
        defaultDurationMins: 60,
        pricePerSlotPence: 1500,
        xeroItemCode: "ARENA-HIRE",
      },
      {
        id: newId("resource", `${tenant.slug}-arena2`),
        tenantId: tenant.id,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
        name: "Outdoor Manège",
        kind: "manege_outdoor",
        defaultDurationMins: 60,
        pricePerSlotPence: 1200,
        xeroItemCode: "ARENA-HIRE",
      },
    );

    // External pros (vet/farrier/dentist) as resources
    VET_PRACTICES.slice(0, 2).forEach((v, i) =>
      resources.push({
        id: newId("resource", `${tenant.slug}-vet-${i}`),
        tenantId: tenant.id,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
        name: v,
        kind: "vet",
        defaultDurationMins: 60,
        pricePerSlotPence: null,
        xeroItemCode: null,
      }),
    );
    FARRIERS.slice(0, 2).forEach((f, i) =>
      resources.push({
        id: newId("resource", `${tenant.slug}-farrier-${i}`),
        tenantId: tenant.id,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
        name: f,
        kind: "farrier",
        defaultDurationMins: 45,
        pricePerSlotPence: null,
        xeroItemCode: null,
      }),
    );
    DENTAL_TECHS.slice(0, 1).forEach((d, i) =>
      resources.push({
        id: newId("resource", `${tenant.slug}-dental-${i}`),
        tenantId: tenant.id,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
        name: d,
        kind: "dentist",
        defaultDurationMins: 30,
        pricePerSlotPence: null,
        xeroItemCode: null,
      }),
    );

    // Inventory + Suppliers
    SUPPLIERS.forEach((s, i) =>
      suppliers.push({
        id: newId("supplier", `${tenant.slug}-${i}`),
        tenantId: tenant.id,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
        name: s.name,
        contactName: faker.person.fullName(),
        phone: faker.phone.number({ style: "international" }),
        email: faker.internet.email().toLowerCase(),
        productCategories: ["feed", "supplement", "hay", "bedding"],
        leadTimeDays: s.lead,
        preferred: i === 0,
      }),
    );

    const tenantSuppliers = suppliers.filter((s) => s.tenantId === tenant.id);

    [...FEED_PRODUCTS.slice(0, 8), ...SUPPLEMENTS.slice(0, 3), ...HAY_TYPES.slice(0, 2), ...BEDDING_PRODUCTS.slice(0, 2)].forEach((name, i) => {
      const category: InventoryItem["category"] = FEED_PRODUCTS.includes(name)
        ? "feed"
        : SUPPLEMENTS.includes(name)
          ? "supplement"
          : HAY_TYPES.includes(name)
            ? "hay"
            : "bedding";
      const stock = 5 + ((i * 7) % 80);
      const threshold = i % 5 === 0 ? stock + 10 : 15; // some items low-stock
      inventory.push({
        id: newId("inventory", `${tenant.slug}-${i}`),
        tenantId: tenant.id,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
        name,
        category,
        unit: category === "hay" || category === "bedding" ? "bale" : category === "supplement" ? "pack" : "kg",
        currentStock: stock,
        lowStockThreshold: threshold,
        unitCostPence: 800 + i * 120,
        preferredSupplierId: tenantSuppliers[i % tenantSuppliers.length]?.id ?? null,
        lowStockLastNotifiedAt: null,
      });
    });

    // Stables
    const stableCount = 14 + tenants.indexOf(tenant) * 2;
    for (let i = 0; i < stableCount; i++) {
      const block = i < stableCount * 0.5 ? "Main Block" : "Coppice Block";
      stables.push({
        id: newId("stable", `${tenant.slug}-${i}`),
        tenantId: tenant.id,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
        number: `${block === "Main Block" ? "M" : "C"}-${(i + 1).toString().padStart(2, "0")}`,
        block,
        dimensions: i % 3 === 0 ? "14 ft × 14 ft" : "12 ft × 12 ft",
        defaultBeddingType: i % 2 === 0 ? "shavings" : "straw",
        designation: i === stableCount - 1 ? "isolation" : "standard",
        status: i === 1 ? "maintenance" : "vacant", // will flip to occupied when assigning horses
        currentHorseId: null,
        outOfServiceReason: i === 1 ? "Drainage repair" : null,
        outOfServiceUntil: i === 1 ? daysFromNow(7) : null,
      });
    }

    // Paddocks + Rotation groups
    PADDOCK_NAMES.slice(0, 5).forEach((n, i) =>
      paddocks.push({
        id: newId("paddock", `${tenant.slug}-${i}`),
        tenantId: tenant.id,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
        name: n,
        sizeAcres: 1 + (i % 4) * 0.5,
        surfaceCondition: i % 3 === 0 ? "fair" : "good",
        currentHorseIds: [],
        rotationGroupId: null,
        lastRestedAt: daysFromNow(-(i * 4)),
        nextRotationAt: daysFromNow(14 - i * 2),
      }),
    );
    const tenantPaddocks = paddocks.filter((p) => p.tenantId === tenant.id);
    const rotGrp: PaddockRotationGroup = {
      id: newId("paddockRotationGroup", `${tenant.slug}-main`),
      tenantId: tenant.id,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
      name: "Main rotation",
      paddockIds: tenantPaddocks.map((p) => p.id),
      cycleDays: 14,
    };
    paddockRotationGroups.push(rotGrp);
    tenantPaddocks.forEach((p) => (p.rotationGroupId = rotGrp.id));

    // Task templates (yard-wide)
    const yardManager = users.find((u) => u.tenantId === tenant.id && u.role === "yard_manager")!;
    [
      { kind: "muck_out" as const, title: "Muck out all stables", priority: "high" as const, sel: "yard_wide" as const },
      { kind: "feed" as const, title: "Morning feed round", priority: "critical" as const, sel: "yard_wide" as const },
      { kind: "feed" as const, title: "Evening feed round", priority: "critical" as const, sel: "yard_wide" as const },
      { kind: "turn_out" as const, title: "Morning turnout", priority: "high" as const, sel: "yard_wide" as const },
      { kind: "bring_in" as const, title: "Evening bring-in", priority: "high" as const, sel: "yard_wide" as const },
      { kind: "hay_net" as const, title: "Top up hay nets", priority: "medium" as const, sel: "yard_wide" as const },
      { kind: "water_check" as const, title: "Water buckets check", priority: "medium" as const, sel: "yard_wide" as const },
    ].forEach((t, i) =>
      taskTemplates.push({
        id: newId("taskTemplate", `${tenant.slug}-${i}`),
        tenantId: tenant.id,
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
        kind: t.kind,
        title: t.title,
        targetSelector: t.sel,
        schedule: "FREQ=DAILY",
        priority: t.priority,
        defaultAssigneeId: yardManager.id,
        notes: null,
      }),
    );
  }

  // ============ CLIENTS (per tenant) ============
  for (const tenant of tenants) {
    const clientCount = 20 + (tenants.indexOf(tenant) % 3);
    for (let i = 0; i < clientCount; i++) {
      const useFemale = (i + tenants.indexOf(tenant)) % 2 === 0;
      const first = pick(useFemale ? FIRST_NAMES_F : FIRST_NAMES_M, i + tenants.indexOf(tenant) * 5);
      const last = pick(SURNAMES, i + tenants.indexOf(tenant) * 11);
      const userId = newId("user", `${tenant.slug}-client-${i}`);
      users.push({
        id: userId,
        tenantId: tenant.id,
        createdAt: daysFromNow(-200 + i),
        updatedAt: NOW_ISO,
        firstName: first,
        lastName: last,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@example.test`,
        phone: faker.phone.number({ style: "international" }),
        role: "client_owner",
        avatarInitials: initials(first, last),
        lastSeenAt: daysFromNow(-(i % 8)),
        mfaEnabled: false,
        notificationPrefs: defaultPrefs(),
        status: "active",
      });
      clients.push({
        id: newId("client", `${tenant.slug}-${i}`),
        tenantId: tenant.id,
        createdAt: daysFromNow(-200 + i),
        updatedAt: NOW_ISO,
        userAccountId: userId,
        dateOfBirth: daysFromNow(-365 * (25 + (i % 30))),
        addressLine1: faker.location.streetAddress(),
        addressLine2: null,
        city: faker.location.city(),
        postcode: faker.location.zipCode("?? # ??"),
        emergencyContactName: faker.person.fullName(),
        emergencyContactRelation: i % 2 === 0 ? "Spouse" : "Parent",
        emergencyContactPhone: faker.phone.number({ style: "international" }),
        ridingAbility: i % 4 === 0 ? "professional" : i % 3 === 0 ? "experienced" : i % 2 === 0 ? "intermediate" : "novice",
        medicalNotes: i % 11 === 0 ? "Asthma — carries inhaler when riding." : null,
        insuranceProvider: i % 3 !== 0 ? pick(["NFU Mutual", "South Essex Insurance", "Petplan Equine"], i) : null,
        insurancePolicyNumber: i % 3 !== 0 ? faker.string.alphanumeric(10).toUpperCase() : null,
        insuranceCoverLevel: i % 3 !== 0 ? "Comprehensive" : null,
        insuranceExpiry: i % 3 !== 0 ? daysFromNow(180 - i * 5) : null,
        xeroContactId: tenant.xeroTenantId ? `xero_contact_${tenant.slug}_${i}` : null,
        paymentMethod: i % 4 === 0 ? "stripe_card" : i % 4 === 1 ? "gocardless_dd" : i % 4 === 2 ? "manual_bacs" : "none",
        paymentMethodLast4: i % 4 < 2 ? String(1234 + i).slice(-4) : null,
        communicationPrefs: defaultPrefs(),
        portalAccessStatus: i % 7 === 0 ? "invited" : i % 13 === 0 ? "suspended" : "active",
      });
    }
  }

  // ============ HORSES per tenant ============
  for (const tenant of tenants) {
    const tenantStables = stables.filter((s) => s.tenantId === tenant.id);
    const tenantClients = clients.filter((c) => c.tenantId === tenant.id);
    const tenantPackages = liveryPackages.filter((p) => p.tenantId === tenant.id);
    const horseCount = Math.floor(tenantStables.length * 0.85); // ~85% occupancy
    for (let i = 0; i < horseCount; i++) {
      const stable = tenantStables[i];
      if (!stable || stable.status === "maintenance") continue;
      const owner = tenantClients[i % tenantClients.length];
      const stableName = pick(HORSE_STABLE_NAMES, i + tenants.indexOf(tenant) * 11);
      const registered = `${stableName} ${pick(REGISTERED_SUFFIXES, i)}`;
      const sex = pick(["mare", "gelding", "stallion", "colt", "filly"] as const, i);
      const colour = pick(COLOURS, i);
      const breed = pick(BREEDS, i);
      const heightHands = 14 + ((i * 3) % 5) + (i % 10) / 10;
      const isolating = i === 4 && tenant === tenants[0];
      const monitoring = i === 7 && tenant === tenants[0];
      const horseId = newId("horse", `${tenant.slug}-${i}`);
      const pkg = pick(tenantPackages, i);
      horses.push({
        id: horseId,
        tenantId: tenant.id,
        createdAt: daysFromNow(-180 + i),
        updatedAt: NOW_ISO,
        registeredName: registered,
        stableName,
        breed,
        sex,
        colour,
        markings: i % 3 === 0 ? "Star and snip; near-fore white sock" : null,
        heightHands,
        dateOfBirth: daysFromNow(-365 * (5 + (i % 12))),
        microchipNumber: `985121${(100000000 + i * 137).toString().slice(0, 9)}`,
        passportNumber: `GB${(900000 + i * 17).toString()}`,
        passportExpiry: i % 11 === 0 ? daysFromNow(20) : daysFromNow(900 - i * 7),
        primaryOwnerId: owner.id,
        coOwnerIds: [],
        currentStableId: isolating
          ? tenantStables.find((s) => s.designation === "isolation")?.id ?? stable.id
          : stable.id,
        currentPaddockId: null,
        liveryPackageId: pkg.id,
        liveryStartDate: daysFromNow(-180 + i),
        beddingType: stable.defaultBeddingType,
        healthStatus: isolating ? "isolating" : monitoring ? "monitoring" : "healthy",
        feedPlanId: null,
        insuranceProvider: i % 5 !== 0 ? "NFU Mutual" : null,
        insurancePolicyNumber: i % 5 !== 0 ? faker.string.alphanumeric(8).toUpperCase() : null,
        insuranceExpiry: i % 5 !== 0 ? daysFromNow(120 - i * 3) : null,
        primaryPhotoUrl: "",
        photoGalleryUrls: [],
        archivedAt: null,
      });

      const targetStable = isolating
        ? tenantStables.find((s) => s.designation === "isolation") ?? stable
        : stable;
      targetStable.currentHorseId = horseId;
      targetStable.status = "occupied";
    }
  }

  // ============ FEED PLANS (per horse) ============
  for (const horse of horses) {
    const tenantInv = inventory.filter((it) => it.tenantId === horse.tenantId && it.category === "feed");
    const planId = newId("feedPlan", horse.id);
    feedPlans.push({
      id: planId,
      tenantId: horse.tenantId,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
      horseId: horse.id,
      feeds: [
        { time: "07:00", feedProductId: tenantInv[0]?.id ?? "", quantityKg: 1.5, notes: null },
        { time: "12:00", feedProductId: tenantInv[1]?.id ?? "", quantityKg: 1.0, notes: null },
        { time: "17:00", feedProductId: tenantInv[2]?.id ?? "", quantityKg: 1.5, notes: null },
      ],
      supplements: [],
      specialInstructions: null,
      templateId: null,
    });
    horse.feedPlanId = planId;
  }

  // ============ HEALTH EVENTS — generate realistic vacc/worming/farrier/dental cycles ============
  for (const horse of horses) {
    // Vaccination history (every 6mo for last 18mo)
    [-540, -360, -180].forEach((dayOffset, idx) => {
      const v = pick(VACCINES, idx);
      healthEvents.push({
        id: newId("healthEvent", `${horse.id}-vacc-${idx}`),
        tenantId: horse.tenantId,
        createdAt: daysFromNow(dayOffset),
        updatedAt: daysFromNow(dayOffset),
        horseId: horse.id,
        kind: "vaccination",
        eventDate: daysFromNow(dayOffset),
        nextDueDate: daysFromNow(dayOffset + v.cycleMonths * 30),
        practitionerName: pick(VET_PRACTICES, idx),
        practitionerKind: "vet",
        productOrTreatment: v.product,
        dose: "1 ml IM",
        batchNumber: `BATCH${(1000 + idx * 17).toString()}`,
        withdrawalDays: 0,
        notes: null,
        documentIds: [],
        linkedTaskIds: [],
        status: dayOffset === -180 ? "completed" : "completed",
      });
    });

    // Some horses overdue for vaccs
    const horseIdx = horses.indexOf(horse);
    if (horseIdx % 9 === 0) {
      // Force overdue: add a vacc event with past nextDueDate
      healthEvents[healthEvents.length - 1].nextDueDate = daysFromNow(-15);
      healthEvents[healthEvents.length - 1].status = "overdue";
    }

    // Worming
    [-180, -90].forEach((d, idx) =>
      healthEvents.push({
        id: newId("healthEvent", `${horse.id}-worming-${idx}`),
        tenantId: horse.tenantId,
        createdAt: daysFromNow(d),
        updatedAt: daysFromNow(d),
        horseId: horse.id,
        kind: "worming",
        eventDate: daysFromNow(d),
        nextDueDate: daysFromNow(d + 90),
        practitionerName: "Yard staff",
        practitionerKind: "yard_staff",
        productOrTreatment: pick(WORMERS, idx),
        dose: "1 syringe",
        batchNumber: null,
        withdrawalDays: 0,
        notes: null,
        documentIds: [],
        linkedTaskIds: [],
        status: "completed",
      }),
    );

    // Farrier (every 6 weeks)
    [-84, -42].forEach((d, idx) =>
      healthEvents.push({
        id: newId("healthEvent", `${horse.id}-farrier-${idx}`),
        tenantId: horse.tenantId,
        createdAt: daysFromNow(d),
        updatedAt: daysFromNow(d),
        horseId: horse.id,
        kind: "farrier",
        eventDate: daysFromNow(d),
        nextDueDate: daysFromNow(d + 42),
        practitionerName: pick(FARRIERS, idx),
        practitionerKind: "farrier",
        productOrTreatment: idx === 0 ? "Reshoe all four" : "Trim",
        dose: null,
        batchNumber: null,
        withdrawalDays: null,
        notes: null,
        documentIds: [],
        linkedTaskIds: [],
        status: "completed",
      }),
    );

    // Dental (annual)
    if (horseIdx % 4 === 0) {
      healthEvents.push({
        id: newId("healthEvent", `${horse.id}-dental`),
        tenantId: horse.tenantId,
        createdAt: daysFromNow(-300),
        updatedAt: daysFromNow(-300),
        horseId: horse.id,
        kind: "dental",
        eventDate: daysFromNow(-300),
        nextDueDate: daysFromNow(65),
        practitionerName: pick(DENTAL_TECHS, horseIdx),
        practitionerKind: "dental_tech",
        productOrTreatment: "Routine rasp",
        dose: null,
        batchNumber: null,
        withdrawalDays: null,
        notes: null,
        documentIds: [],
        linkedTaskIds: [],
        status: "completed",
      });
    }
  }

  // ============ TASKS — today + last 3 days ============
  for (const tenant of tenants) {
    const tenantHorses = horses.filter((h) => h.tenantId === tenant.id);
    const tenantStaff = users.filter((u) => u.tenantId === tenant.id && u.role !== "client_owner");
    const tenantTemplates = taskTemplates.filter((t) => t.tenantId === tenant.id);

    // Today: per-template, one task each, distributed across staff
    tenantTemplates.forEach((tpl, i) => {
      const startHour = tpl.title.toLowerCase().includes("morning") ? 7 : tpl.title.toLowerCase().includes("evening") ? 17 : 9 + (i % 4);
      const dueAt = new Date(Date.parse(NOW_ISO));
      dueAt.setUTCHours(startHour, 0, 0, 0);
      const assignee = tenantStaff[i % tenantStaff.length];
      const completed = startHour < 9; // morning ones already done
      tasks.push({
        id: newId("task", `${tenant.slug}-today-${i}`),
        tenantId: tenant.id,
        createdAt: daysFromNow(-1),
        updatedAt: NOW_ISO,
        type: tpl.kind,
        title: tpl.title,
        horseId: null,
        stableId: null,
        paddockId: null,
        assigneeId: assignee.id,
        dueAt: iso(dueAt),
        priority: tpl.priority,
        status: completed ? "completed" : "pending",
        completedAt: completed ? daysFromNow(0) : null,
        completedById: completed ? assignee.id : null,
        notes: null,
        recurrenceRule: tpl.schedule,
        templateId: tpl.id,
        escalatedAt: null,
      });
    });

    // Per-horse medication / individual tasks for monitoring horses
    tenantHorses
      .filter((h) => h.healthStatus !== "healthy")
      .forEach((h, i) => {
        const dueAt = new Date(Date.parse(NOW_ISO));
        dueAt.setUTCHours(8 + i, 0, 0, 0);
        tasks.push({
          id: newId("task", `${tenant.slug}-med-${i}`),
          tenantId: tenant.id,
          createdAt: daysFromNow(-1),
          updatedAt: NOW_ISO,
          type: "medication",
          title: `Administer medication — ${h.stableName}`,
          horseId: h.id,
          stableId: h.currentStableId,
          paddockId: null,
          assigneeId: tenantStaff[0].id,
          dueAt: iso(dueAt),
          priority: "high",
          status: "pending",
          completedAt: null,
          completedById: null,
          notes: "Bute 1g BID",
          recurrenceRule: null,
          templateId: null,
          escalatedAt: null,
        });
      });

    // Last 3 days history (mostly completed, some missed)
    for (let day = 1; day <= 3; day++) {
      tenantTemplates.slice(0, 5).forEach((tpl, i) => {
        const dueAt = new Date(Date.parse(NOW_ISO) - day * DAY);
        dueAt.setUTCHours(8 + i, 0, 0, 0);
        const missed = day === 1 && i === 0; // 1 missed yesterday morning
        const assignee = tenantStaff[(i + day) % tenantStaff.length];
        tasks.push({
          id: newId("task", `${tenant.slug}-d${day}-${i}`),
          tenantId: tenant.id,
          createdAt: iso(dueAt),
          updatedAt: iso(dueAt),
          type: tpl.kind,
          title: tpl.title,
          horseId: null,
          stableId: null,
          paddockId: null,
          assigneeId: assignee.id,
          dueAt: iso(dueAt),
          priority: tpl.priority,
          status: missed ? "missed" : "completed",
          completedAt: missed ? null : iso(new Date(dueAt.getTime() + 60 * 60_000)),
          completedById: missed ? null : assignee.id,
          notes: null,
          recurrenceRule: tpl.schedule,
          templateId: tpl.id,
          escalatedAt: missed ? iso(new Date(dueAt.getTime() + 30 * 60_000)) : null,
        });
      });
    }
  }

  // ============ BOOKINGS — past + today + future ============
  for (const tenant of tenants) {
    const tenantHorses = horses.filter((h) => h.tenantId === tenant.id);
    const tenantClients = clients.filter((c) => c.tenantId === tenant.id);
    const tenantStaff = users.filter((u) => u.tenantId === tenant.id && u.role !== "client_owner");
    const arenas = resources.filter((r) => r.tenantId === tenant.id && (r.kind === "arena" || r.kind === "manege_outdoor"));
    const vets = resources.filter((r) => r.tenantId === tenant.id && r.kind === "vet");
    const farriers = resources.filter((r) => r.tenantId === tenant.id && r.kind === "farrier");

    // 30 bookings spread across 14-day window (past 7 + future 7)
    for (let i = 0; i < 30; i++) {
      const offsetDays = (i % 14) - 7;
      const startAt = new Date(Date.parse(NOW_ISO) + offsetDays * DAY);
      const hour = 8 + (i % 9);
      startAt.setUTCHours(hour, 0, 0, 0);
      const endAt = new Date(startAt.getTime() + 60 * 60_000);
      const isVet = i % 6 === 0;
      const isFarrier = i % 6 === 1;
      const resource = isVet ? vets[0] : isFarrier ? farriers[0] : arenas[i % arenas.length];
      const horse = tenantHorses[i % tenantHorses.length];
      const client = tenantClients[i % tenantClients.length];
      bookings.push({
        id: newId("booking", `${tenant.slug}-${i}`),
        tenantId: tenant.id,
        createdAt: daysFromNow(-30 + i),
        updatedAt: NOW_ISO,
        type: isVet ? "vet_appt" : isFarrier ? "farrier_appt" : i % 7 === 0 ? "lesson" : "arena_slot",
        resourceId: resource.id,
        clientId: isVet || isFarrier ? null : client.id,
        horseId: horse.id,
        staffIds: [tenantStaff[i % tenantStaff.length].id],
        startAt: iso(startAt),
        endAt: iso(endAt),
        status: offsetDays < -2 ? "completed" : i % 11 === 0 && offsetDays < 0 ? "cancelled" : "confirmed",
        recurrenceRule: null,
        notes: null,
      });
    }
  }

  // ============ INVOICES + PAYMENTS — last 3 months ============
  let invNumberCounter = 1000;
  for (const tenant of tenants) {
    const tenantClients = clients.filter((c) => c.tenantId === tenant.id);
    const tenantPackages = liveryPackages.filter((p) => p.tenantId === tenant.id);
    for (let monthAgo = 0; monthAgo <= 2; monthAgo++) {
      const issuedAt = daysFromNow(-monthAgo * 30);
      tenantClients.forEach((c, i) => {
        const horse = horses.find((h) => h.primaryOwnerId === c.id);
        if (!horse) return;
        const pkg = tenantPackages.find((p) => p.id === horse.liveryPackageId)!;
        const subtotalPence = pkg.basePriceMonthlyPence + (i % 4 === 0 ? 350 * 5 : 0);
        const vatPence = Math.round(subtotalPence * 0.2);
        const totalPence = subtotalPence + vatPence;
        const isOverdue = monthAgo > 0 && i % 7 === 0;
        const isPaid = !isOverdue && (monthAgo > 0 || i % 4 !== 0);
        const invoiceId = newId("invoice", `${tenant.slug}-m${monthAgo}-${i}`);
        invoices.push({
          id: invoiceId,
          tenantId: tenant.id,
          createdAt: issuedAt,
          updatedAt: NOW_ISO,
          clientId: c.id,
          xeroInvoiceId: `xero_inv_${invNumberCounter}`,
          invoiceNumber: `INV-${invNumberCounter++}`,
          lines: [
            {
              description: `${pkg.name} — ${monthShort(monthAgo)} 2026`,
              quantity: 1,
              unitPricePence: pkg.basePriceMonthlyPence,
              xeroItemCode: pkg.xeroItemCode,
              totalPence: pkg.basePriceMonthlyPence,
            },
            ...(i % 4 === 0
              ? [
                  {
                    description: "Additional feed × 5",
                    quantity: 5,
                    unitPricePence: 350,
                    xeroItemCode: "FEED-EXTRA",
                    totalPence: 350 * 5,
                  },
                ]
              : []),
          ],
          subtotalPence,
          vatPence,
          totalPence,
          paidAmountPence: isPaid ? totalPence : 0,
          issuedAt,
          dueAt: daysFromNow(-monthAgo * 30 + 14),
          status: isPaid ? "paid" : "authorised",
          xeroOnlineInvoiceUrl: `https://mock.paddocpro.local/pay/${invoiceId}`,
          idempotencyKey: `${tenant.id}-m${monthAgo}-${c.id}`,
        });

        if (isPaid) {
          payments.push({
            id: newId("payment", invoiceId),
            tenantId: tenant.id,
            createdAt: daysFromNow(-monthAgo * 30 + 7),
            updatedAt: NOW_ISO,
            invoiceId,
            xeroPaymentId: `xero_pmt_${invoiceId}`,
            amountPence: totalPence,
            paidAt: daysFromNow(-monthAgo * 30 + 7),
            method: c.paymentMethod === "stripe_card" ? "stripe_card" : c.paymentMethod === "gocardless_dd" ? "gocardless_dd" : "bacs_manual",
            reference: null,
          });
        }
      });
    }
  }

  // ============ INCIDENTS ============
  const severities: IncidentRecord["severity"][] = ["minor", "moderate", "serious", "critical"];
  const types: IncidentRecord["incidentType"][] = ["horse_injury", "near_miss", "equipment_failure", "rider_injury"];
  for (const tenant of tenants) {
    const tenantHorses = horses.filter((h) => h.tenantId === tenant.id);
    const tenantManager = users.find((u) => u.tenantId === tenant.id && u.role === "yard_manager")!;
    for (let i = 0; i < 5; i++) {
      const sev = severities[i % severities.length];
      const occurredAt = daysFromNow(-i * 3);
      incidents.push({
        id: newId("incident", `${tenant.slug}-${i}`),
        tenantId: tenant.id,
        createdAt: occurredAt,
        updatedAt: NOW_ISO,
        occurredAt,
        location: pick(["Main Yard", "Paddock 2", "Indoor Arena", "Stable Block"], i),
        severity: sev,
        incidentType: types[i % types.length],
        summary: `${sev.charAt(0).toUpperCase() + sev.slice(1)} incident — ${types[i % types.length].replace("_", " ")}`,
        description: faker.lorem.paragraph(),
        linkedHorseId: tenantHorses[i % tenantHorses.length]?.id ?? null,
        linkedClientId: null,
        evidenceDocIds: [],
        workflowState: i === 0 ? "logged" : i === 1 ? "under_review" : i === 2 ? "action_taken" : "closed",
        assignedToId: tenantManager.id,
        resolutionNotes: i >= 3 ? "Resolved — see audit trail." : null,
        confidentialWelfareFlag: false,
        auditTrail: [
          {
            at: occurredAt,
            byUserId: tenantManager.id,
            action: "incident.log",
            before: null,
            after: { workflowState: "logged" },
          },
        ],
      });
    }
  }

  // ============ DOCUMENTS — passport per horse, vacc cert per recent vacc ============
  for (const horse of horses) {
    const yardManager = users.find((u) => u.tenantId === horse.tenantId && u.role === "yard_manager")!;
    documents.push({
      id: newId("document", `${horse.id}-passport`),
      tenantId: horse.tenantId,
      createdAt: daysFromNow(-180),
      updatedAt: NOW_ISO,
      entityType: "horse",
      entityId: horse.id,
      category: "passport",
      title: `${horse.stableName} — Equine Passport`,
      fileName: `passport_${horse.passportNumber}.pdf`,
      fileSizeBytes: 412_000,
      mimeType: "application/pdf",
      uploadedById: yardManager.id,
      expiryDate: horse.passportExpiry,
      version: 1,
      previousVersionId: null,
      signatures: [],
    });
  }

  // ============ VISITORS — recent ============
  for (const tenant of tenants) {
    for (let i = 0; i < 3; i++) {
      const arrived = daysFromNow(-i);
      const onSite = i === 0;
      visitors.push({
        id: newId("visitor", `${tenant.slug}-${i}`),
        tenantId: tenant.id,
        createdAt: arrived,
        updatedAt: NOW_ISO,
        visitorName: i === 0 ? pick(VET_PRACTICES, 0) : i === 1 ? pick(FARRIERS, 0) : "Allen & Page Delivery",
        visitorType: i === 0 ? "vet" : i === 1 ? "farrier" : "supplier",
        purpose: i === 0 ? "Routine vaccinations" : i === 1 ? "Re-shoeing round" : "Feed delivery",
        vehicleReg: i === 0 ? "BV21 EQU" : i === 1 ? "GU72 FAR" : "AG23 DLV",
        arrivedAt: arrived,
        departedAt: onSite ? null : daysFromNow(-i + 0.2),
        expectedBookingId: null,
        inductionStatus: i === 2 ? "complete" : null,
        insuranceCertDocId: null,
      });
    }
  }

  // ============ MOVEMENTS for occupied horses ============
  for (const horse of horses) {
    if (horse.currentStableId) {
      movements.push({
        id: newId("movement", horse.id),
        tenantId: horse.tenantId,
        createdAt: horse.liveryStartDate,
        updatedAt: horse.liveryStartDate,
        horseId: horse.id,
        from: { stableId: null, paddockId: null },
        to: { stableId: horse.currentStableId, paddockId: null },
        at: horse.liveryStartDate,
        byUserId: users.find((u) => u.tenantId === horse.tenantId && u.role === "yard_manager")!.id,
        reason: "Initial assignment on arrival",
      });
    }
  }

  return {
    tenants,
    users,
    clients,
    horses,
    stables,
    paddocks,
    paddockRotationGroups,
    movements,
    liveryPackages,
    liveryAddOns,
    resources,
    bookings,
    tasks,
    taskTemplates,
    feedPlans,
    inventory,
    suppliers,
    purchaseOrders,
    healthEvents,
    prescriptions,
    documents,
    threads,
    messages,
    incidents,
    visitors,
    shifts,
    certs,
    charges,
    invoices,
    payments,
    creditNotes,
    notifications,
  };
}

function monthShort(monthsAgo: number): string {
  const d = now();
  d.setUTCMonth(d.getUTCMonth() - monthsAgo);
  return d.toLocaleString("en-GB", { month: "short" });
}

export const MOCK_DATASET: Dataset = buildDataset();

export function freshSeed(): Dataset {
  return buildDataset();
}
