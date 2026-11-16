"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Breadcrumbs from "./breadcrumbs";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
  user: { name: string; email: string; role: string } | null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Topbar({ onMenuClick, user }: TopbarProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-[#1E293B] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:block">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search platform..."
              className="w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-[#1E293B] hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#142B4A] flex items-center justify-center text-white text-xs font-semibold">
                {user ? getInitials(user.name) : "?"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-[#1E293B] leading-tight">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-400 capitalize leading-tight">
                  {user?.role || ""}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-gray-400 transition-transform hidden sm:block",
                  profileOpen && "rotate-180"
                )}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                {user && (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-[#1E293B]">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                    <span className="inline-block mt-1.5 text-xs font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>
                )}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/dashboard/settings");
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/dashboard/settings");
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
