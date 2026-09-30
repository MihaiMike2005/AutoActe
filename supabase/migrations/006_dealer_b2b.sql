CREATE TABLE dealer_batch_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_org_id UUID NOT NULL REFERENCES organizations(id),
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  batch_name TEXT,
  total_vehicles INTEGER NOT NULL,
  completed_vehicles INTEGER DEFAULT 0,
  failed_vehicles INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE dealer_batch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES dealer_batch_registrations(id) ON DELETE CASCADE,
  case_id UUID REFERENCES registration_cases(id),
  vehicle_data JSONB NOT NULL,
  buyer_data JSONB NOT NULL,
  status TEXT DEFAULT 'queued',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
