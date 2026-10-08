"use client";

import { useState, useEffect } from "react";
import { PackageOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateProductOverhead } from "@/app/actions/product";

export default function EditOverheadModal({ product }: { product: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overheads, setOverheads] = useState<any[]>([]);

    useEffect(() => {
    if (open) {
      // Kita tambahkan state totalPrice & qty agar form tidak error saat memuat data lama
      setOverheads(product.overheads ? product.overheads.map((o: any) => ({ 
        name: o.name, 
        price: o.price.toString(),
        totalPrice: o.price.toString(), 
        qty: "1" 
      })) : []);
    }
  }, [open, product]);

  const addOverheadItem = () => setOverheads([...overheads, { name: "", price: "", totalPrice: "", qty: "" }]);
  
  const removeOverheadItem = (index: number) => { 
    const newArr = [...overheads]; 
    newArr.splice(index, 1); 
    setOverheads(newArr); 
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newArr = [...overheads];
    newArr[index][field] = value;
    setOverheads(newArr);
  };

  // FUNGSI BARU: Kalkulator Otomatis per Baris
  const updateCalc = (index: number, field: "totalPrice" | "qty", value: string) => {
    const newArr = [...overheads];
    newArr[index][field] = value;
    
    const tp = parseFloat(newArr[index].totalPrice);
    const q = parseFloat(newArr[index].qty);
    
    // Jika angka masuk akal, otomatis hitung Harga per Porsi
    if (!isNaN(tp) && !isNaN(q) && q > 0) {
      newArr[index].price = (tp / q).toString(); 
    } else {
      newArr[index].price = "";
    }
    setOverheads(newArr);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    // Filter hanya item yang punya nama dan harga
    const validOverheads = overheads.filter(o => o.name.trim() !== "" && o.price !== "");
    
    const formData = new FormData(event.currentTarget);
    formData.append("overheads", JSON.stringify(validOverheads));

    await updateProductOverhead(product.id, formData);
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center h-8 px-3 text-sm font-bold text-slate-600 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer">
        Edit Biaya
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
            <PackageOpen size={20} className="text-[#00a67c]" /> Edit Komponen Biaya Tambahan
          </DialogTitle>
          <p className="text-sm font-medium text-slate-500 mt-1">Menu: {product.name}</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 max-h-[50vh] overflow-y-auto">
            {overheads.length === 0 ? (
              <div className="text-center text-sm text-slate-400 py-4 font-medium">Belum ada rincian biaya. Klik tambah di bawah.</div>
            ) : (
              overheads.map((item, index) => (
                <div key={index} className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  
                  {/* Baris 1: Nama Item & Tombol Hapus */}
                  <div className="flex justify-between items-center gap-2">
                    <Input 
                      placeholder="Nama Biaya (Cth: Kotak Karton 1 Pak)" 
                      value={item.name} 
                      onChange={(e) => updateItem(index, "name", e.target.value)} 
                      required 
                      className="flex-1 h-9 font-bold focus-visible:ring-[#00a67c]" 
                    />
                    <Button type="button" onClick={() => removeOverheadItem(index)} variant="ghost" className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  {/* Baris 2: Fleksibel (Bisa langsung ketik satuan, atau pakai pembagi jika belanja borongan) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">Rp</span>
                        <Input 
                          type="number" 
                          placeholder="Nominal Biaya (Cth: 500 atau 50000)" 
                          value={item.price} 
                          onChange={(e) => {
                            const newArr = [...overheads];
                            newArr[index].price = e.target.value;
                            newArr[index].totalPrice = e.target.value;
                            newArr[index].qty = "1";
                            setOverheads(newArr);
                          }} 
                          required 
                          className="w-full h-9 pl-7 text-sm font-bold text-slate-800 focus-visible:ring-[#00a67c]" 
                        />
                      </div>
                    </div>

                    {/* Tombol kecil bantuan jika ingin membagi harga pak */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span>*Langsung ketik biaya per porsi, atau:</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const tp = prompt("Masukkan Total Belanja Pak (Cth: 50000):");
                          const q = prompt("Untuk Berapa Porsi? (Cth: 100):");
                          if (tp && q && !isNaN(Number(tp)) && !isNaN(Number(q))) {
                            const result = Number(tp) / Number(q);
                            updateCalc(index, "totalPrice", tp);
                            const newArr = [...overheads];
                            newArr[index].qty = q;
                            newArr[index].price = result.toString();
                            setOverheads(newArr);
                          }
                        }}
                        className="text-[#00a67c] font-bold hover:underline"
                      >
                        🧮 Hitung dari Harga Pak/Grosir
                      </button>
                    </div>
                  </div>
                  
                  {/* Baris 3: Hasil Perhitungan */}
                  {item.price && (
                    <div className="text-right text-xs font-bold text-[#00a67c] bg-[#00a67c]/10 py-1 px-2 rounded-md w-fit ml-auto mt-1">
                      Biaya per Porsi = Rp {Number(item.price).toLocaleString('id-ID')}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

          <Button type="button" onClick={addOverheadItem} variant="outline" className="w-full border-dashed border-[#00a67c] text-[#00a67c] font-bold hover:bg-[#00a67c]/10">
            <Plus size={16} className="mr-2" /> TAMBAH RINCIAN BIAYA
          </Button>
          
          <Button type="submit" disabled={loading} className="w-full bg-[#00a67c] hover:bg-[#008f6b] text-white font-bold h-12 shadow-md">
            {loading ? "Menyimpan..." : "Simpan Perubahan Biaya"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}