CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vin TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  fuel_type TEXT,
  engine_capacity_cc INTEGER,
  power_kw INTEGER,
  co2_emissions_g_km INTEGER,
  mass_kg INTEGER,
  category TEXT,
  euro_standard TEXT,
  license_plate TEXT UNIQUE,
  current_owner_id UUID REFERENCES profiles(id),
  imported_from_country TEXT,
  imported_at DATE,
  purchase_value_ron NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_vin ON vehicles(vin);
CREATE INDEX idx_vehicles_owner ON vehicles(current_owner_id);

CREATE TABLE registration_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  citizen_id UUID NOT NULL REFERENCES profiles(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  scenario registration_scenario NOT NULL,
  status case_status NOT NULL DEFAULT 'draft',
  current_step step_code NOT NULL DEFAULT 'documents_upload',
  estimated_total_cost NUMERIC(10,2),
  total_paid NUMERIC(10,2) DEFAULT 0,
  legal_deadline DATE,
  assigned_org_id UUID REFERENCES organizations(id),
  assigned_servant_id UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_cases_citizen ON registration_cases(citizen_id);
CREATE INDEX idx_cases_status ON registration_cases(status);
CREATE INDEX idx_cases_assigned ON registration_cases(assigned_servant_id);

CREATE TABLE case_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES registration_cases(id) ON DELETE CASCADE,
  step_code step_code NOT NULL,
  status step_status NOT NULL DEFAULT 'pending',
  assigned_org_id UUID REFERENCES organizations(id),
  display_order INTEGER NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  blocker_reason TEXT,
  notes TEXT,
  UNIQUE(case_id, step_code)
);
