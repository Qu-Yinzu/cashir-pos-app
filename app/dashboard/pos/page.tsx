import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import PosView from "./PosView";

export default async function PosPage() {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  // 1. Tarik Katalog Produk beserta Resep dan Data Bahan Bakunya
  const rawProducts = await prisma.product.findMany({
    where: { tenantId, archived: 0, status: "Aktif" },
    include: { 
      categories: true,
      recipeIngredients: { 
        include: { rawMaterial: true } // Tarik bahan baku untuk dicek stoknya
      }
    },
    orderBy: { name: "asc" },
  });
  
  // 2. Kalkulasi Stok Dinamis: Berapa porsi yang bisa dibuat dari bahan baku?
  const products = rawProducts.map((p) => {
    let dynamicStock = p.stock; // Fallback ke stok manual jika kebetulan tidak diberi resep
    
    if (p.recipeIngredients && p.recipeIngredients.length > 0) {
      const portions = p.recipeIngredients.map(recipe => {
        if (recipe.amount <= 0) return 0;
        // Hitung: Stok Bahan di Gudang dibagi Kebutuhan Resep
        return Math.floor(recipe.rawMaterial.stock / recipe.amount);
      });
      // Stok menu adalah porsi bahan yang paling sedikit (limiting factor)
      dynamicStock = Math.min(...portions);
    }

    return { 
      ...p, 
      price: Number(p.price), 
      stock: dynamicStock // Timpa stok manual dengan hasil kalkulasi pintar
    };
  });

  const categories = await prisma.category.findMany({
    where: { tenantId, archived: 0 },
    orderBy: { name: "asc" },
  });

  const activeOrders = await prisma.order.findMany({
    where: { tenantId, status: "ACTIVE" },
    include: { orderItems: true },
    orderBy: { createdAt: "asc" },
  });

  const historyOrders = await prisma.order.findMany({
    where: { tenantId, status: "COMPLETED" },
    include: { orderItems: true },
    orderBy: { completedAt: "desc" },
    take: 50,
  });

  return <PosView products={products} categories={categories} activeOrders={activeOrders} historyOrders={historyOrders} />;
}