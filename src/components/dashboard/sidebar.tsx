"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  WalletCards,
  Tags,
  Repeat,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: ReceiptText,
  },
  {
    title: "Budgets",
    href: "/dashboard/budgets",
    icon: WalletCards,
  },
  {
    title: "Analytics & Reports",
    href: "/dashboard/analytics",
    icon: PieChart,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: Tags,
  },
  {
    title: "Recurring Schedules",
    href: "/dashboard/recurring",
    icon: Repeat,
  },
];

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button - Top Left overlay */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-9 w-9 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/95 transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64",
          // Mobile responsive placement
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/60">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 overflow-hidden focus:outline-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 shadow-md shadow-blue-500/20 text-white font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100 text-base leading-tight">
                  ApexFinance
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
                  Smart Expense Hub
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.title : undefined}
                className={cn(
                  "group relative flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold shadow-sm shadow-blue-500/5"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  )}
                />
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Logout Section */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg p-2 bg-slate-50 dark:bg-slate-900/60",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold dark:bg-blue-900/50 dark:text-blue-300 text-xs uppercase">
                {user?.name ? user.name.slice(0, 2) : "US"}
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {user?.name || "User"}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {user?.email || "user@example.com"}
                  </span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-md p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
