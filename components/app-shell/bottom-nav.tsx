"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, MOBILE_NAV_HREFS } from "./nav-items";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();
  // On n'affiche que les onglets sélectionnés pour le mobile.
  const items = MOBILE_NAV_HREFS.map(
    (href) => NAV_ITEMS.find((i) => i.href === href)!
  );

  return (
    // Fixée en bas, masquée sur desktop (lg:hidden). Fond flouté translucide.
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[72px] items-start justify-around border-t border-border bg-background/90 pt-2.5 backdrop-blur lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);

        const content = (
          <>
            <Icon className="size-6" />
            <span className="font-mono text-[10px]">{item.label}</span>
          </>
        );

        if (item.disabled) {
          return (
            <span
              key={item.href}
              className="flex flex-col items-center gap-1 text-muted-foreground/40"
            >
              {content}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
