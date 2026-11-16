"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  MapPin,
  LayoutDashboard,
  Users,
  TrendingUp,
  ArrowLeftRight,
  Calculator,
  Wallet,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  QrCode,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  user: { name: string; email: string; role: string } | null;
}

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", legacyHref: "/dashboard", icon: LayoutDashboard },
  { label: "Land Management", href: "/admin/lands", legacyHref: "/lands", icon: MapPin },
  { label: "Customers", href: "/admin/customers", legacyHref: "/customers", icon: Users },
  { label: "Investments", href: "/admin/investments", legacyHref: "/investments", icon: TrendingUp },
  { label: "Payment Verification", href: "/admin/payments", legacyHref: "/payments", icon: ShieldCheck },
  { label: "Dynamic UPI Engine", href: "/admin/upi", legacyHref: "/upi", icon: QrCode },
  { label: "Daily Returns", href: "/admin/returns", legacyHref: "/daily-returns", icon: Calculator },
  { label: "Withdrawals", href: "/admin/withdrawals", legacyHref: "/withdrawals", icon: Wallet },
  { label: "Reports", href: "/admin/reports", legacyHref: "/reports", icon: FileBarChart },
  { label: "Settings", href: "/admin/settings", legacyHref: "/settings", icon: Settings },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/admin/login");
  };

  const isItemActive = (item: typeof navItems[0]) => {
    if (item.href === "/admin/dashboard") {
      return pathname === "/admin/dashboard" || pathname === "/dashboard";
    }
    return pathname.startsWith(item.href) || pathname.startsWith(item.legacyHref);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 bg-[#2563EB] rounded-lg flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white whitespace-nowrap">
              Land Investment
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
              ADMIN
            </span>
          </div>
        )}
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="ml-auto lg:hidden text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-[#2563EB] text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User profile & logout */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg",
            collapsed && "justify-center"
          )}
        >
          <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {user ? getInitials(user.name) : "A"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "Administrator"}
              </p>
              <p className="text-xs text-slate-400 truncate capitalize">
                {user?.role || "Super Admin"}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#142B4A] transform transition-transform duration-200 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col relative bg-[#142B4A] transition-all duration-200 ease-in-out shrink-0 h-full",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {sidebarContent}

        {/* Collapse toggle button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#1E293B] shadow-sm z-10"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>
    </>
  );
}
