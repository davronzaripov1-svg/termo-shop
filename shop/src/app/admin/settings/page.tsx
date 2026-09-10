"use client"

import { useState } from "react"
import {
  Save,
  Store,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Palette,
  FileText,
  Upload,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)

  const tabs = [
    { id: "general", label: "Основные", icon: Store },
    { id: "contacts", label: "Контакты", icon: Phone },
    { id: "delivery", label: "Доставка", icon: Truck },
    { id: "payment", label: "Оплата", icon: CreditCard },
    { id: "notifications", label: "Уведомления", icon: Bell },
    { id: "security", label: "Безопасность", icon: Shield },
  ]

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Настройки</h1>
          <p className="text-gray-500">Настройки магазина и системы</p>
        </div>
        <Button
          className="bg-primary text-black hover:bg-primary/90"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "general" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Информация о магазине</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Название магазина
                      </label>
                      <Input defaultValue="Termo stik" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Слоган
                      </label>
                      <Input defaultValue="Термотрансферы и виниловые наклейки" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Описание
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                      rows={3}
                      defaultValue="Термотрансферы, виниловые наклейки, DTF и UV DTF печать. Быстрая доставка по всему Узбекистану."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Логотип и брендинг</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Логотип</label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-2">PNG, JPG до 2MB</p>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Загрузить
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Favicon</label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-2">ICO, PNG 32x32</p>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Загрузить
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Цветовая схема</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Основной цвет</label>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary border" />
                        <Input defaultValue="#a3e635" className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Фон</label>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-white border" />
                        <Input defaultValue="#ffffff" className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Текст</label>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gray-900 border" />
                        <Input defaultValue="#171717" className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Акцент</label>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary border" />
                        <Input defaultValue="#a3e635" className="flex-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "contacts" && (
            <Card>
              <CardHeader>
                <CardTitle>Контактная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Телефон
                    </label>
                    <Input defaultValue="+998 90 123 45 67" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Дополнительный телефон
                    </label>
                    <Input placeholder="+998 90 000 00 00" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email
                    </label>
                    <Input defaultValue="info@termostik.uz" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Telegram
                    </label>
                    <Input defaultValue="@termostik" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Адрес
                  </label>
                  <Input defaultValue="г. Ташкент, ул. Примерная, 123" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Режим работы</label>
                    <Input defaultValue="Пн-Сб: 9:00 - 18:00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Instagram</label>
                    <Input defaultValue="@termostik.uz" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "delivery" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Способы доставки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Truck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Курьерская доставка</h4>
                          <p className="text-sm text-gray-500">По городу Ташкент</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input className="w-32" defaultValue="25000" />
                        <span className="text-sm text-gray-500">сум</span>
                        <Badge>Активно</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Truck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Доставка по регионам</h4>
                          <p className="text-sm text-gray-500">По всему Узбекистану</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input className="w-32" defaultValue="50000" />
                        <span className="text-sm text-gray-500">сум</span>
                        <Badge>Активно</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MapPin className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Самовывоз</h4>
                          <p className="text-sm text-gray-500">Из нашего офиса</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input className="w-32" defaultValue="0" />
                        <span className="text-sm text-gray-500">сум</span>
                        <Badge>Активно</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Бесплатная доставка</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Минимальная сумма заказа
                      </label>
                      <div className="flex items-center gap-2">
                        <Input className="w-40" defaultValue="500000" />
                        <span className="text-sm text-gray-500">сум</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>Способы оплаты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Наличные</h4>
                        <p className="text-sm text-gray-500">При получении</p>
                      </div>
                    </div>
                    <Badge>Активно</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Банковская карта</h4>
                        <p className="text-sm text-gray-500">Uzcard, Humo, Visa, Mastercard</p>
                      </div>
                    </div>
                    <Badge>Активно</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Перевод на карту</h4>
                        <p className="text-sm text-gray-500">Uzcard/Humo</p>
                      </div>
                    </div>
                    <Badge>Активно</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-500">Click</h4>
                        <p className="text-sm text-gray-400">Онлайн оплата</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Отключено</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-500">Payme</h4>
                        <p className="text-sm text-gray-400">Онлайн оплата</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Отключено</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email уведомления</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Новый заказ", desc: "При оформлении нового заказа", enabled: true },
                      { label: "Оплата получена", desc: "При успешной оплате", enabled: true },
                      { label: "Отмена заказа", desc: "При отмене заказа", enabled: true },
                      { label: "Низкий остаток", desc: "Когда товар заканчивается", enabled: false },
                      { label: "Новый отзыв", desc: "При новом отзыве о товаре", enabled: false },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked={item.enabled}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Telegram уведомления</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Bot Token</label>
                      <Input type="password" placeholder="Введите токен бота" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Chat ID</label>
                      <Input placeholder="Введите ID чата" />
                    </div>
                    <Button variant="outline">Проверить подключение</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Безопасность</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Двухфакторная аутентификация", desc: "Дополнительная защита аккаунта", enabled: false },
                      { label: "Уведомления о входе", desc: "Email при входе с нового устройства", enabled: true },
                      { label: "Автовыход", desc: "Автоматический выход через 30 минут", enabled: true },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked={item.enabled}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Сменить пароль</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Текущий пароль</label>
                    <Input type="password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Новый пароль</label>
                    <Input type="password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Подтвердите пароль</label>
                    <Input type="password" />
                  </div>
                  <Button>Сменить пароль</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
