import { prisma } from "./prisma"

// Магазин работает по времени Ташкента (UTC+5, без перехода на летнее время)
const TZ_OFFSET_MS = 5 * 3600 * 1000

/** Начало месяца по Ташкенту; offset = -1 — прошлый месяц, 1 — следующий */
export function monthStart(offset = 0, now = new Date()): Date {
  const local = new Date(now.getTime() + TZ_OFFSET_MS)
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + offset, 1) - TZ_OFFSET_MS)
}

/** Начало дня по Ташкенту, offset в днях */
export function dayStart(offset = 0, now = new Date()): Date {
  const local = new Date(now.getTime() + TZ_OFFSET_MS)
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + offset) - TZ_OFFSET_MS)
}

/** Заказ считается продажей, если не отменён */
const sold = { status: { not: "CANCELLED" as const } }

export async function periodTotals(from: Date, to: Date) {
  const [orders, customers] = await Promise.all([
    prisma.order.aggregate({
      where: { ...sold, createdAt: { gte: from, lt: to } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.user.count({ where: { role: { name: "CUSTOMER" }, createdAt: { gte: from, lt: to } } }),
  ])
  const revenue = Number(orders._sum.total ?? 0)
  const count = orders._count._all
  return { revenue, orders: count, avgCheck: count ? Math.round(revenue / count) : 0, customers }
}

/** Изменение в процентах; null — сравнивать не с чем */
export function change(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 100)
}

/** Товары со свободным остатком не выше порога */
export async function lowStockProducts(limit = 10) {
  return prisma.$queryRaw<{ id: string; name: string; sku: string; stock: number; reserved: number; lowStockThreshold: number; unit: string }[]>`
    SELECT "id", "name", "sku", "stock", "reserved", "lowStockThreshold", "unit" FROM "Product"
    WHERE "isActive" AND "status" <> 'DISCONTINUED' AND "stock" - "reserved" <= "lowStockThreshold"
    ORDER BY "stock" - "reserved" ASC, "name" ASC
    LIMIT ${limit}`
}

export function pctLabel(value: number | null): string {
  if (value === null) return "новое"
  return `${value > 0 ? "+" : ""}${value}%`
}
