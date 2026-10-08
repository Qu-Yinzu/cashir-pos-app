"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateSupplier } from "@/app/actions/supplier";

export default function EditSupplierModal({ supplier }: { supplier: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await updateSupplier(supplier.id, new FormData(event.currentTarget));
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer inline-flex items-center justify-center" title="Edit">
        <Edit size={16} />
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="text-xl font-bold text-slate-800">Edit Data Supplier</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2"><Label>Nama Perusahaan / Toko *</Label><Input name="name" defaultValue={supplier.name} required className="focus-visible:ring-[#00a67c]" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nama Kontak (PIC)</Label><Input name="pic" defaultValue={supplier.pic || ""} className="focus-visible:ring-[#00a67c]" /></div>
            <div className="space-y-2"><Label>No. Telepon / WA</Label><Input name="phone" defaultValue={supplier.phone || ""} className="focus-visible:ring-[#00a67c]" /></div>
          </div>
          <div className="space-y-2"><Label>Alamat Lengkap</Label><Input name="address" defaultValue={supplier.address || ""} className="focus-visible:ring-[#00a67c]" /></div>
          <Button type="submit" disabled={loading} className="w-full bg-[#00a67c] hover:bg-[#008f6b] text-white font-bold mt-2">
            {loading ? "Menyimpan..." : "Update Supplier"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}