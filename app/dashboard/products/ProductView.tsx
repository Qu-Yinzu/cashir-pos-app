"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Edit,
  Trash2,
  Box,
  Image as ImageIcon,
  ChevronDown,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import EditRawMaterialModal from "./EditRawMaterialModal";
import EditSupplierModal from "./EditSupplierModal";
import { deleteProduct } from "@/app/actions/product";
import { createCategory, deleteCategory } from "@/app/actions/category";
import {
  createRawMaterial,
  deleteRawMaterial,
  recordStockIn,
  recordStockOut,
} from "@/app/actions/stock";
import { createSupplier, deleteSupplier } from "@/app/actions/supplier";

const TABS = [
  { id: "produk", label: "Produk" },
  { id: "kategori", label: "Kategori" },
  { id: "stok", label: "Stok" },
  { id: "stok-masuk", label: "Stok Masuk" },
  { id: "stok-keluar", label: "Stok Keluar" },
  { id: "supplier", label: "Supplier" },
];
const ITEMS_PER_PAGE = 10;

function PaginationControls({
  totalItems,
  currentPage,
  setCurrentPage,
}: {
  totalItems: number;
  currentPage: number;
  setCurrentPage: (n: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalItems <= ITEMS_PER_PAGE) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/80">
      <div className="text-sm text-slate-500 font-medium">
        Menampilkan{" "}
        <span className="font-bold text-slate-800">
          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
        </span>{" "}
        -{" "}
        <span className="font-bold text-slate-800">
          {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
        </span>{" "}
        dari{" "}
        <span className="font-bold text-[#00a67c]">{totalItems}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="h-8"
        >
          <ChevronLeft size={16} /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="h-8"
        >
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

export default function ProductView({
  products,
  categories,
  rawMaterials,
  stockMovements,
  suppliers,
}: {
  products: any[];
  categories: any[];
  rawMaterials: any[];
  stockMovements: any[];
  suppliers: any[];
}) {
  const [activeTab, setActiveTab] = useState("produk");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");

  const todayDate = new Date().toISOString().split("T")[0];
  const [stockTarget, setStockTarget] = useState("RAW");
  const [stockInDate, setStockInDate] = useState(todayDate);
  const [stockInItem, setStockInItem] = useState("");
  const [stockInAmount, setStockInAmount] = useState("");
  const [stockInNotes, setStockInNotes] = useState("");
  const [stockInMovementId, setStockInMovementId] = useState("");
  const [stockOutTarget, setStockOutTarget] = useState("RAW");
  const [stockOutDate, setStockOutDate] = useState(todayDate);
  const [stockOutItem, setStockOutItem] = useState("");
  const [stockOutAmount, setStockOutAmount] = useState("");
  const [stockOutNotes, setStockOutNotes] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    searchTerm,
    selectedCategory,
    rawSearchTerm,
    supplierSearchTerm,
  ]);

  useEffect(() => {
    if (stockInDate && stockInItem) {
      const existingMov = stockMovements?.find((m) => {
        const movDate = new Date(m.createdAt).toISOString().split("T")[0];
        return (
          m.type === "IN" &&
          m.rawMaterial?.id === stockInItem &&
          movDate === stockInDate
        );
      });

      if (existingMov) {
        setStockInAmount(existingMov.amount.toString());
        setStockInNotes(
          existingMov.notes === "Stok Awal" ? "" : existingMov.notes || "",
        );
        setStockInMovementId(existingMov.id);
      } else {
        setStockInAmount("");
        setStockInNotes("");
        setStockInMovementId("");
      }
    } else {
      setStockInAmount("");
      setStockInNotes("");
      setStockInMovementId("");
    }
  }, [stockInDate, stockInItem, stockMovements]);

  // LOGIKA FILTER MULTI-KATEGORI (MANY-TO-MANY)
  const filteredProducts = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (selectedCategory === "Semua" ||
        p.categories?.some((c: any) => c.id === selectedCategory)),
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const paginatedCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const filteredRawMaterials =
    rawMaterials?.filter(
      (rm) =>
        rm.name.toLowerCase().includes(rawSearchTerm.toLowerCase()) ||
        (rm.sku && rm.sku.toLowerCase().includes(rawSearchTerm.toLowerCase())),
    ) || [];
  const paginatedRawMaterials = filteredRawMaterials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const stockInList =
    stockMovements?.filter((m) => m.type === "IN") || [];
  const paginatedStockIn = stockInList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const stockOutList =
    stockMovements?.filter((m) => m.type === "OUT") || [];
  const paginatedStockOut = stockOutList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const filteredSuppliers =
    suppliers?.filter((s) =>
      s.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()),
    ) || [];
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Yakin hapus?")) {
      setIsProcessing(id);
      await deleteProduct(id);
      setIsProcessing(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing("adding_category");
    await createCategory(new FormData(e.currentTarget));
    (e.target as HTMLFormElement).reset();
    setIsProcessing(null);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Yakin hapus?")) {
      setIsProcessing(id);
      await deleteCategory(id);
      setIsProcessing(null);
    }
  };

  const handleAddRawMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing("adding_raw");
    const formData = new FormData(e.currentTarget);
    const stock = parseFloat(formData.get("stock") as string) || 0;
    const totalPrice = parseFloat(formData.get("totalPrice") as string) || 0;
    const calculatedPricePerUnit = stock > 0 ? totalPrice / stock : 0;
    formData.append("pricePerUnit", calculatedPricePerUnit.toString());

    await createRawMaterial(formData);
    (e.target as HTMLFormElement).reset();
    setIsProcessing(null);
  };

  const handleDeleteRawMaterial = async (id: string) => {
    if (confirm("Yakin hapus?")) {
      setIsProcessing(id);
      await deleteRawMaterial(id);
      setIsProcessing(null);
    }
  };

  const handleRecordStockIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing("stock_in");
    await recordStockIn(new FormData(e.currentTarget));
    setStockInItem("");
    setStockInAmount("");
    setStockInNotes("");
    setStockInMovementId("");
    setIsProcessing(null);
  };

  const handleRecordStockOut = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing("stock_out");
    const res = await recordStockOut(new FormData(e.currentTarget));
    if (res?.error) {
      alert(res.error);
    } else {
      setStockOutItem("");
      setStockOutAmount("");
      setStockOutNotes("");
    }
    setIsProcessing(null);
  };

  const handleAddSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing("adding_supplier");
    await createSupplier(new FormData(e.currentTarget));
    (e.target as HTMLFormElement).reset();
    setIsProcessing(null);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm("Yakin hapus?")) {
      setIsProcessing(id);
      await deleteSupplier(id);
      setIsProcessing(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">
          Produk &amp; Stok
        </h1>
        <div className="flex overflow-x-auto no-scrollbar items-center gap-2 pb-2 w-full">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 border ${
                activeTab === tab.id
                  ? "bg-[#00a67c] text-white border-[#00a67c] shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "produk" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300 w-full">
          <div
            className={`flex flex-col lg:flex-row justify-between items-center gap-4
              bg-slate-50 p-2 rounded-xl w-full border border-slate-100`}
          >
            <div className="relative w-full lg:max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <Input
                placeholder="Cari nama/SKU..."
                className="pl-10 pr-10 bg-white border-slate-200 font-medium h-10 w-full focus-visible:ring-[#00a67c]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row w-full lg:w-auto items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <select
                  className={`w-full sm:w-auto appearance-none bg-white border border-slate-200
                    text-slate-700 font-bold py-2.5 pl-4 pr-10 rounded-md
                    focus-visible:ring-[#00a67c] text-sm cursor-pointer`}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="Semua">Kategori: Semua</option>
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
              <div className="w-full sm:w-auto">
                <AddProductModal
                  categories={categories}
                  rawMaterials={rawMaterials}
                />
              </div>
            </div>
          </div>
          <Card className="shadow-sm border-slate-200 overflow-hidden w-full flex flex-col">
            {filteredProducts.length === 0 ? (
              <div className="p-10 text-center text-slate-500 w-full">
                Belum ada produk atau tidak ada yang cocok.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto w-full">
                  <Table className="min-w-[900px]">
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                      <TableRow>
                        <TableHead className="font-extrabold text-slate-700">
                          SKU
                        </TableHead>
                        <TableHead className="font-extrabold text-slate-700 text-center">
                          FOTO
                        </TableHead>
                        <TableHead className="font-extrabold text-slate-700">
                          NAMA PRODUK
                        </TableHead>
                        <TableHead className="font-extrabold text-slate-700">
                          KATEGORI
                        </TableHead>
                        <TableHead className="font-extrabold text-slate-700">
                          HARGA JUAL
                        </TableHead>
                        <TableHead className="font-extrabold text-slate-700 text-center">
                          STOK
                        </TableHead>
                        <TableHead className="font-extrabold text-slate-700">
                          STATUS
                        </TableHead>
                        <TableHead className="font-extrabold text-slate-700 text-center">
                          AKSI
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((p) => (
                        <TableRow key={p.id} className="hover:bg-slate-50">
                          <TableCell className="font-bold text-slate-600 whitespace-nowrap">
                            {p.sku}
                          </TableCell>
                          <TableCell className="text-center">
                            <div
                              className={`w-14 h-14 bg-slate-100 rounded-lg border border-slate-200
                                flex items-center justify-center mx-auto text-slate-400
                                overflow-hidden shadow-sm`}
                            >
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon
                                  size={24}
                                  className="opacity-50"
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-slate-900 whitespace-nowrap">
                            {p.name}
                          </TableCell>
                          {/* TABEL KATEGORI YANG BENAR UNTUK ARRAY */}
                          <TableCell className="font-medium text-slate-600 max-w-[200px] truncate">
                            {p.categories && p.categories.length > 0
                              ? p.categories
                                  .map((c: any) => c.name)
                                  .join(", ")
                              : "-"}
                          </TableCell>
                          <TableCell className="font-bold text-slate-800 whitespace-nowrap">
                            Rp {Number(p.price).toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell className="text-center font-bold text-[#00a67c] text-lg">
                            {p.stock}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  p.status === "Aktif"
                                    ? "bg-emerald-500"
                                    : p.status === "Habis"
                                      ? "bg-red-500"
                                      : "bg-yellow-500"
                                }`}
                              ></span>
                              <span className="font-bold text-slate-700 text-sm">
                                {p.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <EditProductModal
                                product={p}
                                categories={categories}
                                rawMaterials={rawMaterials}
                              />
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                disabled={isProcessing === p.id}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls
                  totalItems={filteredProducts.length}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </>
            )}
          </Card>
        </div>
      )}

      {activeTab === "kategori" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full max-w-3xl">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Tag size={20} className="text-[#00a67c]" /> Tambah Kategori Baru
              </h2>
              <form
                onSubmit={handleAddCategory}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Input
                  name="name"
                  placeholder="Misal: Makanan Ringan"
                  required
                  className="focus-visible:ring-[#00a67c] w-full"
                />
                <Button
                  type="submit"
                  disabled={isProcessing === "adding_category"}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold w-full sm:w-auto"
                >
                  {isProcessing === "adding_category"
                    ? "Menyimpan..."
                    : "Simpan Kategori"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200 overflow-hidden w-full flex flex-col">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[400px]">
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-extrabold text-slate-700">
                      NAMA KATEGORI
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-right w-[100px]">
                      AKSI
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-slate-500 py-6"
                      >
                        Belum ada data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCategories.map((cat) => (
                      <TableRow
                        key={cat.id}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="font-bold text-slate-900">
                          {cat.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            disabled={isProcessing === cat.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              totalItems={categories.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </Card>
        </div>
      )}

      {activeTab === "stok" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Box size={20} className="text-[#00a67c]" /> Tambah Item Stok
                (Hitung Otomatis)
              </h2>
              <form
                onSubmit={handleAddRawMaterial}
                className="grid grid-cols-1 md:grid-cols-8 gap-3"
              >
                <Input
                  name="sku"
                  placeholder="SKU (Opsi)"
                  className="md:col-span-1 focus-visible:ring-[#00a67c]"
                />
                <Input
                  name="name"
                  placeholder="Nama Barang"
                  required
                  className="md:col-span-2 focus-visible:ring-[#00a67c]"
                />
                <select
                  name="type"
                  required
                  className={`md:col-span-1 rounded-md border border-slate-200 bg-white
                    px-2 text-sm focus-visible:ring-[#00a67c]`}
                >
                  <option value="RAW">Bahan Mentah</option>
                  <option value="FINISHED">Produk Jadi</option>
                </select>
                <div className="flex gap-1 md:col-span-1">
                  <Input
                    name="stock"
                    type="number"
                    step="0.01"
                    placeholder="Jml"
                    required
                    className="w-1/2 px-1 focus-visible:ring-[#00a67c]"
                  />
                  <select
                    name="unit"
                    required
                    className={`w-1/2 px-1 rounded-md border border-slate-200 bg-white
                      text-xs focus-visible:ring-[#00a67c]`}
                  >
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                    <option value="liter">liter</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
                <Input
                  name="totalPrice"
                  type="number"
                  placeholder="Total Harga Beli (Rp)"
                  required
                  className="md:col-span-1 font-bold text-slate-800 focus-visible:ring-[#00a67c]"
                />
                <Input
                  name="notes"
                  placeholder="Catatan (Opsi)"
                  className="md:col-span-1 focus-visible:ring-[#00a67c]"
                />
                <Button
                  type="submit"
                  disabled={isProcessing === "adding_raw"}
                  className="md:col-span-1 bg-slate-800 hover:bg-slate-700 text-white font-bold w-full px-2"
                >
                  {isProcessing === "adding_raw" ? "..." : "Simpan"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex bg-slate-50 p-2 rounded-xl w-full border border-slate-100">
            <div className="relative w-full md:max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <Input
                placeholder="Cari nama stok / SKU..."
                className="pl-10 bg-white border-slate-200 font-medium h-10 w-full focus-visible:ring-[#00a67c]"
                value={rawSearchTerm}
                onChange={(e) => setRawSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="shadow-sm border-slate-200 overflow-hidden w-full flex flex-col">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-extrabold text-slate-700">
                      SKU ITEM
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700">
                      NAMA ITEM
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-center">
                      TIPE
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-center">
                      STOK SAAT INI
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-right">
                      MODAL (Per Satuan)
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-right">
                      AKSI
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRawMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-slate-500 py-6"
                      >
                        Pencarian tidak ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRawMaterials.map((raw) => (
                      <TableRow
                        key={raw.id}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="font-bold text-slate-600">
                          {raw.sku}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900">
                          {raw.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-bold ${
                              raw.type === "FINISHED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {raw.type === "FINISHED"
                              ? "Produk Jadi"
                              : "Bahan Mentah"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-bold text-[#00a67c] text-lg">
                          {raw.stock}{" "}
                          <span className="text-sm font-semibold">
                            {raw.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-700">
                          Rp {(raw.pricePerUnit || 0).toLocaleString("id-ID")}{" "}
                          <span className="text-xs text-slate-400">
                            / {raw.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <EditRawMaterialModal rawMaterial={raw} />
                            <button
                              onClick={() => handleDeleteRawMaterial(raw.id)}
                              disabled={isProcessing === raw.id}
                              className={`p-1.5 text-slate-400 hover:text-red-600
                                hover:bg-red-50 rounded-md transition-colors`}
                            >
                              <Trash2
                                size={16}
                                className={
                                  isProcessing === raw.id ? "opacity-50" : ""
                                }
                              />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              totalItems={filteredRawMaterials.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </Card>
        </div>
      )}

      {activeTab === "stok-masuk" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Form Penerimaan Stok Masuk
              </h2>
              <form onSubmit={handleRecordStockIn} className="space-y-4">
                <div className="flex gap-4 mb-2">
                  <Label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                    <input
                      type="radio"
                      checked={stockTarget === "RAW"}
                      onChange={() => {
                        setStockTarget("RAW");
                        setStockInItem("");
                      }}
                      className="text-[#00a67c]"
                    />{" "}
                    Bahan Mentah
                  </Label>
                  <Label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                    <input
                      type="radio"
                      checked={stockTarget === "FINISHED"}
                      onChange={() => {
                        setStockTarget("FINISHED");
                        setStockInItem("");
                      }}
                      className="text-[#00a67c]"
                    />{" "}
                    Produk Jadi
                  </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-1">
                    <Input
                      name="date"
                      type="date"
                      value={stockInDate}
                      onChange={(e) => setStockInDate(e.target.value)}
                      required
                      className="h-10 text-sm focus-visible:ring-[#00a67c] font-bold text-slate-700"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <select
                      name="itemId"
                      value={stockInItem}
                      onChange={(e) => setStockInItem(e.target.value)}
                      required
                      className={`flex h-10 w-full rounded-md border border-slate-200
                        bg-white px-3 text-sm focus-visible:ring-[#00a67c]`}
                    >
                      <option value="">Pilih Barang...</option>
                      {rawMaterials
                        .filter((r) => r.type === stockTarget)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.sku} - {r.name} ({r.unit})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <Input
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Jml Masuk"
                      value={stockInAmount}
                      onChange={(e) => setStockInAmount(e.target.value)}
                      required
                      className="h-10 focus-visible:ring-[#00a67c]"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Input
                      name="notes"
                      placeholder="Catatan/Invoice"
                      value={stockInNotes}
                      onChange={(e) => setStockInNotes(e.target.value)}
                      className="h-10 focus-visible:ring-[#00a67c]"
                    />
                  </div>
                </div>
                {stockInMovementId && (
                  <input
                    type="hidden"
                    name="movementId"
                    value={stockInMovementId}
                  />
                )}
                <Button
                  type="submit"
                  disabled={isProcessing === "stock_in"}
                  className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold"
                >
                  {isProcessing === "stock_in"
                    ? "Menyimpan..."
                    : stockInMovementId
                      ? "Simpan Invoice / Edit"
                      : "Catat Stok Masuk"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 overflow-hidden w-full flex flex-col">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[700px]">
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-extrabold text-slate-700">
                      TANGGAL
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700">
                      TIPE BARANG
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700">
                      NAMA &amp; SKU
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-center">
                      JML MASUK
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700">
                      CATATAN
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockInList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-slate-500 py-6"
                      >
                        Belum ada riwayat stok masuk.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStockIn.map((mov) => (
                      <TableRow
                        key={mov.id}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="font-medium text-slate-600 whitespace-nowrap">
                          {new Date(mov.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-bold ${
                              mov.rawMaterial?.type === "FINISHED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {mov.rawMaterial?.type === "FINISHED"
                              ? "Produk Jadi"
                              : "Bahan Mentah"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900">
                            {mov.rawMaterial?.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {mov.rawMaterial?.sku}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-[#00a67c] text-lg">
                          +{mov.amount}{" "}
                          <span className="text-xs font-medium text-slate-500">
                            {mov.rawMaterial?.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {mov.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              totalItems={stockInList.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </Card>
        </div>
      )}

      {activeTab === "stok-keluar" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-red-600 mb-4">
                Form Pengeluaran Stok (Manual)
              </h2>
              <form onSubmit={handleRecordStockOut} className="space-y-4">
                <div className="flex gap-4 mb-2">
                  <Label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                    <input
                      type="radio"
                      checked={stockOutTarget === "RAW"}
                      onChange={() => {
                        setStockOutTarget("RAW");
                        setStockOutItem("");
                      }}
                      className="text-red-500"
                    />{" "}
                    Bahan Mentah
                  </Label>
                  <Label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                    <input
                      type="radio"
                      checked={stockOutTarget === "FINISHED"}
                      onChange={() => {
                        setStockOutTarget("FINISHED");
                        setStockOutItem("");
                      }}
                      className="text-red-500"
                    />{" "}
                    Produk Jadi
                  </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-1">
                    <Input
                      name="date"
                      type="date"
                      value={stockOutDate}
                      onChange={(e) => setStockOutDate(e.target.value)}
                      required
                      className="h-10 focus-visible:ring-red-500 font-bold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <select
                      name="itemId"
                      value={stockOutItem}
                      onChange={(e) => setStockOutItem(e.target.value)}
                      required
                      className={`flex h-10 w-full rounded-md border border-slate-200
                        bg-white px-3 focus-visible:ring-red-500`}
                    >
                      <option value="">Pilih Barang...</option>
                      {rawMaterials
                        .filter(
                          (r) =>
                            r.type === stockOutTarget && r.stock > 0,
                        )
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.sku} - {r.name} (Sisa: {r.stock} {r.unit})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <Input
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Jml Keluar"
                      value={stockOutAmount}
                      onChange={(e) => setStockOutAmount(e.target.value)}
                      required
                      className="h-10 focus-visible:ring-red-500"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Input
                      name="notes"
                      placeholder="Alasan: Rusak/Tester"
                      value={stockOutNotes}
                      onChange={(e) => setStockOutNotes(e.target.value)}
                      required
                      className="h-10 focus-visible:ring-red-500"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isProcessing === "stock_out"}
                  className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  {isProcessing === "stock_out"
                    ? "Mencatat..."
                    : "Keluarkan Stok"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 overflow-hidden w-full flex flex-col">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[700px]">
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-extrabold text-slate-700">
                      TANGGAL
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700">
                      TIPE BARANG
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700">
                      NAMA &amp; SKU
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-center">
                      JML KELUAR
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700">
                      ALASAN
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockOutList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-slate-500 py-6"
                      >
                        Belum ada riwayat stok keluar.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStockOut.map((mov) => (
                      <TableRow
                        key={mov.id}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="font-medium text-slate-600 whitespace-nowrap">
                          {new Date(mov.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-bold ${
                              mov.rawMaterial?.type === "FINISHED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {mov.rawMaterial?.type === "FINISHED"
                              ? "Produk Jadi"
                              : "Bahan Mentah"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900">
                            {mov.rawMaterial?.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {mov.rawMaterial?.sku}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-red-600 text-lg">
                          -{mov.amount}{" "}
                          <span className="text-xs font-medium text-slate-500">
                            {mov.rawMaterial?.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {mov.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              totalItems={stockOutList.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </Card>
        </div>
      )}

      {activeTab === "supplier" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Tambah Data Supplier
              </h2>
              <form
                onSubmit={handleAddSupplier}
                className="grid grid-cols-1 md:grid-cols-5 gap-4"
              >
                <div className="md:col-span-2">
                  <Input
                    name="name"
                    placeholder="Nama Perusahaan / Toko *"
                    required
                    className="h-10 focus-visible:ring-[#00a67c]"
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    name="pic"
                    placeholder="Nama Kontak (PIC)"
                    className="h-10 focus-visible:ring-[#00a67c]"
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    name="phone"
                    placeholder="No. Telepon / WA"
                    className="h-10 focus-visible:ring-[#00a67c]"
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    name="address"
                    placeholder="Alamat Singkat"
                    className="h-10 focus-visible:ring-[#00a67c]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isProcessing === "adding_supplier"}
                  className="md:col-span-5 bg-slate-800 hover:bg-slate-700 text-white font-bold h-10"
                >
                  {isProcessing === "adding_supplier"
                    ? "Menyimpan..."
                    : "Simpan Supplier Baru"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex bg-slate-50 p-2 rounded-xl w-full border border-slate-100">
            <div className="relative w-full md:max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <Input
                placeholder="Cari nama supplier..."
                className="pl-10 bg-white border-slate-200 font-medium h-10 w-full focus-visible:ring-[#00a67c]"
                value={supplierSearchTerm}
                onChange={(e) => setSupplierSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="shadow-sm border-slate-200 overflow-hidden w-full flex flex-col">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[700px]">
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-extrabold text-slate-700">
                      NAMA SUPPLIER
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700">
                      KONTAK (PIC)
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700">
                      TELEPON
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700">
                      ALAMAT
                    </TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-right">
                      AKSI
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-slate-500 py-6"
                      >
                        Pencarian tidak ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSuppliers.map((sup) => (
                      <TableRow
                        key={sup.id}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="font-bold text-slate-900">
                          {sup.name}
                        </TableCell>
                        <TableCell className="font-medium text-slate-600">
                          {sup.pic || "-"}
                        </TableCell>
                        <TableCell className="font-medium text-slate-600">
                          {sup.phone || "-"}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {sup.address || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <EditSupplierModal supplier={sup} />
                            <button
                              onClick={() => handleDeleteSupplier(sup.id)}
                              disabled={isProcessing === sup.id}
                              className={`p-1.5 text-slate-400 hover:text-red-600
                                hover:bg-red-50 rounded-md transition-colors`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              totalItems={filteredSuppliers.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
