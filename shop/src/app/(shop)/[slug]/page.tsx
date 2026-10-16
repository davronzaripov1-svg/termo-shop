import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { renderContent } from "@/lib/content"
import { getPage } from "@/lib/pages"
import { getShopSettings, getSiteSettings, telHref, telegramHref } from "@/lib/settings"
import { formatSum } from "@/lib/utils"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug)
  if (!page) return {}
  return { title: page.metaTitle || page.title, description: page.metaDescription || undefined }
}

// Текстовые страницы: /about, /delivery, /contacts, /faq и любые созданные в админке
export default async function ContentPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      {slug === "contacts" && <ContactsBlock />}
      <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderContent(page.content) }} />
      {slug === "delivery" && <DeliveryBlock />}
    </div>
  )
}

/** Контакты всегда из настроек — не нужно править в двух местах */
async function ContactsBlock() {
  const site = await getSiteSettings()
  const telegram = telegramHref(site.telegram)
  const items = [
    site.phone && { icon: Phone, label: "Телефон", value: site.phone, href: telHref(site.phone) },
    site.phone2 && { icon: Phone, label: "Телефон", value: site.phone2, href: telHref(site.phone2) },
    telegram && { icon: Send, label: "Telegram", value: site.telegram, href: telegram },
    site.email && { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    site.address && { icon: MapPin, label: "Адрес", value: site.address },
    site.workingHours && { icon: Clock, label: "Режим работы", value: site.workingHours },
  ].filter((x): x is { icon: typeof Phone; label: string; value: string; href?: string } => !!x)

  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-8">
      {items.map((item, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex gap-3">
            <item.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="font-medium hover:text-primary" target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {item.value}
                </a>
              ) : (
                <p className="font-medium">{item.value}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Способы и цены доставки/оплаты — из настроек магазина */
async function DeliveryBlock() {
  const shop = await getShopSettings()
  const delivery = shop.delivery.filter((m) => m.enabled)
  const payment = shop.payment.filter((m) => m.enabled)

  return (
    <div className="mt-8 space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-3">Способы доставки</h2>
        <div className="divide-y border rounded-xl bg-white">
          {delivery.map((m) => (
            <div key={m.id} className="flex justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium">{m.name}</p>
                {m.description && <p className="text-sm text-gray-500">{m.description}</p>}
              </div>
              <p className="font-semibold whitespace-nowrap">{m.price === 0 ? "Бесплатно" : formatSum(m.price)}</p>
            </div>
          ))}
        </div>
        {shop.freeShippingFrom > 0 && (
          <p className="mt-3 text-sm text-green-700">Доставка бесплатно при заказе от {formatSum(shop.freeShippingFrom)}.</p>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-3">Способы оплаты</h2>
        <ul className="space-y-2">
          {payment.map((m) => (
            <li key={m.id} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>
                <span className="font-medium">{m.name}</span>
                {m.description && <span className="text-gray-500"> — {m.description}</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
