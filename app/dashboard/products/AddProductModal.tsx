"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createProduct } from "@/app/actions/product";

const RECIPE_UNITS = [
  { key: "gram", label: "Gram (g)" },
  { key: "kg", label: "Kilogram (kg)" },
  { key: "ml", label: "Mililiter (ml)" },
  { key: "liter", label: "Liter (L)" },
  { key: "pcs", label: "Pcs / Saset / Botol" },
  { key: "sdm", label: "Sendok Makan (sdm)" },
  { key: "sdt", label: "Sendok Teh (sdt)" },
  { key: "siung", label: "Siung (Bawang)" },
  { key: "lembar", label: "Lembar (Daun)" },
  { key: "cubit", label: "Sejumput" },
  { key: "potong", label: "Potong / Iris" },
  { key: "cup", label: "Cup (250ml)" }
];

function getConversionRate(recipeUnit: string, baseUnit: string): number {
  const r = recipeUnit.toLowerCase();
  const b = baseUnit.toLowerCase();
  
  if (r === b) return 1;

  if (b === "gram") {
    if (r === "kg") return 1000;
    if (r === "sdm") return 15;
    if (r === "sdt") return 5;
    if (r === "siung") return 5;
    if (r === "cubit") return 2;
    if (r === "lembar") return 1;
  }
  if (b === "kg") {
    if (r === "gram") return 0.001;
  }
  if (b === "ml") {
    if (r === "liter") return 1000;
    if (r === "sdm") return 15;
    if (r === "sdt") return 5;
    if (r === "cup") return 250;
  }
  if (b === "liter") {
    if (r === "ml") return 0.001;
  }
  if (b === "pcs") {
    if (r === "potong") return 0.1;
  }
  
  return 1;
}

export default function AddProductModal({ categories, rawMaterials }: { categories: any[], rawMaterials: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<any[]>([]);

  const addRecipeItem = () => setRecipe([...recipe, { rawMaterialId: "", inputQty: "", unitKey: "gram" }]);
  const removeRecipeItem = (index: number) => { const newRecipe = [...recipe]; newRecipe.splice(index, 1); setRecipe(newRecipe); };

  const updateRecipeItem = (index: number, field: string, value: string) => {
    const newRecipe = [...recipe];
    newRecipe[index][field] = value;
    if (field === "rawMaterialId") {
       const mat = rawMaterials.find(r => r.id === value);
       newRecipe[index].unitKey = mat?.unit?.toLowerCase() || "pcs";
    }
    setRecipe(newRecipe);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    
    const finalRecipe = recipe.filter(r => r.rawMaterialId && r.inputQty).map(r => {
       const mat = rawMaterials.find(m => m.id === r.rawMaterialId);
       const baseUnit = mat?.unit?.toLowerCase() || "pcs";
       const rate = getConversionRate(r.unitKey, baseUnit);
       const finalAmount = parseFloat(r.inputQty) * rate;
       return { rawMaterialId: r.rawMaterialId, amount: finalAmount };
    });

    formData.append("recipe", JSON.stringify(finalRecipe));

    await createProduct(formData);
    setLoading(false);
    setOpen(false);
    setRecipe([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm cursor-pointer shadow-sm transition-colors">
        <Plus size={18} className="mr-2" /> TAMBAH PRODUK / MENU
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2"><UtensilsCrossed size={20} className="text-[#00a67c]" /> Tambah Menu Baru</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nama Menu *</Label><Input name="name" required placeholder="Cth: Nasi Goreng Spesial" className="focus-visible:ring-[#00a67c]" /></div>
            <div className="space-y-2"><Label>SKU (Opsional)</Label><Input name="sku" placeholder="Cth: NSG-001" className="focus-visible:ring-[#00a67c]" /></div>
            
            {/* CHECKBOX BANYAK KATEGORI */}
            <div className="space-y-2 col-span-2">
              <Label>Kategori Menu (Bisa pilih lebih dari satu) *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-white border border-slate-200 rounded-md max-h-32 overflow-y-auto">
                {categories.map(c => (
                  <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer font-medium text-slate-700 hover:text-[#00a67c]">
                    <input type="checkbox" name="categoryIds" value={c.id} className="w-4 h-4 accent-[#00a67c] rounded" />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 col-span-2"><Label>Harga Jual *</Label><Input name="price" type="number" required placeholder="Cth: 25000" className="focus-visible:ring-[#00a67c] font-bold" /></div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-2">
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Tag size={16} /> Komposisi Resep (BOM)</Label>
              <Button type="button" onClick={addRecipeItem} size="sm" variant="outline" className="h-8 border-[#00a67c] text-[#00a67c] hover:bg-[#00a67c]/10 font-bold"><Plus size={14} className="mr-1" /> Tambah Bahan</Button>
            </div>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {recipe.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-2">Belum ada bahan baku. (Menu ini tidak akan memotong stok gudang)</div>
              ) : (
                recipe.map((item, index) => {
                  const mat = rawMaterials.find(r => r.id === item.rawMaterialId);
                  const baseUnit = mat?.unit?.toLowerCase() || "pcs";
                  const rate = getConversionRate(item.unitKey, baseUnit);
                  const calculatedAmount = parseFloat(item.inputQty || "0") * rate;

                  return (
                    <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm relative mb-2">
                      <select value={item.rawMaterialId} onChange={(e) => updateRecipeItem(index, "rawMaterialId", e.target.value)} required className="flex-1 h-9 rounded-md border border-slate-200 text-sm px-2 focus-visible:ring-[#00a67c]">
                        <option value="">Pilih Bahan Gudang...</option>
                        {rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name} ({rm.stock} {rm.unit})</option>)}
                      </select>
                      
                      <Input type="number" step="0.01" value={item.inputQty} onChange={(e) => updateRecipeItem(index, "inputQty", e.target.value)} placeholder="Jml" required className="w-20 h-9 text-center font-bold" />
                      
                      <select value={item.unitKey} onChange={(e) => updateRecipeItem(index, "unitKey", e.target.value)} required className="w-36 h-9 rounded-md border border-slate-200 text-sm px-2 bg-slate-50 focus-visible:ring-[#00a67c]">
                        {RECIPE_UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                      </select>

                      <Button type="button" onClick={() => removeRecipeItem(index)} variant="ghost" className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"><Trash2 size={16} /></Button>

                      {item.inputQty && item.rawMaterialId && (
                        <div className="absolute -bottom-5 right-12 text-[10px] font-bold text-[#00a67c]">
                          (= Potong {calculatedAmount} {baseUnit} gudang)
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#00a67c] hover:bg-[#008f6b] text-white font-black text-lg h-12 shadow-lg mt-4">
            {loading ? "Menyimpan..." : "SIMPAN MENU"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}