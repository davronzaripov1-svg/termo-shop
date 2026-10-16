"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { AdminFormError, adminAction, logActivity, zodFieldErrors, type ActionResult } from "@/lib/admin"

const stockOpSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  // in — приход, out — списание, set — инвентаризация (фактический остаток)
  op: z.enum(["in", "out", "set"]),
  quantity: z.coerce.number().int("Целое число").min(0, "Не меньше 0").max(1_000_000),
  reason: z.string().trim().max(300).optional(),
})

export type StockOpInput = z.input<typeof stockOpSchema>

const defaultReason = { in: "Приход товара", out: "Списание", set: "Инвентаризация" }

export async function applyStockOperation(input: StockOpInput): Promise<ActionResult> {
  return adminAction("warehouse", async (staff) => {
    const parsed = stockOpSchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: "Проверьте поля формы", fieldErrors: zodFieldErrors(parsed.error.issues) }
    }
    const { productId, variantId, op, quantity, reason } = parsed.data
    if (op !== "set" && quantity === 0) {
      return { ok: false, error: "Проверьте поля формы", fieldErrors: { quantity: "Укажите количество" } }
    }

    await prisma.$transaction(async (tx) => {
      // Блокируем строку, чтобы параллельный заказ не изменил остаток между чтением и записью
      const rows = variantId
        ? await tx.$queryRaw<{ stock: number; reserved: number }[]>`
            SELECT "stock", 0 AS "reserved" FROM "ProductVariant" WHERE "id" = ${variantId} AND "productId" = ${productId} FOR UPDATE`
        : await tx.$queryRaw<{ stock: number; reserved: number }[]>`
            SELECT "stock", "reserved" FROM "Product" WHERE "id" = ${productId} FOR UPDATE`
      const row = rows[0]
      if (!row) throw new AdminFormError({ quantity: "Товар не найден" })

      const next = op === "in" ? row.stock + quantity : op === "out" ? row.stock - quantity : quantity
      if (next < row.reserved) {
        throw new AdminFormError({
          quantity: row.reserved > 0
            ? `${row.reserved} шт. в резерве по заказам — остаток не может стать меньше`
            : "Остаток не может стать отрицательным",
        })
      }
      const delta = next - row.stock
      if (delta === 0) return

      if (variantId) {
        await tx.productVariant.update({ where: { id: variantId }, data: { stock: next } })
      } else {
        await tx.product.update({ where: { id: productId }, data: { stock: next } })
      }
      await tx.stockMovement.create({
        data: {
          productId,
          variantId: variantId ?? null,
          type: op === "in" ? "INCOMING" : op === "out" ? "OUTGOING" : "ADJUSTMENT",
          quantity: op === "set" ? delta : quantity,
          reason: reason || defaultReason[op],
          userId: staff.id,
        },
      })
    })

    await logActivity(staff.id, `stock.${op}`, "Product", productId, { newData: { variantId, quantity, reason } })
    revalidatePath("/admin/warehouse")
    revalidatePath("/admin/products")
    revalidatePath("/", "layout")
    return { ok: true }
  })
}
