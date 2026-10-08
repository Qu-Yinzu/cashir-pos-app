"use client";

import { useState, useEffect } from "react";
import { Edit, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateRawMaterial } from "@/app/actions/stock";

export default function EditRawMaterialModal({ rawMaterial }: { rawMaterial: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // STATE KONTROL PENUH UNTUK MENGHINDARI WARNING "UNCONTROLLED FIELD"
  const [formState, setFormState] = useState({
    sku: rawMaterial?.sku || "",
    name: rawMaterial?.name || "",
    type: rawMaterial?.type || "RAW",
    stock: rawMaterial?.stock ?? 0,
    unit: rawMaterial?.unit || "pcs",
    notes: rawMaterial?.notes || ""
  });

  const [totalPrice, setTotalPrice] = useState<string>("");
  const [qty, setQty] = useState<string>("");
  const [pricePerUnit, setPricePerUnit] = useState<number>(rawMaterial?.pricePerUnit ?? 0);

  // Reset form setiap kali modal dibuka agar data selalu sinkron dengan database terbaru
  useEffect(() => {
    if (open) {
      setFormState({
        sku: rawMaterial?.sku || "",
        name: rawMaterial?.name || "",
        type: rawMaterial?.type || "RAW",
        stock: rawMaterial?.stock ?? 0,
        unit: rawMaterial?.unit || "pcs",
        notes: rawMaterial?.notes || ""
      });
      setPricePerUnit(rawMaterial?.pricePerUnit ?? 0);
      setTotalPrice("");
      setQty("");
      setError(null);
    }
  }, [open, rawMaterial]);

  // Handler untuk mengikat input dengan State (Controlled Input)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Hitung modal satuan secara real-time saat user mengetik Total Harga
  useEffect(() => {
    if (totalPrice && qty) {
       const calc = parseFloat(totalPrice) / parseFloat(qty);
       if (!isNaN(calc) && isFinite(calc)) setPricePerUnit(calc);
    }
  }, [totalPrice, qty]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Karena input kita dikendalikan State, kita rakit FormData-nya secara manual
    const formData = new FormData();
    formData.append("sku", formState.sku.toString());
    formData.append("name", formState.name.toString());
    formData.append("type", formState.type.toString());
    formData.append("stock", formState.stock.toString());
    formData.append("unit", formState.unit.toString());
    formData.append("notes", formState.notes.toString());
    formData.append("pricePerUnit", pricePerUnit.toString());

    const response = await updateRawMaterial(rawMaterial.id, formData);

    if (response?.error) {
      setError(response.error);
    } else {
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer inline-flex items-center justify-center" title="Edit">
        <Edit size={16} />
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="text-xl font-bold text-slate-800">Edit Stok & Harga Modal</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <div className="bg-red-100 text-red-700 p-2.5 rounded-md text-sm font-semibold">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Barang *</Label>
              {/* Kita gunakan 'value' & 'onChange' bukan 'defaultValue' */}
              <Input name="name" value={formState.name} onChange={handleChange} required className="focus-visible:ring-[#00a67c]" />
            </div>
            <div className="space-y-2">
              <Label>Tipe Item Stok *</Label>
              <select name="type" value={formState.type} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus-visible:ring-[#00a67c]">
                <option value="RAW">Bahan Mentah</option>
                <option value="FINISHED">Produk Jadi</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Jumlah Stok Sisa *</Label>
              <Input name="stock" type="number" step="0.01" value={formState.stock} onChange={handleChange} required className="focus-visible:ring-[#00a67c] font-bold" />
            </div>
            <div className="space-y-2">
              <Label>Satuan *</Label>
              <select name="unit" value={formState.unit} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus-visible:ring-[#00a67c]">
                <option value="kg">kg</option>
                <option value="gram">gram</option>
                <option value="liter">liter</option>
                <option value="ml">ml</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
          </div>

          {/* KALKULATOR MODAL PINTAR */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mt-2">
            <Label className="text-[#00a67c] flex items-center gap-2"><Calculator size={16}/> Kalkulator Modal Otomatis</Label>
            <p className="text-xs text-slate-500 font-medium">Bingung menghitung modal per satuan? Masukkan harga beli total di bawah ini:</p>
            <div className="flex gap-2">
              <Input placeholder="Total Hrg (Cth: 35000)" type="number" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} className="bg-white border-slate-300 focus-visible:ring-[#00a67c]" />
              <Input placeholder="Jml (Cth: 1000)" type="number" step="0.01" value={qty} onChange={e => setQty(e.target.value)} className="bg-white border-slate-300 focus-visible:ring-[#00a67c]" />
            </div>
            <div className="space-y-1 mt-2">
              <Label className="text-xs">Modal per satuan yang akan tersimpan:</Label>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-800">Rp</span>
                {/* Input manual harga satuan */}
                <Input type="number" step="0.01" value={pricePerUnit === 0 ? "" : pricePerUnit} onChange={e => setPricePerUnit(parseFloat(e.target.value) || 0)} className="font-bold text-lg h-10 border-slate-300 w-32 focus-visible:ring-[#00a67c]" />
                <span className="text-sm font-bold text-slate-500">/ {formState.unit}</span>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#00a67c] hover:bg-[#008f6b] text-white font-bold mt-2 h-11">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}