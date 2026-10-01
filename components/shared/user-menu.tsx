"use client";

import { startTransition } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { FileText, LogOut, User } from "lucide-react";
import { toast } from "sonner";
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

export function UserMenu({
  fullName,
  email,
  initials,
}: {
  fullName: string;
  email: string;
  initials: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <div className="text-sm font-semibold leading-tight">{fullName}</div>
            <div className="text-xs text-[--color-muted-foreground]">{email}</div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{email}</DropdownMenuLabel>
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
        {/* A <form> inside the item is unmounted when the menu closes on select, before the browser submits it. */}
        <DropdownMenuItem
          onSelect={() =>
            startTransition(async () => {
              try {
                await logoutAction();
              } catch (error) {
                // A successful logout rejects with Next's redirect error; let the router handle it.
                unstable_rethrow(error);
                toast.error("Deconectarea a eșuat. Încearcă din nou.");
              }
            })
          }
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Deconectare
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
