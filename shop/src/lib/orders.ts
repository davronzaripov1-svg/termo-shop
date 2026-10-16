import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"

// Склад и статус заказа:
//  - при оформлении товар резервируется (Product.reserved), у вариантов остаток списывается сразу;
//  - пока заказ «в работе» — резерв держится;
//  - заказ отгружен (доставка/доставлен/выполнен) — резерв списывается со склада;
//  - отмена — резерв снимается, отгруженное и варианты возвращаются на склад.
export const IN_PROGRESS: OrderStatus[] = ["NEW", "CONFIRMED", "PROCESSING", "PICKING", "READY"]
export const SHIPPED: OrderStatus[] = ["SHIPPING", "DELIVERED", "COMPLETED"]

export const ORDER_STATUSES: OrderStatus[] = [...IN_PROGRESS, ...SHIPPED, "CANCELLED"]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Ожидает",
  PAID: "Оплачен",
  PARTIAL: "Частично",
  REFUNDED: "Возврат",
  FAILED: "Ошибка",
}

type Stage = "in_progress" | "shipped" | "cancelled"

export function orderStage(status: OrderStatus): Stage {
  if (status === "CANCELLED") return "cancelled"
  return SHIPPED.includes(status) ? "shipped" : "in_progress"
}

/** Куда можно перевести заказ из текущего статуса. */
export function allowedStatuses(current: OrderStatus): OrderStatus[] {
  switch (orderStage(current)) {
    case "in_progress":
      return ORDER_STATUSES
    case "shipped":
      // Назад «в работу» нельзя — товар уже ушёл со склада
      return [...SHIPPED, "CANCELLED"]
    case "cancelled":
      return ["CANCELLED"]
  }
}

export class OrderTransitionError extends Error {}

/**
 * Меняет статус заказа и двигает склад. Вызывать внутри транзакции.
 * Статус меняется условием «был именно current» — повторный клик или два менеджера
 * одновременно не спишут товар дважды.
 */
export async function transitionOrder(
  tx: Prisma.TransactionClient,
  order: { id: string; orderNumber: string; status: OrderStatus },
  next: OrderStatus,
  userId: string,
  comment?: string
) {
  if (order.status === next) return
  if (!allowedStatuses(order.status).includes(next)) {
    throw new OrderTransitionError("Такой переход статуса невозможен")
  }

  const { count } = await tx.order.updateMany({
    where: { id: order.id, status: order.status },
    data: {
      status: next,
      completedAt: next === "COMPLETED" ? new Date() : undefined,
    },
  })
  if (count === 0) {
    throw new OrderTransitionError("Заказ только что изменили. Обновите страницу.")
  }

  await tx.orderStatusHistory.create({
    data: { orderId: order.id, status: next, comment: comment || null, userId },
  })

  const from = orderStage(order.status)
  const to = orderStage(next)
  if (from === to) return

  const movements = await tx.stockMovement.findMany({
    where: { orderId: order.id, type: { in: ["RESERVE", "OUTGOING"] } },
  })
  const reserves = movements.filter((m) => m.type === "RESERVE")
  // Варианты списываются при оформлении (OUTGOING с variantId)
  const variantOut = movements.filter((m) => m.type === "OUTGOING" && m.variantId)
  const log: Prisma.StockMovementCreateManyInput[] = []
  const base = { orderId: order.id, userId }

  if (from === "in_progress" && to === "shipped") {
    for (const m of reserves) {
      await tx.product.update({
        where: { id: m.productId },
        data: { stock: { decrement: m.quantity }, reserved: { decrement: m.quantity } },
      })
      log.push({ ...base, productId: m.productId, type: "OUTGOING", quantity: m.quantity, reason: `Отгрузка заказа ${order.orderNumber}` })
    }
  }

  if (from === "in_progress" && to === "cancelled") {
    for (const m of reserves) {
      await tx.product.update({ where: { id: m.productId }, data: { reserved: { decrement: m.quantity } } })
      log.push({ ...base, productId: m.productId, type: "RELEASE", quantity: m.quantity, reason: `Отмена заказа ${order.orderNumber}` })
    }
  }

  if (from === "shipped" && to === "cancelled") {
    for (const m of reserves) {
      await tx.product.update({ where: { id: m.productId }, data: { stock: { increment: m.quantity } } })
      log.push({ ...base, productId: m.productId, type: "RETURN", quantity: m.quantity, reason: `Возврат по заказу ${order.orderNumber}` })
    }
  }

  if (to === "cancelled") {
    for (const m of variantOut) {
      await tx.productVariant.update({ where: { id: m.variantId! }, data: { stock: { increment: m.quantity } } })
      log.push({ ...base, productId: m.productId, variantId: m.variantId, type: "RETURN", quantity: m.quantity, reason: `Отмена заказа ${order.orderNumber}` })
    }
  }

  if (log.length > 0) {
    await tx.stockMovement.createMany({ data: log })
  }
}

export type OrderFilters = { q?: string; status?: string; from?: string; to?: string; page: number }

export function parseOrderFilters(params: Record<string, string | string[] | undefined>): OrderFilters {
  const get = (k: string) => {
    const v = params[k]
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined
  }
  return {
    q: get("q"),
    status: get("status"),
    from: get("from"),
    to: get("to"),
    page: Math.max(1, Number(get("page")) || 1),
  }
}

/** Условие выборки заказов для списка и экспорта. */
export function orderWhere(f: OrderFilters): Prisma.OrderWhereInput {
  const and: Prisma.OrderWhereInput[] = []
  if (f.q) {
    const digits = f.q.replace(/\D/g, "")
    and.push({
      OR: [
        { orderNumber: { contains: f.q, mode: "insensitive" } },
        { customerName: { contains: f.q, mode: "insensitive" } },
        { customerEmail: { contains: f.q, mode: "insensitive" } },
        ...(digits.length >= 3 ? [{ customerPhone: { contains: digits } }] : []),
      ],
    })
  }
  if (f.status && (ORDER_STATUSES as string[]).includes(f.status)) {
    and.push({ status: f.status as OrderStatus })
  }
  const from = f.from ? new Date(`${f.from}T00:00:00`) : null
  const to = f.to ? new Date(`${f.to}T23:59:59.999`) : null
  if (from && !isNaN(+from)) and.push({ createdAt: { gte: from } })
  if (to && !isNaN(+to)) and.push({ createdAt: { lte: to } })
  return { AND: and }
}
