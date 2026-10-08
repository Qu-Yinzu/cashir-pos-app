"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  User,
  Utensils,
  ReceiptText,
  Clock,
  QrCode,
  Banknote,
  Coffee,
  Tag,
  Crown,
  PencilLine,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { processCheckout, payDebtOrder, completeOrder } from "@/app/actions/pos";

export default function PosView({
  products,
  categories,
  activeOrders,
  historyOrders,
}: {
  products: any[];
  categories: any[];
  activeOrders: any[];
  historyOrders: any[];
}) {
  const [activeTab, setActiveTab] = useState("kasir");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isPending, startTransition] = useTransition();

  // State Order / Keranjang
  const [cart, setCart] = useState<any[]>([]);
  const [orderType, setOrderType] = useState("Dine-in");
  const [customerName, setCustomerName] = useState("");

  // State Pembayaran & Notifikasi
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [customerType, setCustomerType] = useState("Umum");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [orderNumber, setOrderNumber] = useState("ORD-...");
  const [toast, setToast] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    setOrderNumber(`ORD-${Math.floor(Math.random() * 9000) + 1000}`);
  }, []);

  // FUNGSI MENAMPILKAN NOTIFIKASI ANIMASI (TOAST)
  const showToast = (title: string, message: string, type: "success" | "error" = "success") => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3500); // Hilang dalam 3.5 detik
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory =
      selectedCategory === "Semua" || p.categories?.some((c: any) => c.id === selectedCategory);
    return matchSearch && matchCategory;
  });

  const addToCart = (product: any) =>
    setCart((prev) =>
      prev.find((item) => item.id === product.id)
        ? prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
        : [...prev, { ...product, qty: 1, note: "" }],
    );
  const updateQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: Math.max(item.qty + delta, 1) } : item)),
    );
  const updateNote = (id: string, note: string) =>
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, note } : item)));
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart],
  );
  const tax = subtotal * 0.1;
  const discountAmount = customerType === "Member" ? subtotal * 0.1 : 0;
  const total = subtotal + tax - discountAmount;
  const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;

  const handleCheckout = () => {
    if (
      paymentMethod === "HUTANG" &&
      (!customerName || customerName.trim() === "" || customerName === "Pelanggan Umum")
    ) {
      showToast("Gagal Memproses", "Masukkan Nama Pelanggan untuk catatan Hutang/Kasbon!", "error");
      return;
    }

    const payload = {
      orderNumber,
      customerName: customerName || "Pelanggan Umum",
      customerType,
      orderType,
      paymentMethod,
      items: cart,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      isPaid: paymentMethod !== "HUTANG",
    };

    startTransition(async () => {
      const res = await processCheckout(payload);
      if (res?.error) {
        showToast("Error", res.error, "error");
      } else {
        setCart([]);
        setIsPaymentModalOpen(false);
        setCustomerName("");
        setCustomerType("Umum");
        setPaymentMethod("CASH");
        setOrderNumber(`ORD-${Math.floor(Math.random() * 9000) + 1000}`);
        showToast(
          "Pesanan Berhasil!",
          paymentMethod === "HUTANG"
            ? "Kasbon berhasil dicatat ke antrean dapur."
            : `Pembayaran lunas sebesar ${formatRp(total)}`,
        );
      }
    });
  };

  const handlePayDebt = (orderId: string) =>
    startTransition(async () => {
      await payDebtOrder(orderId);
      showToast("Hutang Lunas", "Pesanan sudah dibayar dan bisa diselesaikan.", "success");
    });

  const handleCompleteOrder = (order: any) => {
    if (!order.isPaid) {
      showToast(
        "Belum Lunas!",
        "Pesanan Kasbon harus dilunasi dulu sebelum diselesaikan.",
        "error",
      );
      return;
    }
    startTransition(async () => {
      await completeOrder(order.id);
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] w-full max-w-[1600px] mx-auto gap-4 -mt-2 relative">
      {/* NOTIFIKASI TOAST MENGAMBANG */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 p-3 pr-6 flex items-center gap-4 min-w-[320px]">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {toast.type === "success" ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-800 text-sm">{toast.title}</h4>
              <p className="text-xs font-medium text-slate-500 leading-tight mt-0.5">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER TABS */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#00a67c] p-2 rounded-lg text-white">
            <ShoppingBag size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">KASIR POS</h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab("kasir")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all ${
              activeTab === "kasir"
                ? "bg-white text-[#00a67c] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShoppingBag size={18} /> <span className="hidden sm:inline">Kasir</span>
          </button>
          <button
            onClick={() => setActiveTab("aktif")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all relative ${
              activeTab === "aktif"
                ? "bg-white text-orange-500 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ChefHat size={18} /> <span className="hidden sm:inline">Pesanan Aktif</span>
            {activeOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {activeOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all ${
              activeTab === "riwayat"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ReceiptText size={18} /> <span className="hidden sm:inline">Riwayat</span>
          </button>
        </div>
      </div>

      {/* TAB KASIR UTAMA */}
      {activeTab === "kasir" && (
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 overflow-hidden animate-in fade-in duration-300">
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="relative w-full">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Input
                  placeholder="Ketik nama menu..."
                  className="pl-10 h-12 text-lg bg-white border-slate-200 shadow-sm font-medium focus-visible:ring-[#00a67c] rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0 pb-1">
              <button
                onClick={() => setSelectedCategory("Semua")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border shadow-sm ${
                  selectedCategory === "Semua"
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#00a67c] hover:text-[#00a67c]"
                }`}
              >
                Semua Menu
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border shadow-sm ${
                    selectedCategory === c.id
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#00a67c] hover:text-[#00a67c]"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto pr-2 pb-20">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-slate-400 bg-white rounded-xl border-dashed">
                  <Coffee size={48} className="mb-4 opacity-40" />
                  <p className="font-bold text-lg text-slate-500">Menu tidak ditemukan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((p) => (
                    <Card
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className={`cursor-pointer group hover:border-[#00a67c] hover:shadow-lg
                        transition-all duration-150 active:scale-95 overflow-hidden
                        flex flex-col bg-white border-slate-200 rounded-xl`}
                    >
                      <div className="h-36 bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100 shrink-0">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <Coffee size={40} className="text-slate-200 group-hover:scale-110" />
                        )}
                        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                          Stok: {p.stock}
                        </div>
                        <div
                          className={`absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm
                            text-slate-700 text-[10px] font-extrabold px-2 py-1 rounded-md
                            shadow-sm flex items-center gap-1 border border-slate-200/50`}
                        >
                          <Tag size={10} className="text-[#00a67c]" />{" "}
                          {p.categories?.length > 0 ? p.categories[0].name : "Umum"}
                        </div>
                      </div>
                      <CardContent className="p-3 flex flex-col justify-between grow">
                        <div className="font-bold text-slate-800 leading-snug line-clamp-2 text-sm mb-2 group-hover:text-[#00a67c] transition-colors">
                          {p.name}
                        </div>
                        <div className="font-black text-[#00a67c] text-[15px]">
                          {formatRp(p.price)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[420px] bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col shrink-0 h-full max-h-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-black text-lg text-slate-800 flex items-center gap-2">
                  <ReceiptText size={20} className="text-[#00a67c]" /> Keranjang
                </h2>
                <span className="text-xs font-bold bg-[#00a67c]/10 text-[#008f6b] px-3 py-1.5 rounded-md border border-[#00a67c]/20">
                  #{orderNumber}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0 text-slate-500">
                    <User size={16} />
                  </div>
                  <Input
                    placeholder="Nama Pelanggan (Wajib jika Hutang)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-10 text-sm font-bold bg-white border-slate-300 focus-visible:ring-[#00a67c]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0 text-slate-500">
                    <Utensils size={16} />
                  </div>
                  <div className="flex bg-slate-200 p-1 rounded-lg w-full">
                    <button
                      onClick={() => setOrderType("Dine-in")}
                      className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${
                        orderType === "Dine-in"
                          ? "bg-white shadow-sm text-slate-800"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Makan di Tempat
                    </button>
                    <button
                      onClick={() => setOrderType("Take away")}
                      className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${
                        orderType === "Take away"
                          ? "bg-white shadow-sm text-slate-800"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Bawa Pulang
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 opacity-80">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                    <ShoppingBag size={40} className="text-slate-300" />
                  </div>
                  <p className="font-bold text-slate-500">Keranjang masih kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col p-3 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-[#00a67c]/50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="font-bold text-sm text-slate-800 leading-tight flex-1">
                        {item.name}
                      </div>
                      <div className="font-black text-slate-900 text-sm">
                        {formatRp(item.price * item.qty)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs font-bold text-slate-500">
                        Harga: {formatRp(item.price)}
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white text-slate-600 rounded-md shadow-sm hover:text-red-500 active:scale-95 transition-transform"
                        >
                          <Minus size={16} strokeWidth={3} />
                        </button>
                        <span className="font-black text-sm w-8 text-center text-slate-800">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-[#00a67c] text-white rounded-md shadow-sm hover:bg-[#008f6b] active:scale-95 transition-transform"
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                        <div className="w-[1px] h-5 bg-slate-300 mx-1"></div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="relative mt-1">
                      <PencilLine
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        placeholder="Catatan (mis. gak pedes...)"
                        value={item.note || ""}
                        onChange={(e) => updateNote(item.id, e.target.value)}
                        className="h-8 pl-8 text-xs font-medium bg-slate-50 border-slate-200 focus-visible:ring-[#00a67c]"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-white p-4 border-t border-slate-200 shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-3 px-1">
                <span className="font-bold text-slate-600 text-sm">
                  Total ({cart.reduce((a, b) => a + b.qty, 0)} produk)
                </span>
                <span className="text-xl font-black text-[#00a67c]">{formatRp(subtotal)}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <Button
                  variant="outline"
                  className="col-span-1 font-bold text-slate-600 border-slate-300 bg-white hover:bg-slate-100 h-12"
                  disabled={cart.length === 0}
                >
                  <Clock size={20} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCart([])}
                  className="col-span-3 font-bold text-red-600 border-red-200 bg-red-50 hover:bg-red-100 h-12"
                  disabled={cart.length === 0}
                >
                  BATALKAN
                </Button>
              </div>
              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full bg-[#00a67c] hover:bg-[#008f6b] text-white font-black text-lg h-16 shadow-lg shadow-[#00a67c]/40 rounded-xl"
                disabled={cart.length === 0}
              >
                LANJUT PEMBAYARAN &rarr;
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB PESANAN AKTIF DARI DATABASE */}
      {activeTab === "aktif" && (
        <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ChefHat size={24} className="text-orange-500" /> Antrean Dapur & Status Kasbon
            </h2>
            <span className="text-sm font-bold text-slate-500">
              {activeOrders.length} Pesanan Berjalan
            </span>
          </div>
          {activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-4 opacity-70">
              <CheckCircle2 size={80} className="text-emerald-400" />
              <p className="font-bold text-xl text-slate-500">Dapur Kosong!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white border-t-4 rounded-xl shadow-md overflow-hidden flex flex-col ${
                    !order.isPaid ? "border-t-red-500 ring-2 ring-red-200" : "border-t-orange-500"
                  }`}
                >
                  <div
                    className={`p-4 border-b border-slate-200 ${!order.isPaid ? "bg-red-50/50" : "bg-slate-100/50"}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-lg text-slate-800">{order.orderNumber}</span>
                      <span className="font-bold text-slate-500 text-sm flex items-center gap-1">
                        <Clock size={14} />{" "}
                        {new Date(order.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="font-bold text-slate-700 text-sm mb-1">
                      {order.customerName}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                        {order.orderType}
                      </span>
                      {!order.isPaid ? (
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-red-500 text-white flex items-center gap-1">
                          <AlertCircle size={12} /> KASBON
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                          LUNAS
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto space-y-3">
                    {order.orderItems?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex flex-col border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-black text-slate-800 w-6">{item.qty}x</span>
                          <span className="font-bold text-slate-700 text-sm leading-tight flex-1">
                            {item.productName}
                          </span>
                        </div>
                        {item.note && (
                          <div className="pl-8 text-xs font-bold text-orange-600 italic mt-1 bg-orange-50 p-1.5 rounded-md border border-orange-100 w-fit">
                            * {item.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto space-y-2">
                    {!order.isPaid ? (
                      <>
                        <div className="text-xs font-bold text-red-600 text-center mb-1">
                          Tagihan: {formatRp(order.total)}
                        </div>
                        <Button
                          onClick={() => handlePayDebt(order.id)}
                          disabled={isPending}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 shadow-sm"
                        >
                          <CreditCard size={16} className="mr-2" /> LUNASI HUTANG
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleCompleteOrder(order)}
                        disabled={isPending}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 shadow-sm"
                      >
                        <CheckCircle2 size={18} className="mr-2" /> PESANAN SELESAI
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB RIWAYAT DARI DATABASE */}
      {activeTab === "riwayat" && (
        <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <ReceiptText size={64} className="text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-600">Riwayat Pesanan Hari Ini</h2>
          <p className="text-slate-500 mb-6">
            Total {historyOrders.length} pesanan telah selesai direkap database.
          </p>
          {historyOrders.length > 0 && (
            <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[60vh] overflow-y-auto">
              {historyOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-4 border-b border-slate-100 flex justify-between items-center hover:bg-slate-50"
                >
                  <div>
                    <div className="font-black text-slate-800">{o.orderNumber}</div>
                    <div className="text-sm font-medium text-slate-500">
                      {o.customerName} • Selesai:{" "}
                      {o.completedAt
                        ? new Date(o.completedAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-[#00a67c]">{formatRp(o.total)}</div>
                    <div className="text-xs font-bold text-slate-400">{o.paymentMethod}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL CHECKOUT */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
          <div className="bg-[#00a67c] p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
                Konfirmasi Pembayaran
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2 text-[#a8ebd9] font-medium flex justify-between">
              <span>Pesanan: #{orderNumber}</span>
              <span>
                {customerName || "Umum"} ({orderType})
              </span>
            </div>
          </div>
          <div className="p-6 space-y-6 bg-slate-50">
            <div>
              <Label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">
                Tipe Pelanggan
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCustomerType("Umum")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 transition-all active:scale-95 ${
                    customerType === "Umum"
                      ? "border-slate-800 bg-slate-800 text-white shadow-md"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <User size={18} /> Umum (0%)
                </button>
                <button
                  onClick={() => setCustomerType("Member")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 transition-all active:scale-95 ${
                    customerType === "Member"
                      ? "border-yellow-500 bg-yellow-50 text-yellow-600 shadow-md"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <Crown size={18} /> Member VIP (-10%)
                </button>
              </div>
            </div>
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <span>Total Produk ({cart.reduce((a, b) => a + b.qty, 0)} item)</span>
                <span className="text-slate-700">{formatRp(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <span>Pajak Resto (10%)</span>
                <span className="text-slate-700">{formatRp(tax)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm font-bold text-red-500">
                  <span>Diskon Member</span>
                  <span>- {formatRp(discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-dashed border-slate-300 pt-3 mt-1 flex justify-between items-end">
                <span className="text-lg font-bold text-slate-800">TOTAL TAGIHAN</span>
                <span className="text-[#00a67c] text-3xl font-black">{formatRp(total)}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">
                Metode Pembayaran
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs border-2 transition-all active:scale-95 ${
                    paymentMethod === "CASH"
                      ? "border-[#00a67c] bg-[#00a67c]/10 text-[#00a67c]"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <Banknote size={22} /> TUNAI
                </button>
                <button
                  onClick={() => setPaymentMethod("QRIS")}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs border-2 transition-all active:scale-95 ${
                    paymentMethod === "QRIS"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <QrCode size={22} /> QRIS
                </button>
                <button
                  onClick={() => setPaymentMethod("HUTANG")}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs border-2 transition-all active:scale-95 ${
                    paymentMethod === "HUTANG"
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <CreditCard size={22} /> KASBON
                </button>
              </div>
            </div>
            <div className="pt-2">
              <Button
                onClick={handleCheckout}
                disabled={isPending}
                className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-black
                  text-xl h-14 shadow-lg uppercase tracking-widest rounded-xl
                  transition-all active:scale-[0.98]`}
              >
                {isPending ? "MEMPROSES..." : "PROSES PESANAN"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
