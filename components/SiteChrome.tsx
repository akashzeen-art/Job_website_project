"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSavedJobs } from "@/components/SaveButton";

const LINKS = [
  { href: "/jobs", label: "Board" },
  { href: "/companies", label: "Houses" },
  { href: "/saved", label: "Saved" },
];

export function Header() {
  const pathname = usePathname();
  const { ids } = useSavedJobs();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:h-[4.25rem] sm:px-6">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-display text-[1.65rem] leading-none text-text">Meridian</span>
          <span className="hidden text-[11px] tracking-[0.22em] text-gold uppercase sm:inline">
            India
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`tracking-wide ${
                  active ? "text-text" : "text-muted hover:text-text"
                }`}
              >
                {link.label}
                {link.href === "/saved" && ids.length > 0 ? (
                  <span className="ml-1.5 text-gold">{ids.length}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { ids } = useSavedJobs();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-3">
        {LINKS.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(`${link.href}/`) ||
            (link.href === "/jobs" && pathname.startsWith("/jobs"));
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex h-14 flex-col items-center justify-center gap-1 text-[11px] tracking-[0.16em] uppercase ${
                  active ? "text-gold" : "text-muted"
                }`}
              >
                <span className={`h-px w-6 ${active ? "bg-gold" : "bg-transparent"}`} />
                <span>
                  {link.label}
                  {link.href === "/saved" && ids.length > 0 ? ` ${ids.length}` : ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Roles are read from official career pages. You apply with the employer.</p>
        <p className="text-[11px] tracking-[0.2em] text-gold uppercase">Est. for India desks</p>
      </div>
    </footer>
  );
}
