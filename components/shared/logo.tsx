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
        "inline-flex items-center text-lg font-semibold tracking-tight",
        inverted && "text-white",
        className,
      )}
    >
      AutoActe
    </span>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
