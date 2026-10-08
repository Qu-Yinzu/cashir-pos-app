"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Calculator, 
  Wallet, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Megaphone, 
  FileText, 
  Settings, 
  HelpCircle, 
  Bell, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

// Daftar menu dengan ikon dan path-nya masing-masing
const menuItems = [
  { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
  { name: "KASIR", href: "/dashboard/pos", icon: Store },
  { name: "PRODUK & STOK", href: "/dashboard/products", icon: Package },
  { name: "HPP & PRODUKSI", href: "/dashboard/hpp", icon: Calculator },
  { name: "KEUANGAN", href: "#", icon: Wallet },
  { name: "PELANGGAN", href: "#", icon: Users },
  { name: "ANALISIS BISNIS", href: "#", icon: TrendingUp },
  { name: "AI BUSINESS ASSISTANT", href: "#", icon: Sparkles },
  { name: "MARKETING", href: "#", icon: Megaphone },
  { name: "LAPORAN", href: "#", icon: FileText },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        
        {/* OVERLAY MOBILE: Muncul saat sidebar dibuka di HP */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#00a67c] flex flex-col justify-between shadow-2xl md:shadow-xl transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <div className="flex flex-col h-full">
            
            {/* Header Mobile: Tombol Close (Hanya tampil di HP) */}
            <div className="flex items-center justify-between p-4 md:hidden">
              <div className="bg-white/20 text-white px-3 py-1 rounded-lg font-black text-xs tracking-wider shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                CASH-IR
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile */}
            <div className="bg-white/10 backdrop-blur-md p-4 mx-3 mb-3 mt-1 md:mt-3 rounded-xl flex items-center gap-3 border border-white/10">
              <div className="w-10 h-10 bg-white text-[#00a67c] rounded-full flex items-center justify-center font-black shadow-sm shrink-0">
                TK
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-white text-sm truncate">Toko Kasim</p>
                <p className="text-xs text-emerald-100 font-medium truncate">Owner / Admin</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1.5 custom-scrollbar">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href || (
                  item.href !== "/dashboard" &&
                  item.href !== "#" &&
                  pathname.startsWith(`${item.href}/`)
                );
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)} // Tutup sidebar otomatis di HP saat menu diklik
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 group ${
                      isActive 
                        ? "bg-white text-[#00a67c] shadow-md md:translate-x-1" 
                        : "text-white hover:bg-white/15 md:hover:translate-x-1"
                    }`}
                  >
                    <IconComponent size={18} className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-[#00a67c]" : "text-emerald-100"}`} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Sidebar */}
            <div className="p-3 bg-emerald-950/20 backdrop-blur-sm border-t border-white/10 flex flex-col gap-1 mt-auto">
              <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-emerald-100 hover:bg-white/10 hover:text-white transition-all">
                <Settings size={16} className="shrink-0" /> PENGATURAN
              </Link>
              <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-emerald-100 hover:bg-white/10 hover:text-white transition-all">
                <HelpCircle size={16} className="shrink-0" /> BANTUAN
              </Link>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* TOP NAVBAR */}
          <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 shadow-md z-10 shrink-0">
            <div className="flex items-center gap-3">
              {/* Tombol Menu Mobile (Hamburger) */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="text-white md:hidden hover:bg-slate-800 p-2 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
              
              <div className="hidden md:flex bg-[#00a67c] text-white px-4 py-1.5 rounded-lg font-black text-xs tracking-wider shadow-sm items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                CASH-IR SYSTEM
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 text-slate-300">
              <button className="p-2 hover:bg-slate-800 rounded-full transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
              </button>
              <div className="h-5 w-px bg-slate-700 mx-0.5 md:mx-1"></div>
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="p-2 hover:bg-slate-800 rounded-full hover:text-red-400 transition-colors" 
                title="Keluar"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 relative">
            {children}
          </main>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <LogOut size={28} className="ml-1" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Yakin ingin keluar?</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">
                Sesi Anda akan diakhiri dan Anda harus login kembali untuk masuk ke sistem.
              </p>
              
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <form action={logout} className="flex-1">
                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md shadow-red-200"
                  >
                    Ya, Keluar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

