import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { tierFor } from "@/lib/ocr/confidence";

const TIERS = {
  high: { variant: "success", icon: CheckCircle2, label: "Citit clar" },
  medium: { variant: "warning", icon: AlertTriangle, label: "Verifică datele" },
  low: { variant: "danger", icon: XCircle, label: "Refă fotografia" },
} as const;

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const tier = TIERS[tierFor(confidence)];
  const Icon = tier.icon;
  return (
    <Badge variant={tier.variant} className="gap-1" title="Încrederea OCR în datele extrase">
      <Icon className="h-3 w-3" aria-hidden />
      {Math.round(confidence * 100)}% · {tier.label}
    </Badge>
  );
}
