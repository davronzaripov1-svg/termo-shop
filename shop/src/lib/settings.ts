import { cache } from "react"
import { prisma } from "./prisma"
import { DEFAULT_SHOP_SETTINGS, type ShopSettings } from "./checkout"

// Настройки хранятся в таблице Setting (ключ -> JSON). Сохранённое накладывается на значения по умолчанию,
// поэтому новые поля появляются сами, даже если в базе старая версия настроек.

export type SiteSettings = {
  name: string
  description: string
  phone: string
  phone2: string
  email: string
  telegram: string
  instagram: string
  address: string
  workingHours: string
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  name: "Termo stik",
  description: "Термотрансферы, виниловые наклейки, DTF и UV DTF печать. Быстрая доставка по всему Узбекистану.",
  phone: "+998 90 123 45 67",
  phone2: "",
  email: "info@termostik.uz",
  telegram: "@termostik",
  instagram: "",
  address: "г. Ташкент, ул. Примерная, 123",
  workingHours: "Пн-Сб: 9:00 - 18:00",
}

export type NotificationSettings = {
  telegramBotToken: string
  telegramChatId: string
  notifyNewOrder: boolean
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  telegramBotToken: "",
  telegramChatId: "",
  notifyNewOrder: true,
}

/** Токен бота не отдаём в браузер; пришла эта маска — значит токен не меняли */
export const TOKEN_MASK = "••••••••"

export const SETTING_KEYS = { site: "site", shop: "shop", notifications: "notifications" } as const

async function read<T extends object>(key: string, defaults: T): Promise<T> {
  const row = await prisma.setting.findUnique({ where: { key } })
  const value = row?.value
  return value && typeof value === "object" && !Array.isArray(value) ? { ...defaults, ...(value as Partial<T>) } : defaults
}

export const getSiteSettings = cache(() => read(SETTING_KEYS.site, DEFAULT_SITE_SETTINGS))

export const getNotificationSettings = () => read(SETTING_KEYS.notifications, DEFAULT_NOTIFICATION_SETTINGS)

export const getShopSettings = cache(async (): Promise<ShopSettings> => {
  const saved = await read<Partial<ShopSettings>>(SETTING_KEYS.shop, {})
  // Способы доставки/оплаты: порядок и набор — из кода, цены и включённость — из базы
  return {
    freeShippingFrom: saved.freeShippingFrom ?? DEFAULT_SHOP_SETTINGS.freeShippingFrom,
    delivery: DEFAULT_SHOP_SETTINGS.delivery.map((d) => ({ ...d, ...editable(saved.delivery?.find((x) => x.id === d.id)) })),
    payment: DEFAULT_SHOP_SETTINGS.payment.map((p) => ({ ...p, ...editable(saved.payment?.find((x) => x.id === p.id)) })),
    transferDetails: saved.transferDetails ?? DEFAULT_SHOP_SETTINGS.transferDetails,
  }
})

/** Из базы берём только то, что редактируется в админке */
function editable(saved: { enabled?: boolean; name?: string; description?: string; price?: number } | undefined) {
  if (!saved) return {}
  const { enabled, name, description, price } = saved
  return Object.fromEntries(Object.entries({ enabled, name, description, price }).filter(([, v]) => v !== undefined))
}

/** "+998 90 123 45 67" -> "tel:+998901234567" */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`
}

/** "@termostik" или ссылка -> https://t.me/termostik */
export function telegramHref(value: string) {
  const name = value.trim().replace(/^https?:\/\/t\.me\//, "").replace(/^@/, "")
  return name ? `https://t.me/${name}` : ""
}
