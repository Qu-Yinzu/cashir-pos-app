"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;
  if (!tenantId) return { error: "Sesi tidak valid." };

  const name = formData.get("name") as string;
  const sku = (formData.get("sku") as string) || undefined;
  const price = parseFloat(formData.get("price") as string) || 0;
  const packagingCost = parseFloat(formData.get("packagingCost") as string) || 0;
  const overheadCost = parseFloat(formData.get("overheadCost") as string) || 0;
  
  // TANGKAP BANYAK KATEGORI (BERBENTUK ARRAY)
  const categoryIds = formData.getAll("categoryIds") as string[];
  
  const recipeString = formData.get("recipe") as string;
  let recipeData = [];
  if (recipeString) { try { recipeData = JSON.parse(recipeString); } catch (e) {} }

  if (!name || categoryIds.length === 0 || price <= 0) {
    return { error: "Nama, Harga Jual, dan minimal 1 Kategori harus diisi." };
  }

  try {
    await prisma.product.create({
      data: {
        tenantId, name, sku, price, stock: 0, status: "Aktif",
        // Hubungkan ke banyak kategori
        categories: { connect: categoryIds.map(id => ({ id })) },
        recipeIngredients: {
          create: recipeData.map((r: any) => ({ rawMaterialId: r.rawMaterialId, amount: r.amount }))
        }
      }
    });
    revalidatePath("/dashboard/products"); revalidatePath("/dashboard/pos"); revalidatePath("/dashboard/hpp");
    return { success: true };
  } catch (error: any) { return { error: "Gagal menyimpan menu produk." }; }
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const sku = (formData.get("sku") as string) || undefined;
  const price = parseFloat(formData.get("price") as string) || 0;
  
  // TANGKAP BANYAK KATEGORI (BERBENTUK ARRAY)
  const categoryIds = formData.getAll("categoryIds") as string[];
  
  const recipeString = formData.get("recipe") as string;
  let recipeData = [];
  if (recipeString) { try { recipeData = JSON.parse(recipeString); } catch (e) {} }

  if (!name || categoryIds.length === 0 || price <= 0) {
    return { error: "Nama, Harga Jual, dan minimal 1 Kategori harus diisi." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update data dasar & Set ulang kategori
      await tx.product.update({
        where: { id },
        data: { 
          name, sku, price,
          // Set ulang kategorinya (menimpa yang lama)
          categories: { set: categoryIds.map(id => ({ id })) } 
        }
      });
      // 2. Reset Resep
      await tx.recipeIngredient.deleteMany({ where: { productId: id } });
      if (recipeData.length > 0) {
        await tx.recipeIngredient.createMany({
          data: recipeData.map((r: any) => ({ productId: id, rawMaterialId: r.rawMaterialId, amount: r.amount }))
        });
      }
    });
    revalidatePath("/dashboard/products"); revalidatePath("/dashboard/pos"); revalidatePath("/dashboard/hpp");
    return { success: true };
  } catch (error: any) { return { error: "Gagal memperbarui menu produk." }; }
}

export async function deleteProduct(id: string) {
  try {
    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { archived: 1 }
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/pos");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus produk." };
  }
}

export async function updateProductOverhead(id: string, formData: FormData) {
  const overheadsString = formData.get("overheads") as string;
  let overheadsData = [];
  
  if (overheadsString) {
    try { overheadsData = JSON.parse(overheadsString); } catch (e) {}
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Hapus semua rincian biaya yang lama
      await tx.productOverhead.deleteMany({ where: { productId: id } });
      
      // 2. Masukkan rincian biaya yang baru
      if (overheadsData.length > 0) {
        await tx.productOverhead.createMany({
          data: overheadsData.map((o: any) => ({
            productId: id,
            name: o.name,
            price: parseFloat(o.price) || 0
          }))
        });
      }
    });
    
    revalidatePath("/dashboard/hpp");
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    return { error: "Gagal memperbarui rincian biaya." };
  }
}