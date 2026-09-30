export type UserRole = "citizen" | "public_servant" | "dealer_user" | "system";

export type OrgType =
  | "dgpci"
  | "rar"
  | "anaf"
  | "dgitl"
  | "insurer"
  | "dealer"
  | "service_provider";

export type RegistrationScenario =
  | "new_ro"
  | "used_ro"
  | "imported_eu"
  | "imported_non_eu";

export type CaseStatus =
  | "draft"
  | "in_progress"
  | "awaiting_institution"
  | "awaiting_citizen"
  | "completed"
  | "rejected"
  | "cancelled";

export type StepCode =
  | "documents_upload"
  | "rca_insurance"
  | "anaf_tva_certificate"
  | "rar_appointment"
  | "rar_validation"
  | "dgitl_fiscal_registration"
  | "dgpci_appointment"
  | "payment"
  | "plate_issuance"
  | "document_delivery";

export type StepStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "blocked"
  | "skipped"
  | "failed";

export type DocumentType =
  | "id_card"
  | "brief_foreign"
  | "kaufvertrag"
  | "coc"
  | "civ"
  | "rca_policy"
  | "itp_certificate"
  | "ownership_contract"
  | "tva_certificate"
  | "fiscal_certificate"
  | "translation"
  | "other";

export interface Profile {
  id: string;
  cnp?: string;
  full_name: string;
  email: string;
  phone?: string;
  county?: string;
  city?: string;
  address?: string;
  role: UserRole;
  preferred_language: string;
  accessibility_settings: {
    high_contrast: boolean;
    screen_reader: boolean;
    font_size: "small" | "normal" | "large";
    voice_guide: boolean;
  };
  organization_ids?: string[];
  created_at: string;
}

export interface Organization {
  id: string;
  type: OrgType;
  name: string;
  cui?: string;
  county?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  contact_email?: string;
  contact_phone?: string;
  working_hours?: Record<string, string>;
}

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  fuel_type?: string;
  engine_capacity_cc?: number;
  power_kw?: number;
  co2_emissions_g_km?: number;
  mass_kg?: number;
  category?: string;
  euro_standard?: string;
  license_plate?: string;
  current_owner_id?: string;
  imported_from_country?: string;
  imported_at?: string;
  purchase_value_ron?: number;
}

export interface CaseStep {
  id: string;
  case_id: string;
  step_code: StepCode;
  status: StepStatus;
  assigned_org_id?: string;
  display_order: number;
  started_at?: string;
  completed_at?: string;
  blocker_reason?: string;
  notes?: string;
}

export interface RegistrationCase {
  id: string;
  case_number: string;
  citizen_id: string;
  vehicle_id: string;
  scenario: RegistrationScenario;
  status: CaseStatus;
  current_step: StepCode;
  estimated_total_cost?: number;
  total_paid: number;
  legal_deadline?: string;
  assigned_org_id?: string;
  assigned_servant_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  steps: CaseStep[];
}

export interface DocumentRecord {
  id: string;
  case_id?: string;
  vehicle_id?: string;
  owner_id: string;
  type: DocumentType;
  file_url: string;
  file_hash: string;
  file_size_bytes?: number;
  mime_type?: string;
  ocr_extracted_data?: Record<string, unknown>;
  ocr_confidence?: number;
  ocr_provider?: string;
  validated: boolean;
  validation_errors: Array<{ field: string; message: string }>;
  validated_by?: string;
  validated_at?: string;
  uploaded_at: string;
}

export interface PaymentRecord {
  id: string;
  case_id: string;
  amount: number;
  currency: string;
  purpose: string;
  payment_method?: string;
  transaction_ref?: string;
  recipient_org_id?: string;
  status: "pending" | "completed" | "failed";
  paid_at?: string;
  created_at: string;
}

export interface AppointmentRecord {
  id: string;
  case_id: string;
  organization_id: string;
  scheduled_at: string;
  duration_minutes: number;
  service_type?: string;
  location?: string;
  confirmation_code: string;
  status: "scheduled" | "completed" | "cancelled";
  created_at: string;
}

export interface MarketplaceService {
  id: string;
  provider_org_id: string;
  category: "translation" | "transport" | "rar_assistance" | "towing";
  name: string;
  description?: string;
  price_from: number;
  price_to: number;
  counties_served: string[];
  estimated_duration_hours: number;
  average_rating: number;
  total_orders: number;
  active: boolean;
}

export interface ServiceOrder {
  id: string;
  case_id?: string;
  service_id: string;
  citizen_id: string;
  provider_org_id: string;
  agreed_price: number;
  status: "requested" | "accepted" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
  completed_at?: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  case_id?: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  read: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
}

export interface AuditEntry {
  id: number;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id?: string;
  actor_role?: UserRole;
  actor_org_id?: string;
  previous_state?: Record<string, unknown> | null;
  new_state?: Record<string, unknown> | null;
  previous_hash: string;
  record_hash: string;
  created_at: string;
}

export interface CloudEvent<T = unknown> {
  id: string;
  specversion: "1.0";
  type: string;
  source: string;
  time: string;
  datacontenttype: "application/json";
  data: T;
}
