import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  inverted = false,
  href = "/",
}: {
  className?: string;
  inverted?: boolean;
  href?: string | null;
}) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <span
        className={cn(
          "inline-grid h-8 w-8 place-items-center rounded-lg text-xs font-bold",
          inverted ? "bg-white text-[--color-primary]" : "bg-[--color-primary] text-white",
        )}
        aria-hidden
      >
        AA
      </span>
      <span className="flex flex-col leading-tight">
        <span className={cn("text-base", inverted && "text-white")}>AutoActe</span>
        <span
          className={cn(
            "text-[10px] uppercase tracking-[0.18em]",
            inverted ? "text-white/70" : "text-[--color-muted-foreground]",
          )}
        >
          Digital Romania
        </span>
      </span>
    </span>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
