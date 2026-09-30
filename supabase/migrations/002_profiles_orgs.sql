CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cnp TEXT UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  county TEXT,
  city TEXT,
  address TEXT,
  role user_role NOT NULL DEFAULT 'citizen',
  preferred_language TEXT DEFAULT 'ro',
  accessibility_settings JSONB DEFAULT '{"high_contrast": false, "screen_reader": false, "font_size": "normal", "voice_guide": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type org_type NOT NULL,
  name TEXT NOT NULL,
  cui TEXT UNIQUE,
  county TEXT,
  city TEXT,
  address TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  contact_email TEXT,
  contact_phone TEXT,
  working_hours JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  position TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);
