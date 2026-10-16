// Правила оформления заказа. Без обращений к базе — модуль используется и в браузере, и на сервере.
// Цены, включённость и названия способов редактируются в админке (Настройки), см. lib/settings.ts.

export type DeliveryMethod = {
  id: "courier" | "regions" | "pickup"
  enabled: boolean
  name: string
  description: string
  price: number
  /** нужен адрес доставки */
  needsAddress: boolean
  /** регион фиксирован (курьер по Ташкенту) */
  fixedRegion: string | null
}

export type PaymentMethod = {
  id: "cash" | "card" | "transfer"
  enabled: boolean
  name: string
  description: string
}

export type ShopSettings = {
  /** от этой суммы (после скидки) доставка бесплатная; 0 — никогда */
  freeShippingFrom: number
  delivery: DeliveryMethod[]
  payment: PaymentMethod[]
  /** реквизиты для перевода — показываются клиенту после заказа */
  transferDetails: string
}

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  freeShippingFrom: 500_000,
  delivery: [
    { id: "courier", enabled: true, name: "Курьер по Ташкенту", description: "1–2 дня", price: 25_000, needsAddress: true, fixedRegion: "г. Ташкент" },
    { id: "regions", enabled: true, name: "Доставка по регионам", description: "По всему Узбекистану, 2–5 дней", price: 50_000, needsAddress: true, fixedRegion: null },
    { id: "pickup", enabled: true, name: "Самовывоз", description: "Из нашего офиса", price: 0, needsAddress: false, fixedRegion: null },
  ],
  payment: [
    { id: "cash", enabled: true, name: "Наличными при получении", description: "" },
    { id: "card", enabled: true, name: "Картой при получении", description: "Uzcard, Humo, Visa, Mastercard" },
    { id: "transfer", enabled: true, name: "Перевод на карту", description: "Реквизиты пришлёт менеджер" },
  ],
  transferDetails: "",
}

export function getDeliveryMethod(settings: ShopSettings, id: string | null | undefined) {
  return settings.delivery.find((m) => m.id === id)
}

export function getPaymentMethod(settings: ShopSettings, id: string | null | undefined) {
  return settings.payment.find((m) => m.id === id)
}

/** Стоимость доставки. От settings.freeShippingFrom (сумма после скидки) — бесплатно. */
export function calcShipping(settings: ShopSettings, methodId: string, goodsTotal: number): number {
  const method = getDeliveryMethod(settings, methodId)
  if (!method) return 0
  if (settings.freeShippingFrom > 0 && goodsTotal >= settings.freeShippingFrom) return 0
  return method.price
}

export const REGIONS = [
  "г. Ташкент",
  "Ташкентская область",
  "Андижанская область",
  "Бухарская область",
  "Джизакская область",
  "Кашкадарьинская область",
  "Навоийская область",
  "Наманганская область",
  "Самаркандская область",
  "Сурхандарьинская область",
  "Сырдарьинская область",
  "Ферганская область",
  "Хорезмская область",
  "Республика Каракалпакстан",
]



export type PromoTerms = {
  discountType: "PERCENT" | "FIXED"
  discountValue: number
  maxDiscount: number | null
}

/** Скидка по промокоду, не больше суммы товаров. */
export function calcPromoDiscount(promo: PromoTerms, subtotal: number): number {
  let discount = promo.discountType === "PERCENT"
    ? Math.round((subtotal * promo.discountValue) / 100)
    : promo.discountValue
  if (promo.maxDiscount !== null) discount = Math.min(discount, promo.maxDiscount)
  return Math.max(0, Math.min(discount, subtotal))
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  PROCESSING: "В обработке",
  PICKING: "Собирается",
  READY: "Готов к выдаче",
  SHIPPING: "В доставке",
  DELIVERED: "Доставлен",
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
}
