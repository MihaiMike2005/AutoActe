import { requireRole, type Session } from "@/lib/auth/session";
import type { RegistrationCase } from "@/types/domain";

export function canAdvanceCase(session: Session | null, c: RegistrationCase): boolean {
  if (!session) return false;
  if (requireRole(session, "citizen")) {
    return session.role === "system" || c.citizen_id === session.user_id;
  }
  // Phase 4: allow requireRole(session, "public_servant") when session.organization_ids
  // includes the current step's assigned_org_id (falling back to c.assigned_org_id).
  return false;
}
