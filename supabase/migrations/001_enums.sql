-- AutoActe: enum types shared across all tables.
CREATE TYPE user_role AS ENUM ('citizen', 'public_servant', 'dealer_user', 'system');

CREATE TYPE org_type AS ENUM (
  'dgpci', 'rar', 'anaf', 'dgitl', 'insurer', 'dealer', 'service_provider'
);

CREATE TYPE registration_scenario AS ENUM (
  'new_ro', 'used_ro', 'imported_eu', 'imported_non_eu'
);

CREATE TYPE case_status AS ENUM (
  'draft', 'in_progress', 'awaiting_institution', 'awaiting_citizen',
  'completed', 'rejected', 'cancelled'
);

CREATE TYPE step_code AS ENUM (
  'documents_upload', 'rca_insurance', 'anaf_tva_certificate', 'rar_appointment',
  'rar_validation', 'dgitl_fiscal_registration', 'dgpci_appointment', 'payment',
  'plate_issuance', 'document_delivery'
);

CREATE TYPE step_status AS ENUM (
  'pending', 'in_progress', 'completed', 'blocked', 'skipped', 'failed'
);

CREATE TYPE document_type AS ENUM (
  'id_card', 'brief_foreign', 'kaufvertrag', 'coc', 'civ', 'rca_policy',
  'itp_certificate', 'ownership_contract', 'tva_certificate', 'fiscal_certificate',
  'translation', 'other'
);
