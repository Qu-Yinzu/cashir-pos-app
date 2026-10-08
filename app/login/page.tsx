"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await loginUser(formData);

    if (response?.error) {
      setError(response.error);
      setLoading(false);
    }
    // Jika berhasil, redirect otomatis ditangani oleh NextAuth
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-4">
        <div className="flex justify-center mb-6">
          <div className="bg-[#00a67c] text-white px-6 py-2 rounded-full font-bold text-xl shadow-md">
            CASH-IR
          </div>
        </div>
        
        <Card className="shadow-lg border-t-4 border-t-[#00a67c]">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-800">Masuk ke Sistem</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Kelola operasional dan pantau transaksi bisnis Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm font-semibold">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700">Email</Label>
                <Input name="email" id="email" type="email" placeholder="admin@tokokasim.com" required className="focus-visible:ring-[#00a67c]"/>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-bold text-slate-700">Password</Label>
                  <Link href="#" className="text-sm font-semibold text-[#00a67c] hover:underline">Lupa password?</Link>
                </div>
                <Input name="password" id="password" type="password" required className="focus-visible:ring-[#00a67c]"/>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#00a67c] hover:bg-[#008f6b] text-white font-bold text-md mt-4">
                {loading ? "Mengecek..." : "Masuk"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm font-medium text-slate-600">
              Belum mendaftarkan bisnis Anda? <Link href="/register" className="text-[#00a67c] hover:underline font-bold">Daftar sekarang</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}