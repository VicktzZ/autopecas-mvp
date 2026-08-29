"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

const sections: NavSection[] = [
  {
    title: "Operação",
    links: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/estoque", label: "Estoque", icon: Package },
      { href: "/vendas", label: "Vendas", icon: ShoppingCart },
    ],
  },
  {
    title: "Cadastros",
    links: [
      { href: "/clientes", label: "Clientes", icon: Users },
      { href: "/fornecedores", label: "Fornecedores", icon: Truck },
    ],
  },
  {
    title: "Análise",
    links: [{ href: "/relatorios", label: "Relatórios", icon: BarChart3 }],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground shadow-sm">
          <Wrench className="size-4.5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-heading font-semibold tracking-tight">AutoPeças</span>
          <span className="text-[11px] text-sidebar-foreground/50">
            Estoque &amp; Vendas
          </span>
        </div>
      </div>
      <div className="mx-4 h-px bg-sidebar-border" />
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <span className="px-3 text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/40">
              {section.title}
            </span>
            {section.links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-4.5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                  )}
                  <Icon
                    className={cn(
                      "size-4 transition-colors",
                      active
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                    )}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="mt-auto flex items-center justify-between gap-2 p-4">
        <span className="text-[11px] text-sidebar-foreground/40">
          MVP com dados simulados
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
}
