"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerTenant } from "@/app/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await registerTenant(formData);

    if (response?.error) {
      setError(response.error);
      setLoading(false);
    } else {
      // Jika berhasil, arahkan ke halaman login
      router.push("/login?registered=true");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-lg p-4">
        <div className="flex justify-center mb-6">
          <div className="bg-[#00a67c] text-white px-6 py-2 rounded-full font-bold text-xl shadow-md">
            CASH-IR
          </div>
        </div>
        
        <Card className="shadow-lg border-t-4 border-t-[#00a67c]">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-800">Daftarkan Bisnis Anda</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Mulai kelola kasir dan inventaris dalam hitungan menit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm font-semibold">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenantName" className="font-bold text-slate-700">Nama Bisnis / Toko *</Label>
                <Input name="tenantName" id="tenantName" type="text" placeholder="Misal: Toko Kasim" required className="focus-visible:ring-[#00a67c]"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="font-bold text-slate-700">Nama Pemilik *</Label>
                <Input name="ownerName" id="ownerName" type="text" placeholder="Nama lengkap Anda" required className="focus-visible:ring-[#00a67c]"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700">Email Akun *</Label>
                <Input name="email" id="email" type="email" placeholder="email@domain.com" required className="focus-visible:ring-[#00a67c]"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-slate-700">Password *</Label>
                <Input name="password" id="password" type="password" required className="focus-visible:ring-[#00a67c]"/>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#00a67c] hover:bg-[#008f6b] text-white font-bold text-md mt-6">
                {loading ? "Memproses..." : "Buat Akun Bisnis"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm font-medium text-slate-600">
              Sudah memiliki akun? <Link href="/login" className="text-[#00a67c] hover:underline font-bold">Masuk di sini</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}