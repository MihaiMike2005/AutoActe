import { ArrowRight, Car, Globe, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireRoleOrRedirect } from "@/components/shared/role-required";
import { createDraftCaseAction } from "@/lib/cases/actions";

export const metadata = { title: "Dosar nou — AutoActe" };

const SCENARIOS = [
  {
    key: "new_ro",
    title: "Mașină nouă cumpărată în România",
    description:
      "De la un dealer autorizat, cu factură, CIV și COC. Cel mai scurt flux — DGPCI și plăcuțe.",
    badge: "Cel mai rapid",
    badgeVariant: "success" as const,
    icon: Car,
    estimated: "2 zile",
  },
  {
    key: "used_ro",
    title: "Mașină second-hand din România",
    description:
      "Cumpărată de la persoană fizică sau juridică. Transferăm proprietatea, plăcuțe noi sau păstrarea celor vechi.",
    badge: "Flux standard",
    badgeVariant: "default" as const,
    icon: Sparkles,
    estimated: "3-4 zile",
  },
  {
    key: "imported_eu",
    title: "Mașină importată din UE",
    description:
      "Termen legal 90 zile. Trec prin ANAF (certificat TVA), RAR (omologare + CIV) și DGPCI.",
    badge: "Termen 90 zile",
    badgeVariant: "warning" as const,
    icon: Globe,
    estimated: "7-14 zile",
  },
  {
    key: "imported_non_eu",
    title: "Mașină importată din afara UE",
    description:
      "Include vama. Documentele suplimentare apar în wizard automat când selectezi opțiunea.",
    badge: "Necesită vama",
    badgeVariant: "accent" as const,
    icon: Globe,
    estimated: "14-21 zile",
  },
];

export default async function NewCasePage() {
  await requireRoleOrRedirect("citizen");
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="space-y-2 text-center">
        <Badge variant="default">Pasul 1 din 2</Badge>
        <h1 className="text-3xl font-bold tracking-tight">Cum ai ajuns la această mașină?</h1>
        <p className="mx-auto max-w-2xl text-[--color-muted-foreground]">
          Alege scenariul potrivit — pașii din wizard și deadline-urile se adaptează automat.
          Poți schimba scenariul oricând până să încarci primul document.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SCENARIOS.map(({ key, title, description, badge, badgeVariant, icon: Icon, estimated }) => (
          <Card key={key} className="group transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[--color-primary]/10 text-[--color-primary]">
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant={badgeVariant}>{badge}</Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-[--color-muted-foreground]">{description}</p>
              </div>
              <form
                action={createDraftCaseAction}
                className="flex items-center justify-between border-t border-[--color-border] pt-4 text-sm"
              >
                <input type="hidden" name="scenario" value={key} />
                <div>
                  <div className="text-xs text-[--color-muted-foreground]">Durată tipică</div>
                  <div className="font-semibold">{estimated}</div>
                </div>
                <Button type="submit">
                  Continuă <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
