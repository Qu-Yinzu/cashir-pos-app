"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

const prisma = new PrismaClient();

export async function registerTenant(formData: FormData) {
  const tenantName = formData.get("tenantName") as string;
  const ownerName = formData.get("ownerName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!tenantName || !ownerName || !email || !password) {
    return { error: "Semua data wajib diisi." };
  }

  try {
    // 1. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Email ini sudah digunakan oleh akun lain." };
    }

    // 2. Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan data secara atomik menggunakan Prisma Transaction (TR-06)
    await prisma.$transaction(async (tx) => {
      // Buat akun User
      const user = await tx.user.create({
        data: {
          name: ownerName,
          email,
          password: hashedPassword,
        },
      });

      // Buat entitas Bisnis (Tenant)
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          onboarding: "completed",
        },
      });

      // Hubungkan User ke Tenant sebagai OWNER
      await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: "OWNER",
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Gagal mendaftar:", error);
    return { error: "Terjadi kesalahan server saat mendaftar." };
  }
}

export async function loginUser(formData: FormData) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau password salah." };
        default:
          return { error: "Gagal masuk. Silakan coba lagi." };
      }
    }
    throw error; // Wajib di-throw agar NextAuth bisa melakukan redirect
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}