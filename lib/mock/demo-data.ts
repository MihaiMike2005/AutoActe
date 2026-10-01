import type {
  AuditEntry,
  AppointmentRecord,
  CaseStep,
  DocumentRecord,
  MarketplaceService,
  NotificationRecord,
  Organization,
  PaymentRecord,
  Profile,
  RegistrationCase,
  ServiceOrder,
  Vehicle,
} from "@/types/domain";
import { stepsFor } from "@/lib/state-machine/wizard";

const ORG = {
  dgpci: "11111111-0000-0000-0000-000000000001",
  rar: "11111111-0000-0000-0000-000000000002",
  anaf: "11111111-0000-0000-0000-000000000003",
  dgitl: "11111111-0000-0000-0000-000000000004",
  allianz: "11111111-0000-0000-0000-000000000005",
  bavaria: "11111111-0000-0000-0000-000000000010",
  traduceri: "11111111-0000-0000-0000-000000000011",
  transport: "11111111-0000-0000-0000-000000000012",
  rarAssist: "11111111-0000-0000-0000-000000000013",
} as const;

const ISO = (daysFromNow = 0) =>
  new Date(Date.now() + daysFromNow * 86_400_000).toISOString();

export const demoOrganizations: Organization[] = [
  { id: ORG.dgpci, type: "dgpci", name: "DGPCI Cluj-Napoca", cui: "RO4288000", county: "Cluj", city: "Cluj-Napoca", address: "Str. Traian 27", latitude: 46.770439, longitude: 23.591423, contact_email: "cluj@dgpci.ro", contact_phone: "+40 264 597 000", working_hours: { weekdays: "08:00–16:00" } },
  { id: ORG.rar,   type: "rar",   name: "RAR Cluj", cui: "RO1590236", county: "Cluj", city: "Cluj-Napoca", address: "Calea Turzii 154-156", latitude: 46.745118, longitude: 23.557234, contact_email: "cluj@rarom.ro", contact_phone: "+40 264 596 013", working_hours: { weekdays: "07:30–15:30" } },
  { id: ORG.anaf,  type: "anaf",  name: "ANAF Cluj", cui: "RO4192952", county: "Cluj", city: "Cluj-Napoca", address: "Bd. Eroilor 26", latitude: 46.769451, longitude: 23.593782, contact_email: "cluj@anaf.ro", contact_phone: "+40 264 452 100", working_hours: { weekdays: "08:00–16:00" } },
  { id: ORG.dgitl, type: "dgitl", name: "DGITL Cluj-Napoca", cui: "RO4305857", county: "Cluj", city: "Cluj-Napoca", address: "Calea Moților 7", latitude: 46.770871, longitude: 23.586211, contact_email: "fiscalitate@primariaclujnapoca.ro", contact_phone: "+40 264 596 030", working_hours: { weekdays: "08:30–16:30" } },
  { id: ORG.allianz, type: "insurer", name: "Allianz-Țiriac Asigurări", cui: "RO1815639", county: "Cluj", city: "Cluj-Napoca", address: "Str. Memorandumului 8", latitude: 46.770000, longitude: 23.586000, contact_email: "contact@allianztiriac.ro", contact_phone: "+40 21 301 7070" },
  { id: ORG.bavaria, type: "dealer", name: "Auto Bavaria Cluj", cui: "RO22555000", county: "Cluj", city: "Cluj-Napoca", address: "Calea Turzii 230", latitude: 46.741000, longitude: 23.555000, contact_email: "sales@autobavaria.ro", contact_phone: "+40 264 555 000" },
  { id: ORG.traduceri, type: "service_provider", name: "Traduceri Legalizate Express", cui: "RO33001122", county: "Cluj", city: "Cluj-Napoca", address: "Str. Memorandumului 22", latitude: 46.770100, longitude: 23.585000, contact_email: "contact@traduceriexpress.ro" },
  { id: ORG.transport, type: "service_provider", name: "Transport Auto Europa", cui: "RO33001123", county: "Bihor", city: "Oradea", address: "Calea Aradului 12", latitude: 47.046501, longitude: 21.918946, contact_email: "dispatch@transportauto.ro" },
  { id: ORG.rarAssist, type: "service_provider", name: "RAR Assist Cluj", cui: "RO33001124", county: "Cluj", city: "Cluj-Napoca", address: "Calea Turzii 156", latitude: 46.745000, longitude: 23.557000, contact_email: "help@rarassist.ro" },
];

export const demoProfiles: Profile[] = [
  {
    id: "u-cetatean",
    cnp: "1900101120128",
    full_name: "Andrei Popescu",
    email: "cetatean@demo.ro",
    phone: "0723456789",
    county: "Cluj",
    city: "Cluj-Napoca",
    address: "Str. Memorandumului 18, ap. 7",
    role: "citizen",
    preferred_language: "ro",
    accessibility_settings: { high_contrast: false, screen_reader: false, font_size: "normal", voice_guide: false },
    created_at: ISO(-180),
  },
  {
    id: "u-functionar-dgpci",
    full_name: "Maria Ionescu",
    email: "functionar.dgpci@demo.ro",
    role: "public_servant",
    organization_ids: [ORG.dgpci],
    preferred_language: "ro",
    accessibility_settings: { high_contrast: false, screen_reader: false, font_size: "normal", voice_guide: false },
    created_at: ISO(-365),
  },
  {
    id: "u-functionar-rar",
    full_name: "Vasile Munteanu",
    email: "functionar.rar@demo.ro",
    role: "public_servant",
    organization_ids: [ORG.rar],
    preferred_language: "ro",
    accessibility_settings: { high_contrast: false, screen_reader: false, font_size: "normal", voice_guide: false },
    created_at: ISO(-365),
  },
  {
    id: "u-dealer",
    full_name: "Radu Marinescu",
    email: "dealer@demo.ro",
    role: "dealer_user",
    organization_ids: [ORG.bavaria],
    preferred_language: "ro",
    accessibility_settings: { high_contrast: false, screen_reader: false, font_size: "normal", voice_guide: false },
    created_at: ISO(-90),
  },
  {
    id: "u-admin",
    full_name: "Administrator AutoActe",
    email: "admin@demo.ro",
    role: "system",
    preferred_language: "ro",
    accessibility_settings: { high_contrast: false, screen_reader: false, font_size: "normal", voice_guide: false },
    created_at: ISO(-700),
  },
];

export const demoVehicles: Vehicle[] = [
  {
    id: "v-bmw-320d",
    vin: "WBA8E9C50KB123456",
    make: "BMW",
    model: "320d",
    year: 2019,
    color: "Alpine White",
    fuel_type: "Diesel",
    engine_capacity_cc: 1995,
    power_kw: 140,
    co2_emissions_g_km: 122,
    mass_kg: 1530,
    category: "M1",
    euro_standard: "Euro 6d",
    current_owner_id: "u-cetatean",
    imported_from_country: "DE",
    imported_at: ISO(-30).slice(0, 10),
    purchase_value_ron: 95000,
  },
  {
    id: "v-dacia-spring",
    vin: "UU14SRG6852345678",
    make: "Dacia",
    model: "Spring Electric",
    year: 2024,
    color: "Slate Grey",
    fuel_type: "Electric",
    engine_capacity_cc: 0,
    power_kw: 33,
    co2_emissions_g_km: 0,
    mass_kg: 970,
    category: "M1",
    euro_standard: "Electric",
    current_owner_id: "u-cetatean",
    purchase_value_ron: 78000,
  },
  {
    id: "v-skoda-octavia",
    vin: "TMBJG7NE0H0073210",
    make: "Skoda",
    model: "Octavia",
    year: 2017,
    color: "Steel Grey",
    fuel_type: "Petrol",
    engine_capacity_cc: 1395,
    power_kw: 110,
    co2_emissions_g_km: 132,
    mass_kg: 1350,
    category: "M1",
    euro_standard: "Euro 6",
    current_owner_id: "u-cetatean",
    license_plate: "CJ 22 ABC",
  },
];

function makeSteps(
  caseId: string,
  scenario: RegistrationCase["scenario"],
  currentStepIdx: number,
): CaseStep[] {
  const seq = stepsFor(scenario);
  return seq.map((code, i) => ({
    id: `${caseId}-step-${i}`,
    case_id: caseId,
    step_code: code,
    status: i < currentStepIdx ? "completed" : i === currentStepIdx ? "in_progress" : "pending",
    display_order: i,
    started_at: i <= currentStepIdx ? ISO(-(seq.length - i)) : undefined,
    completed_at: i < currentStepIdx ? ISO(-(seq.length - i - 1)) : undefined,
  }));
}

export const demoCases: RegistrationCase[] = [
  {
    id: "c-bmw",
    case_number: "INM-2026-000142",
    citizen_id: "u-cetatean",
    vehicle_id: "v-bmw-320d",
    scenario: "imported_eu",
    status: "in_progress",
    current_step: "rar_appointment",
    estimated_total_cost: 3120,
    total_paid: 0,
    legal_deadline: ISO(60).slice(0, 10),
    assigned_org_id: ORG.rar,
    metadata: { mileage_km: 87420 },
    created_at: ISO(-20),
    updated_at: ISO(-2),
    steps: makeSteps("c-bmw", "imported_eu", 2),
  },
  {
    id: "c-spring",
    case_number: "INM-2026-000168",
    citizen_id: "u-cetatean",
    vehicle_id: "v-dacia-spring",
    scenario: "new_ro",
    status: "awaiting_institution",
    current_step: "dgpci_appointment",
    estimated_total_cost: 1180,
    total_paid: 980,
    assigned_org_id: ORG.dgpci,
    metadata: {},
    created_at: ISO(-8),
    updated_at: ISO(-1),
    steps: makeSteps("c-spring", "new_ro", 4),
  },
  {
    id: "c-octavia",
    case_number: "INM-2025-099741",
    citizen_id: "u-cetatean",
    vehicle_id: "v-skoda-octavia",
    scenario: "used_ro",
    status: "completed",
    current_step: "document_delivery",
    estimated_total_cost: 1340,
    total_paid: 1340,
    metadata: {},
    created_at: ISO(-90),
    updated_at: ISO(-80),
    completed_at: ISO(-80),
    steps: makeSteps("c-octavia", "used_ro", 7),
  },
];

export const demoDocuments: DocumentRecord[] = [
  {
    id: "d-bmw-id",
    case_id: "c-bmw",
    owner_id: "u-cetatean",
    type: "id_card",
    file_url: "/demo/id-card.jpg",
    file_hash: "sha256:demo-id-card",
    mime_type: "image/jpeg",
    ocr_extracted_data: {
      cnp: "1900101120128",
      last_name: "POPESCU",
      first_name: "ANDREI",
      address: "Str. Memorandumului 18, ap. 7, Cluj-Napoca",
      issuing_authority: "SPCLEP Cluj",
      expiry_date: "2031-01-01",
    },
    ocr_confidence: 0.97,
    ocr_provider: "claude-vision",
    validated: true,
    validation_errors: [],
    validated_at: ISO(-19),
    uploaded_at: ISO(-19),
  },
  {
    id: "d-bmw-brief",
    case_id: "c-bmw",
    owner_id: "u-cetatean",
    type: "brief_foreign",
    file_url: "/demo/brief.jpg",
    file_hash: "sha256:demo-brief",
    mime_type: "image/jpeg",
    ocr_extracted_data: {
      vin: "WBA8E9C50KB123456",
      make: "BMW",
      model: "320d",
      first_registration_date: "2019-03-14",
      owner_name: "Müller, Klaus",
      engine_capacity_cc: 1995,
      power_kw: 140,
      mass_kg: 1530,
      co2_emissions_g_km: 122,
      euro_standard: "Euro 6d",
      issuing_country: "DE",
    },
    ocr_confidence: 0.93,
    validated: true,
    validation_errors: [],
    validated_at: ISO(-18),
    uploaded_at: ISO(-19),
  },
  {
    id: "d-bmw-kauf",
    case_id: "c-bmw",
    owner_id: "u-cetatean",
    type: "kaufvertrag",
    file_url: "/demo/kaufvertrag.jpg",
    file_hash: "sha256:demo-kauf",
    mime_type: "image/jpeg",
    ocr_extracted_data: {
      vin: "WBA8E9C50KB123456",
      seller_name: "Müller, Klaus",
      seller_address: "München",
      buyer_name: "POPESCU ANDREI",
      buyer_address: "Cluj-Napoca",
      price: 19200,
      currency: "EUR",
      contract_date: "2026-04-22",
    },
    ocr_confidence: 0.88,
    validated: true,
    validation_errors: [],
    validated_at: ISO(-18),
    uploaded_at: ISO(-18),
  },
];

export const demoPayments: PaymentRecord[] = [
  {
    id: "p-spring-1",
    case_id: "c-spring",
    amount: 980,
    currency: "RON",
    purpose: "DGPCI + plăcuțe + certificat",
    payment_method: "card",
    transaction_ref: "txn_demo_980",
    recipient_org_id: ORG.dgpci,
    status: "completed",
    paid_at: ISO(-2),
    created_at: ISO(-2),
  },
  {
    id: "p-octavia-1",
    case_id: "c-octavia",
    amount: 1340,
    currency: "RON",
    purpose: "Pachet complet",
    payment_method: "card",
    transaction_ref: "txn_demo_1340",
    status: "completed",
    paid_at: ISO(-82),
    created_at: ISO(-82),
  },
];

export const demoAppointments: AppointmentRecord[] = [
  {
    id: "ap-bmw-rar",
    case_id: "c-bmw",
    organization_id: ORG.rar,
    scheduled_at: ISO(3),
    duration_minutes: 60,
    service_type: "Omologare individuală + inspecție",
    location: "RAR Cluj — pista 2",
    confirmation_code: "RAR-CJ-7841",
    status: "scheduled",
    created_at: ISO(-1),
  },
  {
    id: "ap-spring-dgpci",
    case_id: "c-spring",
    organization_id: ORG.dgpci,
    scheduled_at: ISO(2),
    duration_minutes: 30,
    service_type: "Înmatriculare + emitere plăcuțe",
    location: "DGPCI Cluj — ghișeul 5",
    confirmation_code: "DGPCI-CJ-1142",
    status: "scheduled",
    created_at: ISO(-1),
  },
];

export const demoServices: MarketplaceService[] = [
  { id: "svc-traduceri-1", provider_org_id: ORG.traduceri, category: "translation", name: "Traducere Brief + Kaufvertrag (DE→RO)", description: "Traducere legalizată, livrare digitală + fizică.", price_from: 150, price_to: 250, counties_served: ["Cluj","Bihor","Mures","Alba"], estimated_duration_hours: 48, average_rating: 4.8, total_orders: 142, active: true },
  { id: "svc-traduceri-2", provider_org_id: ORG.traduceri, category: "translation", name: "Traducere COC + Factură (EN→RO)", description: "Pachet importatori Marea Britanie.", price_from: 180, price_to: 280, counties_served: ["Cluj","Bihor"], estimated_duration_hours: 48, average_rating: 4.7, total_orders: 87, active: true },
  { id: "svc-transport-1", provider_org_id: ORG.transport, category: "transport", name: "Transport mașină Germania → Cluj", description: "Platformă închisă, asigurare CARGO inclusă.", price_from: 650, price_to: 1100, counties_served: ["Cluj","Bihor","Mures","Alba","Sibiu"], estimated_duration_hours: 72, average_rating: 4.9, total_orders: 231, active: true },
  { id: "svc-transport-2", provider_org_id: ORG.transport, category: "transport", name: "Transport intern Cluj ↔ București", description: "Platformă deschisă.", price_from: 320, price_to: 520, counties_served: ["Cluj","Bucuresti","Ilfov"], estimated_duration_hours: 24, average_rating: 4.6, total_orders: 189, active: true },
  { id: "svc-rar-1", provider_org_id: ORG.rarAssist, category: "rar_assistance", name: "Asistență RAR Cluj — programare + însoțire", description: "Tehnician acreditat te însoțește la RAR.", price_from: 250, price_to: 350, counties_served: ["Cluj"], estimated_duration_hours: 4, average_rating: 4.9, total_orders: 318, active: true },
  { id: "svc-rar-2", provider_org_id: ORG.rarAssist, category: "rar_assistance", name: "Pregătire dosar omologare EU", description: "Verificăm dosarul înainte de a-l depune.", price_from: 150, price_to: 200, counties_served: ["Cluj","Bihor","Mures","Alba","Sibiu"], estimated_duration_hours: 2, average_rating: 4.8, total_orders: 205, active: true },
  { id: "svc-towing-1", provider_org_id: ORG.rarAssist, category: "towing", name: "Tractare la RAR (până la 20 km)", description: "Pentru mașini ce nu pot fi conduse legal.", price_from: 180, price_to: 260, counties_served: ["Cluj"], estimated_duration_hours: 1, average_rating: 4.5, total_orders: 94, active: true },
  { id: "svc-traduceri-3", provider_org_id: ORG.traduceri, category: "translation", name: "Apostilă + traducere acte germane", description: "Pentru documente ce necesită apostilă MAE.", price_from: 280, price_to: 380, counties_served: ["Cluj","Bihor"], estimated_duration_hours: 96, average_rating: 4.7, total_orders: 52, active: true },
  { id: "svc-transport-3", provider_org_id: ORG.transport, category: "transport", name: "Aducere remorcă auto din Italia", description: "Asigurare 100% pentru remorci.", price_from: 900, price_to: 1400, counties_served: ["Cluj","Mures","Sibiu","Bihor"], estimated_duration_hours: 96, average_rating: 4.8, total_orders: 38, active: true },
  { id: "svc-rar-3", provider_org_id: ORG.rarAssist, category: "rar_assistance", name: "Pachet complet Înmatriculare Express", description: "Tot ce ai nevoie — dosar, RAR, DGPCI, plăcuțe.", price_from: 850, price_to: 1200, counties_served: ["Cluj"], estimated_duration_hours: 24, average_rating: 4.9, total_orders: 176, active: true },
];

export const demoServiceOrders: ServiceOrder[] = [
  { id: "so-1", service_id: "svc-traduceri-1", citizen_id: "u-cetatean", provider_org_id: ORG.traduceri, agreed_price: 200, status: "completed",  notes: "Traducere Brief + Kaufvertrag", created_at: ISO(-19), completed_at: ISO(-17), case_id: "c-bmw" },
  { id: "so-2", service_id: "svc-rar-1",       citizen_id: "u-cetatean", provider_org_id: ORG.rarAssist, agreed_price: 300, status: "accepted",   notes: "Însoțire la RAR Cluj joi",   created_at: ISO(-2), case_id: "c-bmw" },
  { id: "so-3", service_id: "svc-transport-1", citizen_id: "u-cetatean", provider_org_id: ORG.transport, agreed_price: 820, status: "completed", created_at: ISO(-25), completed_at: ISO(-21), case_id: "c-bmw" },
];

export const demoNotifications: NotificationRecord[] = [
  { id: "n-1", user_id: "u-cetatean", case_id: "c-bmw",    type: "appointment_scheduled", title: "Programare confirmată la RAR Cluj",       message: "Joi, 26 mai 2026, ora 09:00 — pista 2.",                action_url: "/cases/c-bmw",  read: false, priority: "high",   created_at: ISO(-1) },
  { id: "n-2", user_id: "u-cetatean", case_id: "c-spring", type: "step_completed",         title: "Plata efectuată — 980 RON",                message: "Următorul pas: programarea la DGPCI Cluj.",            action_url: "/cases/c-spring", read: false, priority: "normal", created_at: ISO(-2) },
  { id: "n-3", user_id: "u-cetatean", case_id: "c-bmw",    type: "deadline_warning",       title: "60 zile rămase din termenul legal",        message: "Înmatricularea trebuie finalizată până pe 22 iulie.", action_url: "/cases/c-bmw",  read: true,  priority: "high",   created_at: ISO(-5) },
];

export const demoAuditLog: AuditEntry[] = (() => {
  const ZERO = "0".repeat(64);
  const entries: AuditEntry[] = [];
  let prev = ZERO;
  const events: Array<Omit<AuditEntry, "id" | "previous_hash" | "record_hash">> = [
    { entity_type: "registration_case", entity_id: "c-bmw",     action: "INSERT", actor_id: "u-cetatean",        actor_role: "citizen",        new_state: { status: "draft" },        created_at: ISO(-20) },
    { entity_type: "document",          entity_id: "d-bmw-id",  action: "INSERT", actor_id: "u-cetatean",        actor_role: "citizen",        new_state: { type: "id_card" },        created_at: ISO(-19) },
    { entity_type: "document",          entity_id: "d-bmw-brief", action: "INSERT", actor_id: "u-cetatean",      actor_role: "citizen",        new_state: { type: "brief_foreign" },  created_at: ISO(-19) },
    { entity_type: "document",          entity_id: "d-bmw-kauf",  action: "OCR_COMPLETED", actor_id: "u-cetatean", actor_role: "citizen",      new_state: { confidence: 0.88 },       created_at: ISO(-18) },
    { entity_type: "case_step",         entity_id: "c-bmw",     action: "STEP_COMPLETED", actor_id: "u-functionar-rar", actor_role: "public_servant", new_state: { step: "documents_upload" }, created_at: ISO(-15) },
    { entity_type: "case_step",         entity_id: "c-bmw",     action: "STEP_COMPLETED", actor_id: "u-functionar-rar", actor_role: "public_servant", new_state: { step: "anaf_tva_certificate" }, created_at: ISO(-10) },
    { entity_type: "appointment",       entity_id: "ap-bmw-rar", action: "INSERT", actor_id: "u-cetatean",       actor_role: "citizen",        new_state: { scheduled_at: ISO(3) },    created_at: ISO(-1) },
    { entity_type: "registration_case", entity_id: "c-spring",  action: "INSERT", actor_id: "u-cetatean",        actor_role: "citizen",        new_state: { status: "draft" },        created_at: ISO(-8) },
    { entity_type: "payment",           entity_id: "p-spring-1", action: "COMPLETED", actor_id: "u-cetatean",    actor_role: "citizen",        new_state: { amount: 980 },             created_at: ISO(-2) },
    { entity_type: "case_step",         entity_id: "c-spring",  action: "STEP_COMPLETED", actor_id: "u-cetatean", actor_role: "citizen",       new_state: { step: "payment" },        created_at: ISO(-2) },
    { entity_type: "registration_case", entity_id: "c-octavia", action: "INSERT", actor_id: "u-cetatean",        actor_role: "citizen",        new_state: { status: "draft" },        created_at: ISO(-90) },
    { entity_type: "registration_case", entity_id: "c-octavia", action: "STATUS_CHANGED", actor_id: "u-functionar-dgpci", actor_role: "public_servant", new_state: { status: "completed" }, created_at: ISO(-80) },
    { entity_type: "service_order",     entity_id: "so-1",      action: "INSERT", actor_id: "u-cetatean",        actor_role: "citizen",        new_state: { service: "translation" }, created_at: ISO(-19) },
    { entity_type: "service_order",     entity_id: "so-3",      action: "COMPLETED", actor_id: "u-cetatean",     actor_role: "citizen",        new_state: { rating: 5 },              created_at: ISO(-21) },
    { entity_type: "notification",      entity_id: "n-1",       action: "DELIVERED", actor_id: "u-admin",        actor_role: "system",         new_state: {},                          created_at: ISO(-1) },
    { entity_type: "notification",      entity_id: "n-3",       action: "DELIVERED", actor_id: "u-admin",        actor_role: "system",         new_state: { type: "deadline_warning" }, created_at: ISO(-5) },
    { entity_type: "case_step",         entity_id: "c-bmw",     action: "STEP_STARTED", actor_id: "u-functionar-rar", actor_role: "public_servant", new_state: { step: "rar_appointment" }, created_at: ISO(-4) },
    { entity_type: "profile",           entity_id: "u-cetatean", action: "LOGIN", actor_id: "u-cetatean",        actor_role: "citizen",        new_state: { ip: "demo" },              created_at: ISO(-1) },
    { entity_type: "profile",           entity_id: "u-functionar-dgpci", action: "LOGIN", actor_id: "u-functionar-dgpci", actor_role: "public_servant", new_state: { ip: "demo" }, created_at: ISO(-1) },
    { entity_type: "profile",           entity_id: "u-admin",   action: "VERIFY_CHAIN", actor_id: "u-admin",     actor_role: "system",         new_state: { result: "ok" },           created_at: ISO(0) },
  ];

  function hashStr(s: string): string {
    let h = 0xdeadbeef ^ s.length;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
    }
    h = (h ^ (h >>> 16)) >>> 0;
    return h.toString(16).padStart(8, "0").repeat(8);
  }

  events.forEach((e, i) => {
    const payload = `${e.entity_type}${e.entity_id}${e.action}${e.actor_id ?? ""}${JSON.stringify(e.new_state)}${prev}${e.created_at}`;
    const record_hash = hashStr(payload);
    entries.push({ ...e, id: i + 1, previous_hash: prev, record_hash } as AuditEntry);
    prev = record_hash;
  });

  return entries;
})();

export function getDemoProfileByEmail(email: string): Profile | undefined {
  return demoProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
}

export function getDemoProfileById(id: string): Profile | undefined {
  return demoProfiles.find((p) => p.id === id);
}

export function getCasesForCitizen(citizenId: string): RegistrationCase[] {
  return demoCases.filter((c) => c.citizen_id === citizenId);
}

export function getCasesForOrg(orgId: string): RegistrationCase[] {
  return demoCases.filter((c) => c.assigned_org_id === orgId);
}

export function getOrgById(id: string): Organization | undefined {
  return demoOrganizations.find((o) => o.id === id);
}

export function getVehicleById(id: string): Vehicle | undefined {
  return demoVehicles.find((v) => v.id === id);
}

export function getCaseById(id: string): RegistrationCase | undefined {
  return demoCases.find((c) => c.id === id);
}

export function getDocumentsForCase(caseId: string): DocumentRecord[] {
  return demoDocuments.filter((d) => d.case_id === caseId);
}

export function getAppointmentsForCase(caseId: string): AppointmentRecord[] {
  return demoAppointments.filter((a) => a.case_id === caseId);
}

export function getNotificationsForUser(userId: string): NotificationRecord[] {
  return demoNotifications.filter((n) => n.user_id === userId);
}

export const ORG_IDS = ORG;
