"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Printer,
  ChevronDown,
  Calculator,
  ChefHat,
  PackageOpen,
  PieChart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import EditOverheadModal from "./EditOverheadModal";

const TABS = [
  { id: "analisis", label: "Analisis HPP & Margin", icon: PieChart },
  { id: "resep", label: "Resep & Komposisi", icon: ChefHat },
  { id: "simulasi", label: "Kalkulator Simulasi Margin", icon: Calculator },
  { id: "overhead", label: "Biaya Overhead & Kemasan", icon: PackageOpen },
];

const ITEMS_PER_PAGE = 10;

export default function HppView({ products, categories }: { products: any[]; categories: any[] }) {
  const [activeTab, setActiveTab] = useState("analisis");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [sortOrder, setSortOrder] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  // State Khusus Tab Simulasi
  const [simulatedProductId, setSimulatedProductId] = useState<string>("");
  const [simulatedPrice, setSimulatedPrice] = useState<number>(0);

  const formatRp = (num: number) => `Rp ${Number(num).toLocaleString("id-ID")}`;

  // KALKULASI HPP & MARGIN NYATA DARI KOMPOSISI RESEP
  const analyzedProducts = useMemo(() => {
    return products.map((p) => {
      // 1. Hitung Total Biaya Bebas (Bensin, Kemasan, dll)
      let overheadTotal = 0;
      if (p.overheads && p.overheads.length > 0) {
        overheadTotal = p.overheads.reduce((sum: number, o: any) => sum + Number(o.price), 0);
      }

      let hpp = overheadTotal;

      // 2. Hitung Total Modal Bahan Baku
      if (p.recipeIngredients && p.recipeIngredients.length > 0) {
        hpp += p.recipeIngredients.reduce((total: number, recipe: any) => {
          const rawPrice = recipe.rawMaterial?.pricePerUnit || 0;
          return total + rawPrice * recipe.amount;
        }, 0);
      }

      const marginRp = p.price - hpp;
      const marginPercent = p.price > 0 ? (marginRp / p.price) * 100 : 0;

      let status = "AMAN";
      if (hpp === 0) status = "BELUM DISET";
      else if (marginPercent < 20) status = "KRITIS";
      else if (marginPercent < 35) status = "WASPADA";

      return { ...p, hpp, marginRp, marginPercent, status };
    });
  }, [products]);

  // FILTER & SORTING
  const filteredProducts = useMemo(() => {
    let result = analyzedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "Semua" || p.categories?.some((c: any) => c.id === selectedCategory)),
    );

    if (sortOrder === "margin_asc") result.sort((a, b) => a.marginPercent - b.marginPercent);
    if (sortOrder === "margin_desc") result.sort((a, b) => b.marginPercent - a.marginPercent);

    return result;
  }, [analyzedProducts, searchTerm, selectedCategory, sortOrder]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // LOGIKA SIMULASI TERPILIH
  const selectedSimProduct = analyzedProducts.find((p) => p.id === simulatedProductId);
  const simMarginRp = simulatedPrice - (selectedSimProduct?.hpp || 0);
  const simMarginPercent = simulatedPrice > 0 ? (simMarginRp / simulatedPrice) * 100 : 0;

  // KOMPONEN PAGINATION REUSABLE
  const PaginationControls = () => {
    if (filteredProducts.length <= ITEMS_PER_PAGE) return null;
    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl">
        <div className="text-sm text-slate-500 font-medium">
          Menampilkan{" "}
          <span className="font-bold text-slate-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>{" "}
          -{" "}
          <span className="font-bold text-slate-800">
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
          </span>{" "}
          dari <span className="font-bold text-[#00a67c]">{filteredProducts.length}</span> produk
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 shadow-sm"
          >
            <ChevronLeft size={16} className="mr-1" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-8 shadow-sm"
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* HEADER & TABS */}
      <div className="flex flex-col gap-5">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">HPP & PRODUKSI</h1>
        <div className="flex overflow-x-auto no-scrollbar items-center gap-3 pb-2 w-full border-b border-slate-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`whitespace-nowrap flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold transition-all duration-200 border-b-4 ${
                  isActive
                    ? "bg-[#00a67c]/10 text-[#00a67c] border-[#00a67c]"
                    : "bg-transparent text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TOOLBAR PENCARIAN (Dipakai di Analisis & Resep) */}
      {(activeTab === "analisis" || activeTab === "resep") && (
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Cari nama menu..."
              className="pl-10 bg-slate-50 border-slate-200 font-medium h-10 w-full focus-visible:ring-[#00a67c]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <select
                className={`w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200
                  text-slate-700 font-bold py-2 px-4 pr-10 rounded-md
                  focus-visible:ring-[#00a67c] text-sm cursor-pointer`}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="Semua">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
            {activeTab === "analisis" && (
              <div className="relative w-full sm:w-auto">
                <select
                  className={`w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200
                    text-slate-700 font-bold py-2 px-4 pr-10 rounded-md
                    focus-visible:ring-[#00a67c] text-sm cursor-pointer`}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="default">Urutan Default</option>
                  <option value="margin_desc">Margin Tertinggi</option>
                  <option value="margin_asc">Margin Terendah</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            )}
            <Button
              variant="outline"
              className="w-full sm:w-auto font-bold border-slate-200 text-slate-700 hover:bg-slate-100 flex gap-2"
            >
              <Printer size={16} /> CETAK
            </Button>
          </div>
        </div>
      )}

      {/* TAB 1: ANALISIS HPP */}
      {activeTab === "analisis" && (
        <Card className="shadow-sm border-slate-200 overflow-hidden w-full flex flex-col animate-in fade-in duration-300">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-700 py-4">NAMA PRODUK</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-right">
                    TOTAL HPP
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-right">
                    HARGA JUAL
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-right">
                    MARGIN (Rp)
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-center">
                    MARGIN (%)
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-700 pl-8">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-10 font-medium">
                      Data tidak ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-bold text-slate-900">{p.name}</TableCell>
                      <TableCell className="font-bold text-slate-600 text-right">
                        {formatRp(p.hpp)}
                      </TableCell>
                      <TableCell className="font-black text-slate-800 text-right">
                        {formatRp(p.price)}
                      </TableCell>
                      <TableCell className="font-bold text-[#00a67c] text-right">
                        {formatRp(p.marginRp)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2.5 py-1 rounded-md text-sm font-black ${
                            p.status === "AMAN"
                              ? "text-emerald-700 bg-emerald-100"
                              : p.status === "WASPADA"
                                ? "text-yellow-700 bg-yellow-100"
                                : p.status === "BELUM DISET"
                                  ? "text-slate-600 bg-slate-100"
                                  : "text-red-700 bg-red-100"
                          }`}
                        >
                          {p.marginPercent.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-2">
                          {p.status === "AMAN" && (
                            <>
                              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>{" "}
                              <span className="font-black text-sm text-slate-700">AMAN</span>
                            </>
                          )}
                          {p.status === "WASPADA" && (
                            <>
                              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>{" "}
                              <span className="font-black text-sm text-slate-700">WASPADA</span>
                            </>
                          )}
                          {p.status === "KRITIS" && (
                            <>
                              <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>{" "}
                              <span className="font-black text-sm text-slate-700">KRITIS</span>
                            </>
                          )}
                          {p.status === "BELUM DISET" && (
                            <>
                              <div className="w-3 h-3 rounded-full bg-slate-300"></div>{" "}
                              <span className="font-black text-sm text-slate-500">BELUM DISET</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationControls />
        </Card>
      )}

      {/* TAB 2: RESEP & KOMPOSISI */}
      {activeTab === "resep" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {paginatedProducts.map((p) => (
              <Card key={p.id} className="shadow-sm border-slate-200 overflow-hidden flex flex-col">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                  <div className="font-black text-slate-800 text-lg">{p.name}</div>
                  <div
                    className="text-sm font-black bg-[#00a67c] text-white px-3 py-1.5 rounded-full shadow-sm"
                    title="Total HPP (Modal)"
                  >
                    {formatRp(p.hpp)}
                  </div>
                </div>
                <CardContent className="p-0 flex-1 bg-white">
                  <div className="h-[280px] overflow-y-auto p-4 space-y-3 relative">
                    {p.recipeIngredients.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-70">
                        <ChefHat size={40} className="mb-2" />
                        <span className="text-sm font-bold">Belum ada resep bahan baku.</span>
                      </div>
                    ) : (
                      p.recipeIngredients.map((r: any) => (
                        <div
                          key={r.id}
                          className="flex justify-between items-center text-sm border-b border-dashed border-slate-200 pb-2.5 last:border-0 last:pb-0 group"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 group-hover:text-[#00a67c] transition-colors">
                              {r.rawMaterial.name}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
                              {r.amount} {r.rawMaterial.unit}{" "}
                              <span className="font-normal opacity-70">
                                (Modal: Rp {r.rawMaterial.pricePerUnit}/{r.rawMaterial.unit})
                              </span>
                            </span>
                          </div>
                          <div className="font-bold text-slate-800">
                            {formatRp(r.amount * r.rawMaterial.pricePerUnit)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredProducts.length > ITEMS_PER_PAGE && (
            <Card className="shadow-sm border-slate-200">
              <PaginationControls />
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: KALKULATOR SIMULASI MARGIN */}
      {activeTab === "simulasi" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full max-w-4xl mx-auto">
          <Card className="shadow-lg border-slate-200 overflow-hidden">
            <div className="bg-[#00a67c] p-6 text-white">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Calculator size={24} /> Kalkulator Simulasi Profitabilitas
              </h2>
              <p className="text-[#a8ebd9] font-medium text-sm mt-1">
                Uji coba kenaikan/penurunan harga jual sebelum menerapkannya di buku menu.
              </p>
            </div>
            <CardContent className="p-6 md:p-8 bg-slate-50">
              <div className="space-y-8">
                {/* 1. Pilih Produk */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <Label className="text-slate-600 font-bold uppercase tracking-wider text-xs">
                    Langkah 1: Pilih Menu Produk
                  </Label>
                  <select
                    className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-800 font-bold text-lg focus-visible:ring-[#00a67c]"
                    value={simulatedProductId}
                    onChange={(e) => {
                      setSimulatedProductId(e.target.value);
                      const p = analyzedProducts.find((x) => x.id === e.target.value);
                      if (p) setSimulatedPrice(p.price);
                    }}
                  >
                    <option value="">-- Silakan Pilih Menu --</option>
                    {analyzedProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (HPP: {formatRp(p.hpp)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Area Simulasi */}
                {selectedSimProduct && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 fade-in">
                    {/* Input Area */}
                    <div className="space-y-6">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                          Total Modal Asli (HPP)
                        </div>
                        <div className="text-3xl font-black text-slate-800">
                          {formatRp(selectedSimProduct.hpp)}
                        </div>
                        <div className="text-sm font-medium text-slate-500 mt-1">
                          Harga Jual Saat Ini:{" "}
                          <span className="font-bold">{formatRp(selectedSimProduct.price)}</span>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-[#00a67c]">
                        <Label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">
                          Langkah 2: Uji Harga Jual Baru
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500 text-lg">
                            Rp
                          </span>
                          <Input
                            type="number"
                            value={simulatedPrice === 0 ? "" : simulatedPrice}
                            onChange={(e) => setSimulatedPrice(Number(e.target.value))}
                            className="pl-12 h-14 text-2xl font-black bg-slate-50 border-slate-300 focus-visible:ring-[#00a67c]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Output Area */}
                    <div
                      className={`p-6 rounded-2xl border flex flex-col justify-center items-center text-center transition-colors duration-500 shadow-inner ${
                        selectedSimProduct.hpp === 0
                          ? "bg-slate-100 border-slate-300"
                          : simMarginPercent >= 35
                            ? "bg-emerald-50 border-emerald-200"
                            : simMarginPercent >= 20
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-red-50 border-red-200"
                      }`}
                    >
                      <Target
                        size={40}
                        className={`mb-3 ${
                          selectedSimProduct.hpp === 0
                            ? "text-slate-400"
                            : simMarginPercent >= 35
                              ? "text-emerald-500"
                              : simMarginPercent >= 20
                                ? "text-yellow-500"
                                : "text-red-500"
                        }`}
                      />

                      <div className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-1">
                        Proyeksi Profit (Margin)
                      </div>

                      {selectedSimProduct.hpp === 0 ? (
                        <div className="text-lg font-bold text-slate-500 mt-2">
                          Modal (HPP) belum diset, simulasi tidak dapat dihitung.
                        </div>
                      ) : (
                        <>
                          <div
                            className={`text-5xl font-black tracking-tighter ${
                              simMarginPercent >= 35
                                ? "text-emerald-600"
                                : simMarginPercent >= 20
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {simMarginPercent.toFixed(1)}%
                          </div>

                          <div className="text-xl font-bold text-slate-700 mt-2 bg-white/60 px-4 py-1.5 rounded-full shadow-sm">
                            Untung {formatRp(simMarginRp)} / Porsi
                          </div>

                          <div className="mt-6 w-full text-sm font-bold p-3 rounded-xl bg-white/80 border border-slate-200/50 shadow-sm">
                            {simMarginPercent >= 40
                              ? "🔥 Sangat Menguntungkan (Ideal untuk Diskon/Promo)"
                              : simMarginPercent >= 30
                                ? "✅ Ideal (Sehat untuk Bisnis)"
                                : simMarginPercent >= 20
                                  ? "⚠️ Waspada (Margin Terlalu Tipis)"
                                  : "❌ Rugi / Sangat Kritis (Segera Naikkan Harga!)"}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: BIAYA OVERHEAD & KEMASAN */}
      {activeTab === "overhead" && (
        <Card className="shadow-sm border-slate-200 overflow-hidden w-full flex flex-col animate-in fade-in duration-300">
          <div className="bg-[#00a67c]/10 p-5 border-b border-slate-200">
            <h2 className="text-lg font-black text-[#00a67c] flex items-center gap-2">
              <PackageOpen size={20} /> Komponen Biaya Tetap per Porsi
            </h2>
            <p className="text-sm font-medium text-slate-600 mt-1">
              Biaya kemasan (box, tas, sendok) dan overhead (gas, listrik, tenaga) yang otomatis
              ditambahkan ke total HPP menu.
            </p>
          </div>
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-700 py-4">NAMA PRODUK</TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-right">
                    BIAYA KEMASAN
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-right">
                    BIAYA OPERASIONAL
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-right">
                    TOTAL BIAYA TETAP
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-center">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((p) => {
                  const overheads = p.overheads || [];
                  const totalCost = overheads.reduce(
                    (sum: number, o: any) => sum + Number(o.price),
                    0,
                  );

                  return (
                    <TableRow key={p.id} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-slate-900">{p.name}</TableCell>

                      <TableCell colSpan={2} className="text-slate-600 text-sm">
                        {overheads.length === 0 ? (
                          <span className="text-slate-400 italic">Belum ada rincian biaya</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {overheads.map((o: any) => (
                              <div
                                key={o.id}
                                className="flex justify-between border-b border-dashed border-slate-200 last:border-0 pb-1 last:pb-0"
                              >
                                <span>{o.name}</span>
                                <span className="font-medium">{formatRp(o.price)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-black text-orange-600 align-top pt-4">
                        {formatRp(totalCost)}
                      </TableCell>

                      <TableCell className="text-center align-top pt-3">
                        <EditOverheadModal product={p} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length > ITEMS_PER_PAGE && <PaginationControls />}
        </Card>
      )}
    </div>
  );
}
