"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function processCheckout(data: any) {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;
  if (!tenantId) return { error: "Sesi tidak valid." };

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Simpan data pesanan ke database
      const order = await tx.order.create({
        data: {
          tenantId,
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          customerType: data.customerType,
          orderType: data.orderType,
          paymentMethod: data.paymentMethod,
          subtotal: data.subtotal,
          tax: data.tax,
          discount: data.discount,
          total: data.total,
          isPaid: data.isPaid,
          status: "ACTIVE",
          orderItems: {
            create: data.items.map((item: any) => ({
              productId: item.id,
              productName: item.name,
              price: item.price,
              qty: item.qty,
              note: item.note || "",
            }))
          }
        }
      });

      // 2. LOGIKA KELAS ENTERPRISE: Silent Deduct (Potong Stok Tanpa Spam Log)
      for (const item of data.items) {
        // Cari produk dan lihat komposisi resepnya
        const product = await tx.product.findUnique({
          where: { id: item.id },
          include: { recipeIngredients: true }
        });

        if (product && product.recipeIngredients.length > 0) {
          for (const recipe of product.recipeIngredients) {
            const totalNeeded = recipe.amount * item.qty; // Takaran resep x Jumlah pesanan
            
            // Kurangi stok di gudang bahan baku SECARA DIAM-DIAM
            await tx.rawMaterial.update({
              where: { id: recipe.rawMaterialId },
              data: { stock: { decrement: totalNeeded } }
            });
            
            // NOTE: Kita menghapus tx.stockMovement.create() di sini 
            // agar tabel Riwayat Stok Keluar tidak dipenuhi ribuan baris sampah dari transaksi harian.
          }
        }
      }
    });

    revalidatePath("/dashboard/pos"); 
    revalidatePath("/dashboard/products"); // Refresh UI produk
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal memproses pesanan." };
  }
}

export async function payDebtOrder(orderId: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { isPaid: true, paymentMethod: "CASH (Lunas)" }
    });
    revalidatePath("/dashboard/pos");
    return { success: true };
  } catch (error) {
    return { error: "Gagal melunasi hutang." };
  }
}

export async function completeOrder(orderId: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED", completedAt: new Date() }
    });
    revalidatePath("/dashboard/pos");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyelesaikan pesanan." };
  }
}