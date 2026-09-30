import { AppShell } from "@/components/shared/app-shell";
import { requireRoleOrRedirect } from "@/components/shared/role-required";

export default async function CitizenLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleOrRedirect("citizen");
  return (
    <AppShell session={session} variant="citizen">
      {children}
    </AppShell>
  );
}
