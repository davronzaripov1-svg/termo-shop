import { prisma } from "./prisma"
import { getDeliveryMethod, getPaymentMethod } from "./checkout"
import { getNotificationSettings, getShopSettings } from "./settings"

// Адрес API можно подменить (тесты, прокси)
const TELEGRAM_API = process.env.TELEGRAM_API_URL || "https://api.telegram.org"

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const sum = (n: number) => `${n.toLocaleString("ru-RU")} сум`

export async function sendTelegram(token: string, chatId: string, html: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
    })
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string }
    if (!res.ok || !json.ok) return { ok: false, error: json.description || `HTTP ${res.status}` }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

/** Сообщение о новом заказе в Telegram. Ошибки только логируем — заказ уже оформлен. */
export async function notifyNewOrder(orderId: string) {
  const settings = await getNotificationSettings()
  if (!settings.notifyNewOrder || !settings.telegramBotToken || !settings.telegramChatId) return

  const [order, shop] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId }, include: { items: true } }),
    getShopSettings(),
  ])
  if (!order) return

  const address = [order.deliveryRegion, order.deliveryCity, order.deliveryAddress].filter(Boolean).join(", ")
  const lines = [
    `🛒 <b>Новый заказ ${escape(order.orderNumber)}</b>`,
    "",
    `👤 ${escape(order.customerName)}, ${escape(order.customerPhone)}`,
    order.customerTelegram && `✈️ ${escape(order.customerTelegram)}`,
    order.customerCompany && `🏢 ${escape(order.customerCompany)}`,
    "",
    ...order.items.map((i) => `• ${escape(i.name)} × ${i.quantity} = ${sum(Number(i.total))}`),
    "",
    Number(order.discount) > 0 && `Скидка: −${sum(Number(order.discount))}`,
    `Доставка: ${escape(getDeliveryMethod(shop, order.deliveryMethod)?.name ?? order.deliveryMethod ?? "—")}${Number(order.shipping) > 0 ? ` (${sum(Number(order.shipping))})` : ""}`,
    address ? `📍 ${escape(address)}` : null,
    `Оплата: ${escape(getPaymentMethod(shop, order.paymentMethod)?.name ?? order.paymentMethod ?? "—")}`,
    `<b>Итого: ${sum(Number(order.total))}</b>`,
    order.comment && `\n💬 ${escape(order.comment)}`,
  ].filter((l): l is string => typeof l === "string") // "" — пустая строка-разделитель, остаётся

  const result = await sendTelegram(settings.telegramBotToken, settings.telegramChatId, lines.join("\n"))
  if (!result.ok) console.error(`Telegram notification for ${order.orderNumber} failed: ${result.error}`)
}
