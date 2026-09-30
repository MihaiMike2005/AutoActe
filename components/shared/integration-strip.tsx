import { integrationStatus } from "@/lib/env";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const LABELS: Record<keyof typeof integrationStatus, string> = {
  supabase: "Supabase",
  anthropic: "Claude API",
  elevenlabs: "ElevenLabs",
  resend: "Resend",
};

export function IntegrationStrip() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-[--color-muted-foreground]">Integrări:</span>
      {(Object.keys(LABELS) as Array<keyof typeof integrationStatus>).map((k) => {
        const on = integrationStatus[k];
        return (
          <Badge
            key={k}
            variant={on ? "success" : "muted"}
            className="gap-1"
            title={on ? "Cheie configurată" : "Lipsește cheia — fallback local"}
          >
            {on ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {LABELS[k]}
          </Badge>
        );
      })}
    </div>
  );
}
