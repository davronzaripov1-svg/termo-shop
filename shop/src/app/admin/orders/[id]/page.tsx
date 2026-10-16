import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Phone, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatus, PaymentStatus } from "@/components/admin/ui"
import { OrderControls } from "@/components/admin/orders/OrderControls"
import { PrintButton } from "@/components/admin/PrintButton"
import { requirePagePermission } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { ORDER_STATUS_LABELS, getDeliveryMethod, getPaymentMethod } from "@/lib/checkout"
import { getShopSettings } from "@/lib/settings"
import { allowedStatuses } from "@/lib/orders"
import { formatDateTime, formatSum } from "@/lib/utils"

export const metadata = { title: "Заказ" }

const fullName = (u: { firstName: string | null; lastName: string | null; email: string }) =>
  [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("orders")
  const { id } = await params

  const [order, managers] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { slug: true } } } },
        user: { select: { id: true, email: true, _count: { select: { orders: true } } } },
        promocode: { select: { code: true } },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.user.findMany({
      where: { isActive: true, role: { name: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER"] } } },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    }),
  ])
  if (!order) notFound()

  const authorIds = [...new Set(order.statusHistory.map((h) => h.userId).filter((u): u is string => !!u))]
  const authors = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, firstName: true, lastName: true, email: true },
  })
  const authorName = (userId: string | null) => {
    const a = authors.find((u) => u.id === userId)
    return a ? fullName(a) : null
  }

  const settings = await getShopSettings()
  const delivery = getDeliveryMethod(settings, order.deliveryMethod)
  const payment = getPaymentMethod(settings, order.paymentMethod)
  const address = [order.deliveryRegion, order.deliveryCity, order.deliveryAddress].filter(Boolean).join(", ")
  const telegram = order.customerTelegram?.replace(/^@/, "")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Все заказы
        </Link>
        <PrintButton />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Заказ {order.orderNumber}</h1>
        <OrderStatus status={order.status} />
        <PaymentStatus status={order.paymentStatus} />
        <span className="text-sm text-gray-500">от {formatDateTime(order.createdAt)}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Состав заказа</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-y bg-gray-50">
                      <th className="px-6 py-3">Товар</th>
                      <th className="px-6 py-3">Артикул</th>
                      <th className="px-6 py-3 text-right">Цена</th>
                      <th className="px-6 py-3 text-right">Кол-во</th>
                      <th className="px-6 py-3 text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-6 py-3">
                          <Link href={`/product/${item.product.slug}`} target="_blank" className="font-medium hover:text-primary">
                            {item.name}
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-gray-500">{item.sku}</td>
                        <td className="px-6 py-3 text-right whitespace-nowrap">{formatSum(Number(item.price))}</td>
                        <td className="px-6 py-3 text-right">{item.quantity}</td>
                        <td className="px-6 py-3 text-right font-medium whitespace-nowrap">{formatSum(Number(item.total))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <dl className="px-6 py-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Товары</dt><dd>{formatSum(Number(order.subtotal))}</dd></div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>Скидка{order.promocode && ` (промокод ${order.promocode.code})`}</dt>
                    <dd>−{formatSum(Number(order.discount))}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Доставка</dt>
                  <dd>{Number(order.shipping) === 0 ? "Бесплатно" : formatSum(Number(order.shipping))}</dd>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <dt>Итого</dt><dd>{formatSum(Number(order.total))}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Клиент и доставка</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <Info label="Клиент">
                  {order.customerName}
                  {order.customerCompany && <span className="block text-gray-500">{order.customerCompany}</span>}
                  <span className="block text-gray-500">Заказов всего: {order.user._count.orders}</span>
                </Info>
                <Info label="Связь">
                  <a href={`tel:${order.customerPhone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                    <Phone className="h-3 w-3" /> {order.customerPhone}
                  </a>
                  {telegram && (
                    <a href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Send className="h-3 w-3" /> @{telegram}
                    </a>
                  )}
                  {order.customerEmail && <span className="block text-gray-500">{order.customerEmail}</span>}
                </Info>
                <Info label="Доставка">{delivery?.name ?? order.deliveryMethod ?? "—"}</Info>
                <Info label="Оплата">{payment?.name ?? order.paymentMethod ?? "—"}</Info>
                {address && <Info label="Адрес" className="sm:col-span-2">{address}</Info>}
                {order.comment && (
                  <Info label="Комментарий клиента" className="sm:col-span-2">
                    <span className="whitespace-pre-line">{order.comment}</span>
                  </Info>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 print:hidden">
          <OrderControls
            orderId={order.id}
            status={order.status}
            allowedStatuses={allowedStatuses(order.status)}
            paymentStatus={order.paymentStatus}
            managerId={order.managerId ?? ""}
            adminNote={order.adminNote ?? ""}
            managers={managers.map((m) => ({ id: m.id, name: fullName(m) }))}
          />

          <Card>
            <CardHeader><CardTitle>История</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {order.statusHistory.map((h) => (
                  <li key={h.id} className="text-sm border-l-2 border-gray-200 pl-3">
                    <p className="font-medium">{ORDER_STATUS_LABELS[h.status] ?? h.status}</p>
                    <p className="text-gray-500">
                      {formatDateTime(h.createdAt)}
                      {authorName(h.userId) && ` · ${authorName(h.userId)}`}
                    </p>
                    {h.comment && <p className="mt-1">{h.comment}</p>}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Info({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <dt className="text-gray-500 mb-1">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}
