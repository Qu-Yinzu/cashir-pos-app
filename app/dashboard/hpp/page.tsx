import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import HppView from "./HppView";

export default async function HppPage() {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  // 1. Tarik data produk beserta resep dan bahan bakunya
  const rawProducts = await prisma.product.findMany({
    where: { tenantId, archived: 0 },
    include: {
      categories: true,
      recipeIngredients: {
        include: { rawMaterial: true }
      },
      overheads: true,
    },
    orderBy: { name: "asc" }
  }); 

  // 2. KONVERSI: Ubah object Decimal dari Prisma menjadi tipe Number biasa
  // agar Next.js tidak protes saat mengirimnya ke Client Component
  const plainProducts = rawProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    recipeIngredients: p.recipeIngredients.map((ri) => ({
      ...ri,
      amount: Number(ri.amount)
    }))
  }));

  const categories = await prisma.category.findMany({
    where: { tenantId, archived: 0 },
    orderBy: { name: "asc" }
  });

  // 3. Kirim data yang sudah bersih (plainProducts) ke View
  return <HppView products={plainProducts} categories={categories} />;
}