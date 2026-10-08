"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Wallet, 
  Sparkles, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

// Data dummy untuk grafik penjualan 7 hari terakhir
const salesData = [
  { day: "Sen", total: 2100000 },
  { day: "Sel", total: 2800000 },
  { day: "Rab", total: 2400000 },
  { day: "Kam", total: 3100000 },
  { day: "Jum", total: 3800000 },
  { day: "Sab", total: 4500000 },
  { day: "Min", total: 4200000 },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ringkasan Bisnis</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Pantau performa tokomu hari ini.</p>
        </div>
      </div>

      {/* AI INSIGHT - Dibuat lebih visual seperti notifikasi cerdas */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
        <div className="bg-yellow-100 p-2 rounded-full text-yellow-600 mt-1">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-bold text-yellow-800 flex items-center gap-2">
            Insight Cerdas
          </h3>
          <p className="text-yellow-700 text-sm font-medium leading-relaxed mt-1">
            Penjualan naik 14% minggu ini! Namun margin <b>Ayam Geprek</b> turun 4% karena naiknya harga bahan baku. Pertimbangkan untuk menyesuaikan HPP atau membuat paket promo.
          </p>
        </div>
      </div>

      {/* KPI CARDS - Ikon besar, teks ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Omzet Hari Ini" value="Rp 4.5M" trend="+12%" isPositive={true} icon={<DollarSign size={22} />} />
        <MetricCard title="Laba Bersih" value="Rp 1.2M" trend="-2%" isPositive={false} icon={<Wallet size={22} />} />
        <MetricCard title="Transaksi" value="85" trend="+5%" isPositive={true} icon={<ShoppingCart size={22} />} />
        <MetricCard title="Barang Terjual" value="142" trend="+8%" isPositive={true} icon={<Package size={22} />} />
      </div>

      {/* MIDDLE SECTION - Grafik & Keuangan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAFIK */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-bold text-slate-800">Tren Penjualan (7 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a67c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00a67c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `Rp${value / 1000000}M`} />
                  <Tooltip 
                    formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, "Omzet"]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#00a67c" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* RINGKASAN KEUANGAN */}
        <Card className="shadow-sm border-slate-200 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-bold text-slate-800">Arus Kas (Bulan Ini)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-4 mt-2">
              <FinanceRow label="Pemasukan" value="Rp 45.000.000" color="text-[#00a67c]" />
              <FinanceRow label="Pengeluaran" value="Rp 32.000.000" color="text-red-500" />
              <div className="h-px w-full bg-slate-100 my-2"></div>
              <FinanceRow label="Piutang (Belum Dibayar)" value="Rp 800.000" color="text-amber-500" />
              <FinanceRow label="Hutang Toko" value="Rp 1.500.000" color="text-slate-600" />
            </div>
            
            <div className="mt-6 bg-[#00a67c]/10 rounded-lg p-4 text-center border border-[#00a67c]/20">
              <p className="text-xs font-bold text-[#00a67c] uppercase tracking-wider mb-1">Status Keuangan</p>
              <p className="text-lg font-extrabold text-[#00a67c]">SANGAT SEHAT</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM SECTION - Actionable Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LOW STOCK */}
        <Card className="shadow-sm border-slate-200 border-t-4 border-t-red-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-md font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" /> Butuh Restok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-2">
              <StockItem name="Beras Premium" sisa="2 kg" />
              <StockItem name="Minyak Goreng" sisa="1 Liter" />
              <StockItem name="Cabai Rawit" sisa="0.5 kg" />
            </div>
          </CardContent>
        </Card>

        {/* TOP PRODUCTS */}
        <Card className="shadow-sm border-slate-200 border-t-4 border-t-[#00a67c]">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-bold text-slate-800">Terlaris Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-2">
              <TopProduct name="Paket Ayam Geprek" qty="45 porsi" rank={1} />
              <TopProduct name="Es Teh Manis Jumbo" qty="38 gelas" rank={2} />
              <TopProduct name="Nasi Goreng Spesial" qty="20 porsi" rank={3} />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// --- SUB KOMPONEN UNTUK KERAPIAN KODE ---

function MetricCard({ title, value, trend, isPositive, icon }: any) {
  return (
    <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          </div>
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-100 text-[#00a67c]' : 'bg-red-100 text-red-600'}`}>
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-100 text-[#00a67c]' : 'bg-red-100 text-red-600'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend}
          </span>
          <span className="text-xs font-medium text-slate-400">vs kemarin</span>
        </div>
      </CardContent>
    </Card>
  );
}

function FinanceRow({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}

function StockItem({ name, sisa }: { name: string, sisa: string }) {
  return (
    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
      <div>
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <p className="text-xs font-medium text-red-500 mt-0.5">Sisa: {sisa}</p>
      </div>
      <button className="text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">
        Restok
      </button>
    </div>
  );
}

function TopProduct({ name, qty, rank }: { name: string, qty: string, rank: number }) {
  return (
    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>
          {rank}
        </div>
        <p className="font-bold text-slate-800 text-sm">{name}</p>
      </div>
      <span className="text-xs font-bold text-[#00a67c] bg-emerald-50 px-2 py-1 rounded-md">{qty}</span>
    </div>
  );
}