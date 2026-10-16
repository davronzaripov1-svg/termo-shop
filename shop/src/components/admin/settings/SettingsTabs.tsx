"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Bell, CreditCard, Phone, Save, Send, Store, Truck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  saveNotificationSettings,
  saveShopSettings,
  saveSiteSettings,
  sendTestNotification,
} from "@/app/admin/settings/actions"
import type { ShopSettings } from "@/lib/checkout"
import { cn } from "@/lib/utils"

type Site = {
  name: string; description: string; phone: string; phone2: string; email: string
  telegram: string; instagram: string; address: string; workingHours: string
}
type Notifications = { telegramBotToken: string; telegramChatId: string; notifyNewOrder: boolean }

const tabs = [
  { id: "general", label: "Основные", icon: Store },
  { id: "contacts", label: "Контакты", icon: Phone },
  { id: "delivery", label: "Доставка", icon: Truck },
  { id: "payment", label: "Оплата", icon: CreditCard },
  { id: "notifications", label: "Уведомления", icon: Bell },
] as const

const fieldClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm"

export function SettingsTabs({ site: initialSite, shop: initialShop, notifications: initialNotifications }: {
  site: Site
  shop: ShopSettings
  notifications: Notifications
}) {
  const router = useRouter()
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("general")
  const [site, setSite] = useState(initialSite)
  const [shop, setShop] = useState({ ...initialShop, freeShippingFrom: String(initialShop.freeShippingFrom) })
  const [notifications, setNotifications] = useState(initialNotifications)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const run = (action: () => Promise<{ ok: boolean; error?: string; fieldErrors?: Record<string, string> }>, success: string) =>
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.error)
        return
      }
      setErrors({})
      toast.success(success)
      router.refresh()
    })

  const save = () => {
    if (tab === "general" || tab === "contacts") return run(() => saveSiteSettings(site), "Сохранено")
    if (tab === "delivery" || tab === "payment") {
      return run(
        () => saveShopSettings({
          ...shop,
          delivery: shop.delivery.map(({ id, enabled, name, description, price }) => ({ id, enabled, name, description, price })),
          payment: shop.payment.map(({ id, enabled, name, description }) => ({ id, enabled, name, description })),
        }),
        "Сохранено"
      )
    }
    return run(() => saveNotificationSettings(notifications), "Сохранено")
  }

  const siteField = (key: keyof Site) => ({
    value: site[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSite({ ...site, [key]: e.target.value }),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Настройки</h1>
          <p className="text-gray-500">Настройки магазина</p>
        </div>
        <Button onClick={save} disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />
          {isPending ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="lg:w-64 h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id)
                    setErrors({})
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    tab === t.id ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  <t.icon className="h-5 w-5" />
                  {t.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="flex-1 space-y-6">
          {tab === "general" && (
            <Card>
              <CardHeader><CardTitle>Основные</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="Название магазина" error={errors.name}><Input {...siteField("name")} /></Field>
                <Field label="Описание (подвал сайта)" error={errors.description}>
                  <textarea className={fieldClass} rows={3} {...siteField("description")} />
                </Field>
              </CardContent>
            </Card>
          )}

          {tab === "contacts" && (
            <Card>
              <CardHeader><CardTitle>Контакты</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <Field label="Телефон (в шапке сайта)" error={errors.phone}><Input {...siteField("phone")} /></Field>
                <Field label="Доп. телефон" error={errors.phone2}><Input {...siteField("phone2")} placeholder="+998 90 000 00 00" /></Field>
                <Field label="Email" error={errors.email}><Input {...siteField("email")} /></Field>
                <Field label="Telegram" error={errors.telegram}><Input {...siteField("telegram")} placeholder="@username" /></Field>
                <Field label="Instagram" error={errors.instagram}><Input {...siteField("instagram")} placeholder="@username" /></Field>
                <Field label="Режим работы" error={errors.workingHours}><Input {...siteField("workingHours")} /></Field>
                <div className="sm:col-span-2">
                  <Field label="Адрес (для самовывоза)" error={errors.address}><Input {...siteField("address")} /></Field>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "delivery" && (
            <Card>
              <CardHeader><CardTitle>Способы доставки</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {shop.delivery.map((m, i) => {
                  const update = (patch: Partial<typeof m>) =>
                    setShop({ ...shop, delivery: shop.delivery.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
                  return (
                    <div key={m.id} className={cn("p-4 border rounded-lg space-y-3", !m.enabled && "bg-gray-50")}>
                      <label className="flex items-center gap-2 font-medium">
                        <input type="checkbox" checked={m.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
                        Включено
                      </label>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <Field label="Название"><Input value={m.name} onChange={(e) => update({ name: e.target.value })} /></Field>
                        <Field label="Подпись"><Input value={m.description} onChange={(e) => update({ description: e.target.value })} /></Field>
                        <Field label="Цена, сум">
                          <Input inputMode="numeric" value={String(m.price)} onChange={(e) => update({ price: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
                        </Field>
                      </div>
                    </div>
                  )
                })}
                {errors.delivery && <p className="text-sm text-red-600">{errors.delivery}</p>}
                <Field label="Бесплатная доставка от, сум (0 — выключено)" error={errors.freeShippingFrom}>
                  <Input
                    inputMode="numeric"
                    className="max-w-48"
                    value={shop.freeShippingFrom}
                    onChange={(e) => setShop({ ...shop, freeShippingFrom: e.target.value.replace(/\D/g, "") })}
                  />
                </Field>
              </CardContent>
            </Card>
          )}

          {tab === "payment" && (
            <Card>
              <CardHeader><CardTitle>Способы оплаты</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {shop.payment.map((m, i) => {
                  const update = (patch: Partial<typeof m>) =>
                    setShop({ ...shop, payment: shop.payment.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
                  return (
                    <div key={m.id} className={cn("p-4 border rounded-lg space-y-3", !m.enabled && "bg-gray-50")}>
                      <label className="flex items-center gap-2 font-medium">
                        <input type="checkbox" checked={m.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
                        Включено
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Название"><Input value={m.name} onChange={(e) => update({ name: e.target.value })} /></Field>
                        <Field label="Подпись"><Input value={m.description} onChange={(e) => update({ description: e.target.value })} /></Field>
                      </div>
                    </div>
                  )
                })}
                {errors.payment && <p className="text-sm text-red-600">{errors.payment}</p>}
                <Field label="Реквизиты для перевода (видны клиенту на странице заказа)" error={errors.transferDetails}>
                  <textarea
                    className={fieldClass}
                    rows={3}
                    placeholder={"Карта Uzcard: 8600 0000 0000 0000\nПолучатель: ..."}
                    value={shop.transferDetails}
                    onChange={(e) => setShop({ ...shop, transferDetails: e.target.value })}
                  />
                </Field>
                <p className="text-sm text-gray-500">Онлайн-оплата Click и Payme требует договора с платёжной системой и пока не подключена.</p>
              </CardContent>
            </Card>
          )}

          {tab === "notifications" && (
            <Card>
              <CardHeader><CardTitle>Уведомления в Telegram</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <ol className="text-sm text-gray-600 list-decimal ml-5 space-y-1">
                  <li>Создайте бота у @BotFather и скопируйте токен.</li>
                  <li>Добавьте бота в группу менеджеров (или напишите ему в личку).</li>
                  <li>Chat ID группы можно узнать у бота @getidsbot.</li>
                </ol>
                <Field label="Токен бота" error={errors.telegramBotToken}>
                  <Input
                    type="password"
                    autoComplete="off"
                    placeholder="123456:ABC-DEF..."
                    value={notifications.telegramBotToken}
                    onChange={(e) => setNotifications({ ...notifications, telegramBotToken: e.target.value })}
                  />
                </Field>
                <Field label="Chat ID" error={errors.telegramChatId}>
                  <Input
                    placeholder="-1001234567890"
                    value={notifications.telegramChatId}
                    onChange={(e) => setNotifications({ ...notifications, telegramChatId: e.target.value })}
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={notifications.notifyNewOrder}
                    onChange={(e) => setNotifications({ ...notifications, notifyNewOrder: e.target.checked })}
                  />
                  Сообщать о новых заказах
                </label>
                <Button
                  variant="outline"
                  disabled={isPending}
                  onClick={() => run(sendTestNotification, "Тестовое сообщение отправлено")}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Отправить тест
                </Button>
                <p className="text-xs text-gray-500">Перед тестом сохраните настройки.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}
