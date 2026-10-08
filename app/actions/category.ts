"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createCategory(formData: FormData) {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  if (!tenantId) return { error: "Sesi tidak valid." };

  const name = formData.get("name") as string;
  if (!name || name.trim() === "") return { error: "Nama kategori wajib diisi" };

  try {
    await prisma.category.create({
      data: { tenantId, name: name.trim() },
    });
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan kategori." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.update({
      where: { id },
      data: { archived: 1 },
    });
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus kategori." };
  }
}