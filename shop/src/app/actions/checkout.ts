"use server"

import { Prisma, ProductStatus, type Promocode } from "@prisma/client"
import { after } from "next/server"
import { z } from "zod"
import { auth, normalizePhone } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAvailability, visibleProductWhere } from "@/lib/catalog"
import {
  calcPromoDiscount,
  calcShipping,
  getDeliveryMethod,
  getPaymentMethod,
  type DeliveryMethod,
  type PaymentMethod,
} from "@/lib/checkout"
import { getShopSettings } from "@/lib/settings"
import { notifyNewOrder } from "@/lib/notify"

// ==================== ПРОМОКОД ====================

export type PromoResult =
  | { ok: true; code: string; discountType: "PERCENT" | "FIXED"; discountValue: number; maxDiscount: number | null; description: string | null }
  | { ok: false; error: string }

async function findPromocode(
  db: Prisma.TransactionClient,
  rawCode: string,
  subtotal: number
): Promise<{ promo: Promocode } | { error: string }> {
  const code = rawCode.trim()
  if (!code) return { error: "Введите промокод" }

  const promo = await db.promocode.findFirst({
    where: { code: { equals: code, mode: "insensitive" } },
  })
  const now = new Date()
  if (!promo || !promo.isActive || (promo.startsAt && promo.startsAt > now)) {
    return { error: "Промокод не найден" }
  }
  if (promo.expiresAt && promo.expiresAt < now) {
    return { error: "Срок действия промокода истёк" }
  }
  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    return { error: "Промокод больше не действует" }
  }
  if (promo.minOrderAmount && subtotal < Number(promo.minOrderAmount)) {
    return { error: `Промокод действует для заказов от ${Number(promo.minOrderAmount).toLocaleString("ru-RU")} сум` }
  }
  return { promo }
}

function promoTerms(promo: Promocode) {
  return {
    discountType: promo.discountType,
    discountValue: Number(promo.discountValue),
    maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : null,
  }
}

export async function checkPromocode(code: string, subtotal: number): Promise<PromoResult> {
  const session = await auth()
  if (!session?.user) return { ok: false, error: "Войдите, чтобы применить промокод" }

  const found = await findPromocode(prisma, code, subtotal)
  if ("error" in found) return { ok: false, error: found.error }
  return { ok: true, code: found.promo.code, description: found.promo.description, ...promoTerms(found.promo) }
}

// ==================== ОФОРМЛЕНИЕ ЗАКАЗА ====================

const deliveryIds: [DeliveryMethod["id"], ...DeliveryMethod["id"][]] = ["courier", "regions", "pickup"]
const paymentIds: [PaymentMethod["id"], ...PaymentMethod["id"][]] = ["cash", "card", "transfer"]

const orderSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          variantId: z.string().optional(),
          quantity: z.number().int().positive().max(100_000),
          price: z.number().nonnegative(),
        })
      )
      .min(1, "Корзина пуста"),
    name: z.string().trim().min(2, "Укажите имя").max(100),
    phone: z
      .string()
      .transform(normalizePhone)
      .refine((v) => /^\+\d{9,15}$/.test(v), "Неверный номер телефона"),
    email: z.union([z.literal(""), z.email("Неверный email")]).optional(),
    telegram: z.string().trim().max(64).optional(),
    company: z.string().trim().max(200).optional(),
    deliveryMethod: z.enum(deliveryIds, "Выберите способ доставки"),
    region: z.string().trim().max(100).optional(),
    city: z.string().trim().max(100).optional(),
    address: z.string().trim().max(500).optional(),
    paymentMethod: z.enum(paymentIds, "Выберите способ оплаты"),
    comment: z.string().trim().max(1000).optional(),
    promocode: z.string().trim().max(50).optional(),
  })
  .superRefine((d, ctx) => {
    // курьер и регионы — с адресом (см. DEFAULT_SHOP_SETTINGS.needsAddress)
    if (d.deliveryMethod === "pickup") return
    if (!d.region) ctx.addIssue({ code: "custom", path: ["region"], message: "Выберите регион" })
    if (!d.city) ctx.addIssue({ code: "custom", path: ["city"], message: "Укажите город или район" })
    if (!d.address || d.address.length < 5) {
      ctx.addIssue({ code: "custom", path: ["address"], message: "Укажите улицу, дом и квартиру" })
    }
  })

// Способы доставки/оплаты приходят из формы строками — проверяет схема
export type OrderInput = Omit<z.input<typeof orderSchema>, "deliveryMethod" | "paymentMethod"> & {
  deliveryMethod: string
  paymentMethod: string
}

/** Что поправить в корзине, если цены или остатки изменились с момента добавления. */
export type CartFix = {
  productId: string
  variantId?: string
  remove?: boolean
  price?: number
  maxQuantity?: number
}

export type PlaceOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; cartFixes?: CartFix[] }

class CheckoutProblem extends Error {
  constructor(message: string, public cartFixes: CartFix[] = []) {
    super(message)
  }
}

function generateOrderNumber() {
  const d = new Date()
  const date = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  return `${date}-${Math.floor(100000 + Math.random() * 900000)}`
}

export async function placeOrder(input: OrderInput): Promise<PlaceOrderResult> {
  const session = await auth()
  if (!session?.user) {
    return { ok: false, error: "Войдите в аккаунт, чтобы оформить заказ" }
  }
  const userId = session.user.id
  // Сессия живёт 30 дней — блокировку проверяем по базе
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } })
  if (!user?.isActive) {
    return { ok: false, error: "Аккаунт заблокирован. Свяжитесь с магазином." }
  }

  const parsed = orderSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message
    }
    return { ok: false, error: "Проверьте данные заказа", fieldErrors }
  }
  const data = parsed.data
  const settings = await getShopSettings()
  const delivery = getDeliveryMethod(settings, data.deliveryMethod)
  const payment = getPaymentMethod(settings, data.paymentMethod)
  if (!delivery?.enabled) {
    return { ok: false, error: "Этот способ доставки сейчас недоступен", fieldErrors: { deliveryMethod: "Выберите другой способ" } }
  }
  if (!payment?.enabled) {
    return { ok: false, error: "Этот способ оплаты сейчас недоступен", fieldErrors: { paymentMethod: "Выберите другой способ" } }
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Цены и наличие — только из базы
      const products = await tx.product.findMany({
        where: { ...visibleProductWhere, id: { in: data.items.map((i) => i.productId) } },
        include: { variants: { where: { isActive: true } } },
      })

      // Одна поправка на позицию: цена и остаток могли измениться одновременно
      const fixes = new Map<string, CartFix>()
      const fix = (item: { productId: string; variantId?: string }, change: Omit<CartFix, "productId" | "variantId">) => {
        const id = `${item.productId}:${item.variantId ?? ""}`
        fixes.set(id, { ...(fixes.get(id) ?? { productId: item.productId, variantId: item.variantId }), ...change })
      }
      const problems: string[] = []
      const lines = data.items.flatMap((item) => {
        const product = products.find((p) => p.id === item.productId)
        const variant = item.variantId ? product?.variants.find((v) => v.id === item.variantId) : undefined
        if (!product || (item.variantId && !variant)) {
          problems.push("Некоторые товары больше не продаются — мы убрали их из корзины")
          fix(item, { remove: true })
          return []
        }

        const name = variant ? `${product.name} (${variant.name})` : product.name
        const price = Number(variant?.price ?? product.price)
        const { availability, maxQuantity } = variant
          ? getAvailability({ stock: variant.stock, reserved: 0, status: product.status })
          : getAvailability(product)

        if (availability === "out_of_stock") {
          problems.push(`«${name}» закончился`)
          fix(item, { remove: true })
          return []
        }
        if (item.quantity > maxQuantity) {
          problems.push(`«${name}»: в наличии только ${maxQuantity} ${product.unit}`)
          fix(item, { maxQuantity })
        }
        if (item.quantity < product.minQuantity) {
          problems.push(`«${name}»: минимальный заказ ${product.minQuantity} ${product.unit}`)
        }
        if (price !== item.price) {
          problems.push(`Цена «${name}» изменилась: теперь ${price.toLocaleString("ru-RU")} сум`)
          fix(item, { price })
        }
        return [{ product, variant, name, price, quantity: item.quantity, sku: variant?.sku || product.sku }]
      })

      if (problems.length > 0) {
        throw new CheckoutProblem([...new Set(problems)].join(". "), [...fixes.values()])
      }

      // 2. Резервируем товар. Условие на остаток прямо в UPDATE — защита от одновременных заказов
      const movements: Prisma.StockMovementCreateManyInput[] = []
      for (const line of lines) {
        if (line.variant) {
          const { count } = await tx.productVariant.updateMany({
            where: { id: line.variant.id, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          })
          if (count === 0 && line.product.status !== ProductStatus.ON_ORDER) {
            throw new CheckoutProblem(`«${line.name}» только что раскупили`, [
              { productId: line.product.id, variantId: line.variant.id, remove: true },
            ])
          }
          if (count > 0) {
            movements.push({
              productId: line.product.id,
              variantId: line.variant.id,
              type: "OUTGOING",
              quantity: line.quantity,
              reason: `вариант «${line.variant.name}»`,
            })
          }
          continue
        }

        const reserved = await tx.$executeRaw`
          UPDATE "Product" SET "reserved" = "reserved" + ${line.quantity}
          WHERE "id" = ${line.product.id} AND "stock" - "reserved" >= ${line.quantity}`
        if (reserved === 0 && line.product.status !== ProductStatus.ON_ORDER) {
          throw new CheckoutProblem(`«${line.name}» только что раскупили`, [
            { productId: line.product.id, remove: true },
          ])
        }
        if (reserved > 0) {
          movements.push({ productId: line.product.id, type: "RESERVE", quantity: line.quantity })
        }
      }

      // 3. Суммы
      const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
      let discount = 0
      let promocodeId: string | undefined
      if (data.promocode) {
        const found = await findPromocode(tx, data.promocode, subtotal)
        if ("error" in found) throw new CheckoutProblem(`Промокод: ${found.error}`)
        const used = await tx.$executeRaw`
          UPDATE "Promocode" SET "usageCount" = "usageCount" + 1
          WHERE "id" = ${found.promo.id} AND ("usageLimit" IS NULL OR "usageCount" < "usageLimit")`
        if (used === 0) throw new CheckoutProblem("Промокод: больше не действует")
        discount = calcPromoDiscount(promoTerms(found.promo), subtotal)
        promocodeId = found.promo.id
      }
      const shipping = calcShipping(settings, delivery.id, subtotal - discount)
      const total = subtotal - discount + shipping

      // 4. Заказ
      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          subtotal,
          discount,
          shipping,
          total,
          promocodeId,
          deliveryMethod: delivery.id,
          paymentMethod: data.paymentMethod,
          customerName: data.name,
          customerPhone: data.phone,
          customerEmail: data.email || null,
          customerTelegram: data.telegram || null,
          customerCompany: data.company || null,
          deliveryRegion: delivery.needsAddress ? (delivery.fixedRegion ?? data.region) : null,
          deliveryCity: delivery.needsAddress ? data.city : null,
          deliveryAddress: delivery.needsAddress ? data.address : null,
          comment: data.comment || null,
          items: {
            create: lines.map((l) => ({
              productId: l.product.id,
              variantId: l.variant?.id,
              name: l.name,
              sku: l.sku,
              price: l.price,
              quantity: l.quantity,
              total: l.price * l.quantity,
            })),
          },
          statusHistory: { create: { status: "NEW", comment: "Заказ оформлен на сайте", userId } },
        },
      })

      if (movements.length > 0) {
        await tx.stockMovement.createMany({
          data: movements.map((m) => ({ ...m, orderId: created.id, userId, reason: [`Заказ ${created.orderNumber}`, m.reason].filter(Boolean).join(", ") })),
        })
      }
      return created
    })

    // Уведомление — после ответа покупателю, чтобы не задерживать оформление
    after(() => notifyNewOrder(order.id))
    return { ok: true, orderNumber: order.orderNumber }
  } catch (error) {
    if (error instanceof CheckoutProblem) {
      return { ok: false, error: error.message, cartFixes: error.cartFixes }
    }
    console.error("placeOrder failed:", error)
    return { ok: false, error: "Не удалось оформить заказ. Попробуйте ещё раз или позвоните нам." }
  }
}
