-- Auto-publish state changes to outbox + audit_log.

CREATE OR REPLACE FUNCTION publish_case_event() RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_payload    JSONB;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    v_event_type := 'ro.autoacte.case.created';
  ELSIF (TG_OP = 'UPDATE' AND NEW.status <> OLD.status) THEN
    v_event_type := 'ro.autoacte.case.status_changed';
  ELSIF (TG_OP = 'UPDATE' AND NEW.completed_at IS NOT NULL
         AND OLD.completed_at IS NULL) THEN
    v_event_type := 'ro.autoacte.case.completed';
  ELSE
    RETURN NEW;
  END IF;

  v_payload := jsonb_build_object(
    'case_id',     NEW.id,
    'case_number', NEW.case_number,
    'citizen_id',  NEW.citizen_id,
    'scenario',    NEW.scenario,
    'status',      NEW.status,
    'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status END
  );

  INSERT INTO outbox (event_type, payload) VALUES (v_event_type, v_payload);

  PERFORM add_audit_entry(
    'registration_case', NEW.id, TG_OP,
    auth.uid(), NULL, NULL,
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    to_jsonb(NEW)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_case_event
  AFTER INSERT OR UPDATE ON registration_cases
  FOR EACH ROW EXECUTE FUNCTION publish_case_event();

CREATE OR REPLACE FUNCTION publish_step_event() RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status <> OLD.status) THEN
    v_event_type := CASE NEW.status
      WHEN 'in_progress' THEN 'ro.autoacte.step.started'
      WHEN 'completed'   THEN 'ro.autoacte.step.completed'
      WHEN 'blocked'     THEN 'ro.autoacte.step.blocked'
      ELSE 'ro.autoacte.step.changed'
    END;

    INSERT INTO outbox (event_type, payload)
    VALUES (
      v_event_type,
      jsonb_build_object(
        'case_id',   NEW.case_id,
        'step_code', NEW.step_code,
        'status',    NEW.status,
        'previous_status', OLD.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_step_event
  AFTER UPDATE ON case_steps
  FOR EACH ROW EXECUTE FUNCTION publish_step_event();

CREATE OR REPLACE FUNCTION publish_document_event() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO outbox (event_type, payload)
    VALUES (
      'ro.autoacte.document.uploaded',
      jsonb_build_object(
        'document_id', NEW.id,
        'case_id',     NEW.case_id,
        'type',        NEW.type,
        'owner_id',    NEW.owner_id
      )
    );
  ELSIF (TG_OP = 'UPDATE' AND NEW.validated AND NOT OLD.validated) THEN
    INSERT INTO outbox (event_type, payload)
    VALUES (
      'ro.autoacte.document.validated',
      jsonb_build_object('document_id', NEW.id, 'case_id', NEW.case_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_document_event
  AFTER INSERT OR UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION publish_document_event();
