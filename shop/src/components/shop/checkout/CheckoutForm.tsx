"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ProductImage } from "@/components/shop/ProductImage"
import { checkPromocode, placeOrder, type PromoResult } from "@/app/actions/checkout"
import {
  REGIONS,
  calcPromoDiscount,
  calcShipping,
  getDeliveryMethod,
  type ShopSettings,
} from "@/lib/checkout"
import { cn, formatSum } from "@/lib/utils"
import { useCartHydrated, useCartStore } from "@/store/cart"

type FormValues = {
  name: string
  phone: string
  email: string
  telegram: string
  company: string
  deliveryMethod: string
  region: string
  city: string
  address: string
  paymentMethod: string
  comment: string
}

type AppliedPromo = Extract<PromoResult, { ok: true }>

const fieldClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm"

export function CheckoutForm({
  defaults,
  pickupAddress,
  settings,
}: {
  defaults: Omit<FormValues, "comment">
  pickupAddress: string
  settings: ShopSettings
}) {
  const deliveryMethods = settings.delivery.filter((m) => m.enabled)
  const paymentMethods = settings.payment.filter((m) => m.enabled)
  const router = useRouter()
  const hydrated = useCartHydrated()
  const { items, clearCart, applyFixes } = useCartStore()

  const [values, setValues] = useState<FormValues>({ ...defaults, comment: "" })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [promoInput, setPromoInput] = useState("")
  const [promo, setPromo] = useState<AppliedPromo | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [isCheckingPromo, startPromoTransition] = useTransition()

  const set = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    setFieldErrors((errors) => {
      const next = { ...errors }
      delete next[key]
      return next
    })
  }

  const delivery = getDeliveryMethod(settings, values.deliveryMethod) ?? deliveryMethods[0]
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = promo ? calcPromoDiscount(promo, subtotal) : 0
  const shipping = calcShipping(settings, delivery.id, subtotal - discount)
  const total = subtotal - discount + shipping

  if (!hydrated) {
    return <p className="text-center text-gray-400 py-16">Загрузка корзины...</p>
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        {/* Корзина могла опустеть из-за ответа сервера — объясняем почему */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        <ShoppingBag className="h-20 w-20 mx-auto text-gray-300 mb-6" />
        <p className="text-xl font-semibold mb-2">Корзина пуста</p>
        <p className="text-gray-500 mb-6">Добавьте товары, чтобы оформить заказ</p>
        <Button asChild>
          <Link href="/catalog">Перейти в каталог</Link>
        </Button>
      </div>
    )
  }

  const applyPromo = () => {
    setPromoError(null)
    startPromoTransition(async () => {
      const result = await checkPromocode(promoInput, subtotal)
      if (result.ok) {
        setPromo(result)
        setPromoInput("")
      } else {
        setPromoError(result.error)
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await placeOrder({
        ...values,
        deliveryMethod: delivery.id,
        region: delivery.fixedRegion ?? values.region,
        promocode: promo?.code,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
        })),
      })

      if (result.ok) {
        clearCart()
        router.push(`/account/orders/${result.orderNumber}?new=1`)
        return
      }
      setError(result.error)
      setFieldErrors(result.fieldErrors ?? {})
      if (result.cartFixes?.length) applyFixes(result.cartFixes)
      if (result.error.startsWith("Промокод")) setPromo(null)
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8" noValidate>
      <div className="flex-1 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Контактные данные</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <Field label="Имя и фамилия" error={fieldErrors.name} required>
              <Input value={values.name} onChange={set("name")} autoComplete="name" />
            </Field>
            <Field label="Телефон" error={fieldErrors.phone} required>
              <Input type="tel" value={values.phone} onChange={set("phone")} autoComplete="tel" placeholder="+998 90 123 45 67" />
            </Field>
            <Field label="Email" error={fieldErrors.email}>
              <Input type="email" value={values.email} onChange={set("email")} autoComplete="email" />
            </Field>
            <Field label="Telegram" error={fieldErrors.telegram}>
              <Input value={values.telegram} onChange={set("telegram")} placeholder="@username" />
            </Field>
            <Field label="Компания (для юр. лиц)" error={fieldErrors.company} className="sm:col-span-2">
              <Input value={values.company} onChange={set("company")} autoComplete="organization" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Доставка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              {deliveryMethods.map((m) => (
                <OptionCard
                  key={m.id}
                  name="deliveryMethod"
                  value={m.id}
                  checked={values.deliveryMethod === m.id}
                  onChange={set("deliveryMethod")}
                  title={m.name}
                  description={m.description}
                  aside={calcShipping(settings, m.id, subtotal - discount) === 0 ? "Бесплатно" : formatSum(m.price)}
                />
              ))}
            </div>
            {fieldErrors.deliveryMethod && <p className="text-sm text-red-600">{fieldErrors.deliveryMethod}</p>}

            {delivery.needsAddress ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Регион" error={fieldErrors.region} required>
                  {delivery.fixedRegion ? (
                    <Input value={delivery.fixedRegion} disabled />
                  ) : (
                    <select value={values.region} onChange={set("region")} className={fieldClass}>
                      <option value="">Выберите регион</option>
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field label={delivery.fixedRegion ? "Район" : "Город / район"} error={fieldErrors.city} required>
                  <Input value={values.city} onChange={set("city")} autoComplete="address-level2" />
                </Field>
                <Field label="Адрес" error={fieldErrors.address} required className="sm:col-span-2">
                  <textarea
                    value={values.address}
                    onChange={set("address")}
                    rows={2}
                    placeholder="Улица, дом, квартира, ориентир"
                    autoComplete="street-address"
                    className={fieldClass}
                  />
                </Field>
              </div>
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
                Забрать заказ можно по адресу: <span className="font-medium">{pickupAddress || "уточнит менеджер"}</span>.
                Мы позвоним, когда заказ будет готов.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Оплата</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-3">
            {paymentMethods.map((m) => (
              <OptionCard
                key={m.id}
                name="paymentMethod"
                value={m.id}
                checked={values.paymentMethod === m.id}
                onChange={set("paymentMethod")}
                title={m.name}
                description={m.description || undefined}
              />
            ))}
            {fieldErrors.paymentMethod && <p className="text-sm text-red-600">{fieldErrors.paymentMethod}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Комментарий к заказу</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={values.comment}
              onChange={set("comment")}
              rows={3}
              placeholder="Удобное время доставки, пожелания"
              className={fieldClass}
            />
          </CardContent>
        </Card>
      </div>

      {/* Итог */}
      <div className="w-full lg:w-96">
        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Ваш заказ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 max-h-72 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 text-sm">
                  <ProductImage src={item.image} alt={item.name} className="h-12 w-12 rounded-md flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-2">{item.name}</p>
                    {item.variantName && <p className="text-gray-500">{item.variantName}</p>}
                    <p className="text-gray-500">{item.quantity} × {formatSum(item.price)}</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">{formatSum(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <Link href="/cart" className="text-sm text-primary hover:underline">Изменить корзину</Link>

            <hr />

            {promo ? (
              <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
                <span>
                  Промокод <span className="font-semibold">{promo.code}</span>
                  {promo.discountType === "PERCENT" && ` (−${promo.discountValue}%)`}
                </span>
                <button type="button" onClick={() => setPromo(null)} aria-label="Убрать промокод" className="text-gray-500 hover:text-gray-900">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Промокод"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        applyPromo()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={applyPromo} disabled={!promoInput.trim() || isCheckingPromo}>
                    {isCheckingPromo ? "..." : "Применить"}
                  </Button>
                </div>
                {promoError && <p className="mt-1 text-sm text-red-600">{promoError}</p>}
              </div>
            )}

            <hr />

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Товары ({items.reduce((n, i) => n + i.quantity, 0)} шт.)</dt>
                <dd>{formatSum(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt>Скидка</dt>
                  <dd>−{formatSum(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Доставка</dt>
                <dd className={shipping === 0 ? "text-green-600" : undefined}>
                  {shipping === 0 ? "Бесплатно" : formatSum(shipping)}
                </dd>
              </div>
              {settings.freeShippingFrom > 0 && delivery.price > 0 && shipping > 0 && (
                <p className="text-xs text-gray-500">
                  Бесплатно от {formatSum(settings.freeShippingFrom)} — добавьте ещё на {formatSum(settings.freeShippingFrom - (subtotal - discount))}
                </p>
              )}
            </dl>

            <hr />

            <div className="flex justify-between text-lg font-bold">
              <span>К оплате</span>
              <span>{formatSum(total)}</span>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              {isPending ? "Оформляем..." : "Подтвердить заказ"}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Менеджер свяжется с вами для подтверждения заказа
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  required,
  className,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}

function OptionCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  aside,
}: {
  name: string
  value: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  title: string
  description?: string
  aside?: string
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col rounded-lg border p-3 transition-colors",
        checked ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-gray-400"
      )}
    >
      <span className="flex items-start gap-2">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="mt-1" />
        <span className="font-medium text-sm">{title}</span>
      </span>
      {description && <span className="text-xs text-gray-500 mt-1 ml-5">{description}</span>}
      {aside && <span className="text-sm font-semibold mt-2 ml-5">{aside}</span>}
    </label>
  )
}
