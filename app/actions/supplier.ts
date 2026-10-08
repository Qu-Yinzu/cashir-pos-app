"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSupplier(formData: FormData) {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;
  if (!tenantId) return { error: "Sesi tidak valid." };

  const name = formData.get("name") as string;
  const pic = formData.get("pic") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  try {
    await prisma.supplier.create({
      data: { tenantId, name, pic, phone, address },
    });
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan supplier." };
  }
}

export async function updateSupplier(id: string, formData: FormData) {
  try {
    await prisma.supplier.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        pic: formData.get("pic") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
      },
    });
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    return { error: "Gagal memperbarui supplier." };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.update({
      where: { id },
      data: { archived: 1 }
    });
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus supplier." };
  }
}