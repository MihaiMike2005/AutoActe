CREATE TABLE marketplace_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_org_id UUID NOT NULL REFERENCES organizations(id),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_from NUMERIC(10,2),
  price_to NUMERIC(10,2),
  counties_served TEXT[] DEFAULT '{}',
  estimated_duration_hours INTEGER,
  average_rating NUMERIC(2,1) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES registration_cases(id),
  service_id UUID NOT NULL REFERENCES marketplace_services(id),
  citizen_id UUID NOT NULL REFERENCES profiles(id),
  provider_org_id UUID NOT NULL REFERENCES organizations(id),
  agreed_price NUMERIC(10,2),
  status TEXT DEFAULT 'requested',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES service_orders(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
