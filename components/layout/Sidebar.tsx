// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText, LayoutDashboard, Users, ClipboardList,
  Archive, CheckSquare, Send, BookOpen, LogOut, FileSearch,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navByRole: Record<UserRole, NavItem[]> = {
  STAFF: [
    { label: "Dashboard", href: "/dashboard/staff", icon: LayoutDashboard },
    { label: "Buat Dokumen", href: "/dashboard/staff/buat-dokumen", icon: FileText },
    { label: "Dokumen Saya", href: "/dashboard/staff/dokumen", icon: ClipboardList },
    { label: "Upload Scan Final", href: "/dashboard/staff/scan-final", icon: Send },
  ],
  AGENDARIS: [], // Role ini disembunyikan/dilenyapkan
  DIREKTUR: [
    { label: "Dashboard", href: "/dashboard/direktur", icon: LayoutDashboard },
    { label: "Menunggu Keputusan", href: "/dashboard/direktur/antrian", icon: ClipboardList },
    { label: "Riwayat Keputusan", href: "/dashboard/direktur/riwayat", icon: CheckSquare },
    { label: "Semua Dokumen", href: "/dashboard/direktur/dokumen", icon: BookOpen },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Inbox Masuk", href: "/dashboard/admin/inbox", icon: ClipboardList },
    { label: "Review Dokumen", href: "/dashboard/admin/review", icon: FileSearch },
    { label: "Antrian Arsip", href: "/dashboard/admin/arsip", icon: Archive },
    { label: "Semua Dokumen", href: "/dashboard/admin/dokumen", icon: BookOpen },
    { label: "Kelola Pengguna", href: "/dashboard/admin/users", icon: Users },
    { label: "Audit Log", href: "/dashboard/admin/audit", icon: BookOpen },
  ],
};

interface Props {
  role: UserRole;
  userName: string;
}

export function Sidebar({ role, userName }: Props) {
  const pathname = usePathname();
  const navItems = navByRole[role] ?? [];

  const roleLabel: Record<UserRole, string> = {
    STAFF: "Admin Bagian",
    AGENDARIS: "Agendaris",
    DIREKTUR: "Direktur Utama",
    ADMIN: "Administrator",
  };

  return (
    <aside className="w-64 bg-blue-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">SIPAS PDAM</p>
            <p className="text-xs text-blue-300 leading-tight">Arsip Digital</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-blue-800">
        <p className="text-xs text-blue-400 mb-1">Login sebagai</p>
        <p className="font-semibold text-sm leading-tight truncate">{userName}</p>
        <span className="inline-block mt-1 text-xs bg-blue-700 px-2 py-0.5 rounded-full text-blue-100">
          {roleLabel[role]}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-blue-700 text-white font-medium"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-blue-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-blue-200
                     hover:bg-blue-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
