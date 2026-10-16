import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getDeliveryMethod, getPaymentMethod } from "@/lib/checkout"
import { getShopSettings } from "@/lib/settings"
import { formatDateTime, formatSum } from "@/lib/utils"

type Props = {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ new?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { orderNumber } = await params
  return { title: `Заказ ${orderNumber}` }
}

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ orderNumber }, { new: isNew }] = await Promise.all([params, searchParams])
  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/account/orders/${orderNumber}`)
  }

  const order = await prisma.order.findFirst({
    // Только свой заказ
    where: { orderNumber, userId: session.user.id },
    include: {
      items: { include: { product: { select: { slug: true } } } },
      promocode: { select: { code: true } },
    },
  })
  if (!order) {
    notFound()
  }

  const settings = await getShopSettings()
  const delivery = getDeliveryMethod(settings, order.deliveryMethod)
  const payment = getPaymentMethod(settings, order.paymentMethod)
  const address = [order.deliveryRegion, order.deliveryCity, order.deliveryAddress].filter(Boolean).join(", ")

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {isNew && (
        <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-1">Спасибо! Заказ оформлен</h1>
          <p className="text-gray-600">
            Номер заказа <span className="font-semibold">{order.orderNumber}</span>.
            Менеджер свяжется с вами по телефону {order.customerPhone} для подтверждения.
          </p>
        </div>
      )}

      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/account" className="hover:text-primary">Личный кабинет</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Заказ {order.orderNumber}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Заказ {order.orderNumber}</h2>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm text-gray-500 mb-6">от {formatDateTime(order.createdAt)}</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Товары</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <div>
                  <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-primary">
                    {item.name}
                  </Link>
                  <p className="text-gray-500">{item.sku} · {item.quantity} × {formatSum(Number(item.price))}</p>
                </div>
                <p className="font-medium whitespace-nowrap">{formatSum(Number(item.total))}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Товары</dt>
              <dd>{formatSum(Number(order.subtotal))}</dd>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <dt>Скидка{order.promocode && ` (${order.promocode.code})`}</dt>
                <dd>−{formatSum(Number(order.discount))}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Доставка</dt>
              <dd>{Number(order.shipping) === 0 ? "Бесплатно" : formatSum(Number(order.shipping))}</dd>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2">
              <dt>Итого</dt>
              <dd>{formatSum(Number(order.total))}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Получение и оплата</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <Row label="Получатель" value={[order.customerName, order.customerPhone].join(", ")} />
            {order.customerCompany && <Row label="Компания" value={order.customerCompany} />}
            <Row label="Доставка" value={delivery?.name ?? order.deliveryMethod ?? "—"} />
            {address && <Row label="Адрес" value={address} />}
            <Row label="Оплата" value={payment?.name ?? order.paymentMethod ?? "—"} />
            {order.paymentMethod === "transfer" && settings.transferDetails && order.status !== "CANCELLED" && (
              <div className="rounded-lg bg-amber-50 p-3">
                <dt className="font-medium mb-1">Реквизиты для перевода</dt>
                <dd className="whitespace-pre-line">{settings.transferDetails}</dd>
              </div>
            )}
            {order.comment && <Row label="Комментарий" value={order.comment} />}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}
