"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  lands: "Land Management",
  customers: "Customers",
  investments: "Investments",
  transactions: "Transactions",
  "daily-returns": "Daily Returns",
  withdrawals: "Withdrawals",
  reports: "Reports",
  settings: "Settings",
  new: "New",
  edit: "Edit",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items
  const crumbs = segments.map((segment, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = labelMap[segment] || decodeURIComponent(segment);
    const isLast = idx === segments.length - 1;
    return { label, href, isLast };
  });

  return (
    <nav className="flex items-center text-sm" aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="text-gray-400 hover:text-[#2563EB] transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
          {crumb.isLast ? (
            <span className="font-medium text-[#1E293B]">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-gray-400 hover:text-[#2563EB] transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
