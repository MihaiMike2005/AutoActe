-- RLS policies. Apply only at Phase 8 (final hours).
-- Keep this file as documentation — do NOT run during initial dev.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_batch_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_orgs() RETURNS UUID[] AS $$
  SELECT COALESCE(array_agg(organization_id), '{}')
  FROM organization_members
  WHERE user_id = auth.uid() AND active = true
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Profile: owner-or-servant.
CREATE POLICY profiles_self_select ON profiles FOR SELECT
  USING (id = auth.uid() OR current_user_role() IN ('public_servant', 'system'));

CREATE POLICY profiles_self_update ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Cases: citizen owns; servant sees those assigned to her org; system sees all.
CREATE POLICY cases_citizen ON registration_cases FOR ALL
  USING (citizen_id = auth.uid());

CREATE POLICY cases_servant ON registration_cases FOR SELECT
  USING (assigned_org_id = ANY (current_user_orgs()));

CREATE POLICY cases_servant_update ON registration_cases FOR UPDATE
  USING (assigned_org_id = ANY (current_user_orgs()))
  WITH CHECK (assigned_org_id = ANY (current_user_orgs()));

-- Steps inherit from case.
CREATE POLICY case_steps_via_case ON case_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM registration_cases c
      WHERE c.id = case_id
        AND (c.citizen_id = auth.uid()
             OR c.assigned_org_id = ANY (current_user_orgs()))
    )
  );

-- Documents: owner or servant on the case.
CREATE POLICY documents_owner ON documents FOR ALL
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM registration_cases c
      WHERE c.id = case_id
        AND c.assigned_org_id = ANY (current_user_orgs())
    )
  );

CREATE POLICY payments_via_case ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM registration_cases c
      WHERE c.id = case_id
        AND (c.citizen_id = auth.uid()
             OR c.assigned_org_id = ANY (current_user_orgs()))
    )
  );

CREATE POLICY notifications_self ON notifications FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY service_orders_self ON service_orders FOR ALL
  USING (
    citizen_id = auth.uid()
    OR provider_org_id = ANY (current_user_orgs())
  );

-- Audit log: read-only for everyone, write-only via SECURITY DEFINER function.
CREATE POLICY audit_log_read ON audit_log FOR SELECT USING (true);
