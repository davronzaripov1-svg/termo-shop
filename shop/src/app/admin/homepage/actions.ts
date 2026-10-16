"use server"

import { prisma } from "@/lib/prisma"
import { adminAction, type ActionResult } from "@/lib/admin"

export type ProductOption = { id: string; name: string; sku: string; isActive: boolean }

/** Товары для ручного выбора на главную */
export async function listProductOptions(): Promise<ActionResult<ProductOption[]>> {
  return adminAction("content", async () => {
    const products = await prisma.product.findMany({
      where: { status: { not: "DISCONTINUED" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true, isActive: true },
      take: 2000,
    })
    return { ok: true, data: products }
  })
}
