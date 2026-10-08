import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ProductView from "./ProductView";

export default async function ProductsPage() {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  // Tarik produk beserta bahan bakunya
  const rawProducts = await prisma.product.findMany({
    where: { tenantId, archived: 0 },
    include: { 
      categories: true,
      recipeIngredients: {
        include: { rawMaterial: true }
      } 
    },
    orderBy: { createdAt: "desc" },
  });

  // Kalkulasi stok dinamis
  const plainProducts = rawProducts.map((product) => {
    let dynamicStock = product.stock;
    if (product.recipeIngredients && product.recipeIngredients.length > 0) {
      const portions = product.recipeIngredients.map(r => 
        r.amount > 0 ? Math.floor(r.rawMaterial.stock / r.amount) : 0
      );
      dynamicStock = Math.min(...portions);
    }

    return {
      ...product,
      price: Number(product.price),
      stock: dynamicStock // Tampilkan stok hasil hitungan di tabel
    };
  });

  const categories = await prisma.category.findMany({
    where: { tenantId, archived: 0 },
    orderBy: { createdAt: "desc" },
  });

  const rawMaterials = await prisma.rawMaterial.findMany({
    where: { tenantId, archived: 0 },
    orderBy: { createdAt: "desc" },
  });

  const stockMovements = await prisma.stockMovement.findMany({
    where: { tenantId }, 
    include: { 
      product: { select: { name: true, sku: true } }, 
      rawMaterial: { select: { name: true, sku: true, unit: true, type: true } } 
    },
    orderBy: { createdAt: "desc" },
  });

  const suppliers = await prisma.supplier.findMany({
    where: { tenantId, archived: 0 },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ProductView 
      products={plainProducts} 
      categories={categories} 
      rawMaterials={rawMaterials} 
      stockMovements={stockMovements} 
      suppliers={suppliers} 
    />
  );
}