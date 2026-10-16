import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/shop/checkout/CheckoutForm"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getShopSettings, getSiteSettings } from "@/lib/settings"

export const metadata = { title: "Оформление заказа" }

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout")
  }

  const [user, lastOrder, site, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, phone: true, email: true, telegram: true, company: true },
    }),
    // Адрес и контакты подставляем из прошлого заказа
    prisma.order.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        customerName: true, customerPhone: true, customerTelegram: true, customerCompany: true,
        deliveryMethod: true, deliveryRegion: true, deliveryCity: true, deliveryAddress: true, paymentMethod: true,
      },
    }),
    getSiteSettings(),
    getShopSettings(),
  ])
  // Прошлый способ мог быть выключен в настройках — тогда первый доступный
  const enabledDelivery = settings.delivery.filter((m) => m.enabled)
  const enabledPayment = settings.payment.filter((m) => m.enabled)
  const pick = <T extends { id: string }>(list: T[], id: string | null | undefined) =>
    (list.find((m) => m.id === id) ?? list[0])?.id ?? ""

  const defaults = {
    name: lastOrder?.customerName || [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    phone: lastOrder?.customerPhone || user?.phone || "",
    email: user?.email || "",
    telegram: lastOrder?.customerTelegram || user?.telegram || "",
    company: lastOrder?.customerCompany || user?.company || "",
    deliveryMethod: pick(enabledDelivery, lastOrder?.deliveryMethod),
    region: lastOrder?.deliveryRegion || "",
    city: lastOrder?.deliveryCity || "",
    address: lastOrder?.deliveryAddress || "",
    paymentMethod: pick(enabledPayment, lastOrder?.paymentMethod),
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
      <CheckoutForm
        defaults={defaults}
        pickupAddress={[site.address, site.workingHours].filter(Boolean).join(", ")}
        settings={settings}
      />
    </div>
  )
}
