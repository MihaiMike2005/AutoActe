import Link from "next/link";
import { Logo } from "./logo";
import { Bell, FileText, Home, LayoutGrid, LogOut, ShoppingBag, User } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Session } from "@/lib/auth/session";
import { getNotificationsForUser } from "@/lib/mock/demo-data";

type NavItem = { href: string; label: string; icon: React.ElementType };

const CITIZEN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Acasă", icon: Home },
  { href: "/cases/new", label: "Dosar nou", icon: LayoutGrid },
  { href: "/documents", label: "Documente", icon: FileText },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
];

const SERVANT_NAV: NavItem[] = [
  { href: "/inbox", label: "Inbox", icon: Home },
  { href: "/analytics", label: "Statistici", icon: LayoutGrid },
];

const DEALER_NAV: NavItem[] = [
  { href: "/dealer/dashboard", label: "Acasă dealer", icon: Home },
  { href: "/dealer/batch/new", label: "Batch nou", icon: LayoutGrid },
];

export function AppShell({
  session,
  variant,
  children,
}: {
  session: Session;
  variant: "citizen" | "servant" | "dealer";
  children: React.ReactNode;
}) {
  const nav =
    variant === "citizen" ? CITIZEN_NAV : variant === "servant" ? SERVANT_NAV : DEALER_NAV;
  const initials = session.full_name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const unread = getNotificationsForUser(session.user_id).filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[--color-border] bg-white md:flex">
        <div className="flex h-16 items-center px-6">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[--color-foreground] hover:bg-[--color-secondary] transition-colors"
              >
                <Icon className="h-4 w-4 text-[--color-muted-foreground]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/ledger"
          className="mx-3 mb-3 rounded-lg border border-[--color-border] bg-[--color-background] p-3 transition-colors hover:bg-[--color-secondary]"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-[--color-muted-foreground]">
            Audit ledger
          </div>
          <div className="mt-1 text-sm">Verifică integritatea criptografică ›</div>
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[--color-border] bg-white/85 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <Logo />
          </div>
          <div className="hidden text-sm text-[--color-muted-foreground] md:block">
            {variant === "citizen" && "Portal cetățean"}
            {variant === "servant" && "Portal funcționar"}
            {variant === "dealer" && "Portal dealer B2B"}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notificări" className="relative">
              <Bell className="h-4 w-4" />
              {unread > 0 ? (
                <Badge
                  variant="danger"
                  className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full p-0 px-1 text-[10px]"
                >
                  {unread}
                </Badge>
              ) : null}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar>
                    <AvatarFallback>{initials || "AA"}</AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left md:block">
                    <div className="text-sm font-semibold leading-tight">{session.full_name}</div>
                    <div className="text-xs text-[--color-muted-foreground]">{session.email}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{session.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ledger" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Audit ledger
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 text-left text-red-600"
                    >
                      <LogOut className="h-4 w-4" /> Deconectare
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 md:px-8 md:py-10">{children}</main>

        <nav className="sticky bottom-0 z-10 flex items-stretch justify-around border-t border-[--color-border] bg-white/95 px-1 py-1 backdrop-blur md:hidden">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[11px] font-medium text-[--color-muted-foreground] hover:text-[--color-foreground]"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/profile"
            className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[11px] font-medium text-[--color-muted-foreground] hover:text-[--color-foreground]"
          >
            <User className="h-5 w-5" />
            Profil
          </Link>
        </nav>
      </div>
    </div>
  );
}
