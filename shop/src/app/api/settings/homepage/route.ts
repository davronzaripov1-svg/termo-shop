import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const HOMEPAGE_SETTINGS_KEY = "homepage_settings"

// Default homepage data
const defaultSettings = {
  hero: {
    badge: "Новая коллекция 2024",
    titleLine1: "Termo",
    titleLine2: "stik",
    subtitle: "Профессиональные материалы для термопереноса и печати. Создавайте уникальные изделия.",
    buttonPrimary: "Каталог",
    buttonPrimaryLink: "/catalog",
    buttonSecondary: "Как это работает",
    buttonSecondaryLink: "#video",
    stats: [
      { value: "500+", label: "Товаров" },
      { value: "1000+", label: "Клиентов" },
      { value: "50+", label: "Городов" },
      { value: "24/7", label: "Поддержка" },
    ],
    floatingBadge: "Скидки до 30%",
    cards: [
      { icon: "🔥", title: "Термотрансферы", subtitle: "Премиум качество для профессионалов", price: "от 15 000 сум" },
      { icon: "✨", title: "Винил", subtitle: "200+ видов" },
      { icon: "🎨", title: "DTF печать", subtitle: "Всё для печати" },
    ],
  },
  marquee: {
    items: [
      { icon: "zap", text: "Бесплатная доставка от 500 000 сум" },
      { icon: "star", text: "Гарантия качества" },
      { icon: "package", text: "Быстрая отправка" },
    ],
    speed: 30,
    backgroundColor: "#a3e635",
  },
  categories: {
    title: "Категории товаров",
    badge: "Каталог",
    items: [
      { name: "Термотрансферы", slug: "termotransfers", count: 150, color: "from-orange-500 to-red-500", icon: "🔥", size: "large" },
      { name: "Виниловые наклейки", slug: "vinyl", count: 200, color: "from-purple-500 to-pink-500", icon: "✨", size: "medium" },
      { name: "DTF печать", slug: "dtf", count: 180, color: "from-blue-500 to-cyan-500", icon: "🎨", size: "medium" },
      { name: "UV DTF", slug: "uv-dtf", count: 120, color: "from-emerald-500 to-teal-500", icon: "💎", size: "small" },
      { name: "Расходники", slug: "materials", count: 85, color: "from-amber-500 to-orange-500", icon: "📦", size: "small" },
      { name: "Оборудование", slug: "equipment", count: 45, color: "from-slate-600 to-slate-800", icon: "⚙️", size: "small" },
    ],
  },
  products: {
    title: "Популярные товары",
    badge: "Топ продаж",
    showCount: 6,
    autoSelect: true,
    manualProducts: [],
  },
  features: {
    title: "Преимущества работы с нами",
    badge: "Почему мы",
    items: [
      { icon: "truck", title: "Быстрая доставка", description: "По всему Узбекистану за 1-3 дня" },
      { icon: "shield", title: "Гарантия качества", description: "100% оригинальная продукция" },
      { icon: "clock", title: "Поддержка 24/7", description: "Всегда на связи в Telegram" },
      { icon: "package", title: "Большой выбор", description: "Более 500 товаров в наличии" },
    ],
  },
  cta: {
    title: "Готовы сделать заказ?",
    subtitle: "Свяжитесь с нами любым удобным способом. Мы поможем подобрать товары под ваши задачи.",
    buttonPhone: "Позвонить",
    phone: "+998901234567",
    buttonTelegram: "Telegram",
    telegram: "termostik",
    gradientFrom: "#a3e635",
    gradientTo: "#bef264",
  },
  sections: [
    { id: "hero", name: "Hero секция", isVisible: true },
    { id: "marquee", name: "Бегущая строка", isVisible: true },
    { id: "categories", name: "Категории", isVisible: true },
    { id: "products", name: "Популярные товары", isVisible: true },
    { id: "features", name: "Преимущества", isVisible: true },
    { id: "cta", name: "CTA блок", isVisible: true },
  ],
}

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: HOMEPAGE_SETTINGS_KEY },
    })

    if (!setting) {
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(setting.value)
  } catch (error) {
    console.error("Error fetching homepage settings:", error)
    return NextResponse.json(defaultSettings)
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const setting = await prisma.setting.upsert({
      where: { key: HOMEPAGE_SETTINGS_KEY },
      update: { value: data },
      create: { key: HOMEPAGE_SETTINGS_KEY, value: data },
    })

    return NextResponse.json({ success: true, data: setting.value })
  } catch (error) {
    console.error("Error saving homepage settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    )
  }
}
