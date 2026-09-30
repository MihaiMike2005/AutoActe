CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(id),
  actor_role user_role,
  actor_org_id UUID REFERENCES organizations(id),
  previous_state JSONB,
  new_state JSONB,
  previous_hash TEXT NOT NULL
    DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
  record_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_actor  ON audit_log(actor_id);

CREATE OR REPLACE FUNCTION add_audit_entry(
  p_entity_type TEXT, p_entity_id UUID, p_action TEXT,
  p_actor_id UUID, p_actor_role user_role, p_actor_org_id UUID,
  p_previous_state JSONB, p_new_state JSONB
) RETURNS BIGINT AS $$
DECLARE
  v_previous_hash TEXT;
  v_record_hash   TEXT;
  v_record_id     BIGINT;
  v_payload       TEXT;
BEGIN
  SELECT record_hash INTO v_previous_hash
    FROM audit_log ORDER BY id DESC LIMIT 1;

  IF v_previous_hash IS NULL THEN
    v_previous_hash := '0000000000000000000000000000000000000000000000000000000000000000';
  END IF;

  v_payload := p_entity_type || p_entity_id::TEXT || p_action ||
               COALESCE(p_actor_id::TEXT, '') ||
               COALESCE(p_previous_state::TEXT, '') ||
               COALESCE(p_new_state::TEXT, '') ||
               v_previous_hash || NOW()::TEXT;

  v_record_hash := encode(digest(v_payload, 'sha256'), 'hex');

  INSERT INTO audit_log (
    entity_type, entity_id, action, actor_id, actor_role, actor_org_id,
    previous_state, new_state, previous_hash, record_hash
  )
  VALUES (
    p_entity_type, p_entity_id, p_action, p_actor_id, p_actor_role, p_actor_org_id,
    p_previous_state, p_new_state, v_previous_hash, v_record_hash
  )
  RETURNING id INTO v_record_id;

  RETURN v_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION verify_audit_chain()
RETURNS TABLE(total_entries BIGINT, valid BOOLEAN, broken_at BIGINT) AS $$
DECLARE
  v_expected_prev TEXT := '0000000000000000000000000000000000000000000000000000000000000000';
  v_rec RECORD;
  v_count BIGINT := 0;
BEGIN
  FOR v_rec IN SELECT * FROM audit_log ORDER BY id ASC LOOP
    v_count := v_count + 1;
    IF v_rec.previous_hash != v_expected_prev THEN
      RETURN QUERY SELECT v_count, false, v_rec.id;
      RETURN;
    END IF;
    v_expected_prev := v_rec.record_hash;
  END LOOP;
  RETURN QUERY SELECT v_count, true, NULL::BIGINT;
END;
$$ LANGUAGE plpgsql;
