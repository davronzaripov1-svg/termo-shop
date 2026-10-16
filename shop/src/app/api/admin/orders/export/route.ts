import * as XLSX from "xlsx"
import { AdminActionError, requirePermission } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { ORDER_STATUS_LABELS, getDeliveryMethod, getPaymentMethod } from "@/lib/checkout"
import { getShopSettings } from "@/lib/settings"
import { PAYMENT_STATUS_LABELS, orderWhere, parseOrderFilters } from "@/lib/orders"

// Выгрузка заказов (с текущими фильтрами списка) в Excel
export async function GET(request: Request) {
  try {
    await requirePermission("orders")
  } catch (error) {
    if (error instanceof AdminActionError) return new Response("Forbidden", { status: 403 })
    throw error
  }

  const params = Object.fromEntries(new URL(request.url).searchParams)
  const orders = await prisma.order.findMany({
    where: orderWhere(parseOrderFilters(params)),
    orderBy: { createdAt: "desc" },
    take: 10_000,
    include: { items: { select: { name: true, quantity: true } } },
  })

  const settings = await getShopSettings()
  const rows = orders.map((o) => ({
    "Номер": o.orderNumber,
    "Дата": o.createdAt.toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" }),
    "Статус": ORDER_STATUS_LABELS[o.status] ?? o.status,
    "Оплата": PAYMENT_STATUS_LABELS[o.paymentStatus],
    "Клиент": o.customerName,
    "Телефон": o.customerPhone,
    "Email": o.customerEmail ?? "",
    "Компания": o.customerCompany ?? "",
    "Товары": o.items.map((i) => `${i.name} × ${i.quantity}`).join("; "),
    "Сумма товаров": Number(o.subtotal),
    "Скидка": Number(o.discount),
    "Доставка": Number(o.shipping),
    "Итого": Number(o.total),
    "Способ доставки": getDeliveryMethod(settings, o.deliveryMethod)?.name ?? o.deliveryMethod ?? "",
    "Адрес": [o.deliveryRegion, o.deliveryCity, o.deliveryAddress].filter(Boolean).join(", "),
    "Способ оплаты": getPaymentMethod(settings, o.paymentMethod)?.name ?? o.paymentMethod ?? "",
    "Комментарий": o.comment ?? "",
  }))

  const sheet = XLSX.utils.json_to_sheet(rows)
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, "Заказы")
  const file = XLSX.write(book, { type: "buffer", bookType: "xlsx" }) as Buffer

  const date = new Date().toISOString().slice(0, 10)
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="orders-${date}.xlsx"`,
    },
  })
}
