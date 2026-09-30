CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES registration_cases(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  ocr_extracted_data JSONB,
  ocr_confidence NUMERIC(3,2),
  ocr_provider TEXT DEFAULT 'claude-vision',
  validated BOOLEAN DEFAULT false,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  validated_by UUID REFERENCES profiles(id),
  validated_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_documents_owner ON documents(owner_id);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES registration_cases(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'RON',
  purpose TEXT NOT NULL,
  payment_method TEXT,
  transaction_ref TEXT,
  recipient_org_id UUID REFERENCES organizations(id),
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES registration_cases(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  service_type TEXT,
  location TEXT,
  confirmation_code TEXT UNIQUE,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
