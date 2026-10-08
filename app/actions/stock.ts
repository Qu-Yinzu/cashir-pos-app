"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createRawMaterial(formData: FormData) {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;
  if (!tenantId) return { error: "Sesi tidak valid." };

  const sku = (formData.get("sku") as string) || undefined;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const stock = parseFloat(formData.get("stock") as string) || 0;
  const unit = formData.get("unit") as string;
  const notes = (formData.get("notes") as string) || undefined;
  const pricePerUnit = parseFloat(formData.get("pricePerUnit") as string) || 0; 

  try {
    await prisma.rawMaterial.create({
      data: { tenantId, sku, name, type, stock, unit, notes, pricePerUnit }
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/hpp");
    return { success: true };
  } catch (error: any) {
    console.error("Error Create RawMaterial:", error);
    return { error: error.message || "Gagal menyimpan bahan baku." };
  }
}

export async function updateRawMaterial(id: string, formData: FormData) {
  const sku = (formData.get("sku") as string) || undefined;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const stock = parseFloat(formData.get("stock") as string) || 0;
  const unit = formData.get("unit") as string;
  const notes = (formData.get("notes") as string) || undefined;
  const pricePerUnit = parseFloat(formData.get("pricePerUnit") as string) || 0;

  try {
    await prisma.rawMaterial.update({
      where: { id },
      data: { sku, name, type, stock, unit, notes, pricePerUnit }
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/hpp");
    return { success: true };
  } catch (error: any) {
    console.error("Error Update RawMaterial:", error);
    return { error: error.message || "Gagal memperbarui bahan baku." };
  }
}

export async function deleteRawMaterial(id: string) {
  try {
    // Soft delete
    await prisma.rawMaterial.update({
      where: { id },
      data: { archived: 1 }
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/hpp");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus bahan baku." };
  }
}

export async function recordStockIn(formData: FormData) {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;
  if (!tenantId) return { error: "Sesi tidak valid." };

  const rawMaterialId = formData.get("itemId") as string;
  const amount = parseFloat(formData.get("amount") as string) || 0;
  const notes = formData.get("notes") as string;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.stockMovement.create({
        data: {
          tenantId,
          rawMaterialId,
          type: "IN",
          amount,
          notes
        }
      });

      await tx.rawMaterial.update({
        where: { id: rawMaterialId },
        data: { stock: { increment: amount } }
      });
    });
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    return { error: "Gagal mencatat stok masuk." };
  }
}

export async function recordStockOut(formData: FormData) {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;
  if (!tenantId) return { error: "Sesi tidak valid." };

  const rawMaterialId = formData.get("itemId") as string;
  const amount = parseFloat(formData.get("amount") as string) || 0;
  const notes = formData.get("notes") as string;

  try {
    await prisma.$transaction(async (tx) => {
      // Pengecekan sisa stok
      const raw = await tx.rawMaterial.findUnique({ where: { id: rawMaterialId } });
      if (!raw || raw.stock < amount) {
        throw new Error("Stok di gudang tidak mencukupi untuk dikeluarkan!");
      }

      await tx.stockMovement.create({
        data: {
          tenantId,
          rawMaterialId,
          type: "OUT",
          amount,
          notes
        }
      });

      await tx.rawMaterial.update({
        where: { id: rawMaterialId },
        data: { stock: { decrement: amount } }
      });
    });
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal mencatat stok keluar." };
  }
}