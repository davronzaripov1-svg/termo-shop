"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { adminAction, logActivity, zodFieldErrors, type ActionResult } from "@/lib/admin"
import { SETTING_KEYS, TOKEN_MASK, getNotificationSettings } from "@/lib/settings"
import { sendTelegram } from "@/lib/notify"

const text = (max: number) => z.string().trim().max(max)

const siteSchema = z.object({
  name: text(100).min(1, "Укажите название"),
  description: text(500),
  phone: text(30),
  phone2: text(30),
  email: z.union([z.literal(""), z.email("Неверный email")]),
  telegram: text(100),
  instagram: text(100),
  address: text(300),
  workingHours: text(100),
})

const shopSchema = z.object({
  freeShippingFrom: z.coerce.number().int().min(0, "Не меньше 0"),
  delivery: z.array(z.object({
    id: z.enum(["courier", "regions", "pickup"]),
    enabled: z.boolean(),
    name: text(100).min(1, "Название"),
    description: text(200),
    price: z.coerce.number().int().min(0, "Не меньше 0"),
  })),
  payment: z.array(z.object({
    id: z.enum(["cash", "card", "transfer"]),
    enabled: z.boolean(),
    name: text(100).min(1, "Название"),
    description: text(200),
  })),
  transferDetails: text(1000),
})
  .refine((d) => d.delivery.some((m) => m.enabled), { path: ["delivery"], message: "Включите хотя бы один способ доставки" })
  .refine((d) => d.payment.some((m) => m.enabled), { path: ["payment"], message: "Включите хотя бы один способ оплаты" })

const notificationSchema = z.object({
  telegramBotToken: text(200),
  telegramChatId: text(100),
  notifyNewOrder: z.boolean(),
})

async function save(key: string, value: object) {
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
}

export async function saveSiteSettings(input: z.input<typeof siteSchema>): Promise<ActionResult> {
  return adminAction("settings", async (staff) => {
    const parsed = siteSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: "Проверьте поля", fieldErrors: zodFieldErrors(parsed.error.issues) }
    await save(SETTING_KEYS.site, parsed.data)
    await logActivity(staff.id, "settings.site", "Setting", SETTING_KEYS.site)
    revalidatePath("/", "layout")
    return { ok: true }
  })
}

export async function saveShopSettings(input: z.input<typeof shopSchema>): Promise<ActionResult> {
  return adminAction("settings", async (staff) => {
    const parsed = shopSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: "Проверьте поля", fieldErrors: zodFieldErrors(parsed.error.issues) }
    await save(SETTING_KEYS.shop, parsed.data)
    await logActivity(staff.id, "settings.shop", "Setting", SETTING_KEYS.shop, { newData: parsed.data })
    revalidatePath("/", "layout")
    return { ok: true }
  })
}

export async function saveNotificationSettings(input: z.input<typeof notificationSchema>): Promise<ActionResult> {
  return adminAction("settings", async (staff) => {
    const parsed = notificationSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: "Проверьте поля", fieldErrors: zodFieldErrors(parsed.error.issues) }
    const current = await getNotificationSettings()
    const data = {
      ...parsed.data,
      telegramBotToken: parsed.data.telegramBotToken === TOKEN_MASK ? current.telegramBotToken : parsed.data.telegramBotToken,
    }
    await save(SETTING_KEYS.notifications, data)
    await logActivity(staff.id, "settings.notifications", "Setting", SETTING_KEYS.notifications)
    revalidatePath("/admin/settings")
    return { ok: true }
  })
}

export async function sendTestNotification(): Promise<ActionResult> {
  return adminAction("settings", async (staff) => {
    const s = await getNotificationSettings()
    if (!s.telegramBotToken || !s.telegramChatId) {
      return { ok: false, error: "Сначала сохраните токен бота и Chat ID" }
    }
    const result = await sendTelegram(s.telegramBotToken, s.telegramChatId, `✅ Тестовое сообщение из админки магазина (${staff.name})`)
    return result.ok ? { ok: true } : { ok: false, error: `Telegram ответил: ${result.error}` }
  })
}
