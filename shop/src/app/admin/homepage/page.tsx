"use client"

import { useState } from "react"
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Palette,
  Type,
  Link as LinkIcon,
  Sparkles,
  Upload,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Section = {
  id: string
  name: string
  isVisible: boolean
  isExpanded: boolean
}

export default function HomepageManagementPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("hero")

  const [sections, setSections] = useState<Section[]>([
    { id: "hero", name: "Hero секция", isVisible: true, isExpanded: true },
    { id: "marquee", name: "Бегущая строка", isVisible: true, isExpanded: false },
    { id: "categories", name: "Категории", isVisible: true, isExpanded: false },
    { id: "products", name: "Популярные товары", isVisible: true, isExpanded: false },
    { id: "features", name: "Преимущества", isVisible: true, isExpanded: false },
    { id: "cta", name: "CTA блок", isVisible: true, isExpanded: false },
  ])

  // Hero Section State
  const [heroData, setHeroData] = useState({
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
  })

  // Marquee State
  const [marqueeData, setMarqueeData] = useState({
    items: [
      { icon: "zap", text: "Бесплатная доставка от 500 000 сум" },
      { icon: "star", text: "Гарантия качества" },
      { icon: "package", text: "Быстрая отправка" },
    ],
    speed: 30,
    backgroundColor: "#a3e635",
  })

  // Categories State
  const [categoriesData, setCategoriesData] = useState({
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
  })

  // Featured Products State
  const [productsData, setProductsData] = useState({
    title: "Популярные товары",
    badge: "Топ продаж",
    showCount: 6,
    autoSelect: true, // Automatically select top products or manual
    manualProducts: ["1", "2", "3", "4", "5", "6"],
  })

  // Features State
  const [featuresData, setFeaturesData] = useState({
    title: "Преимущества работы с нами",
    badge: "Почему мы",
    items: [
      { icon: "truck", title: "Быстрая доставка", description: "По всему Узбекистану за 1-3 дня" },
      { icon: "shield", title: "Гарантия качества", description: "100% оригинальная продукция" },
      { icon: "clock", title: "Поддержка 24/7", description: "Всегда на связи в Telegram" },
      { icon: "package", title: "Большой выбор", description: "Более 500 товаров в наличии" },
    ],
  })

  // CTA State
  const [ctaData, setCtaData] = useState({
    title: "Готовы сделать заказ?",
    subtitle: "Свяжитесь с нами любым удобным способом. Мы поможем подобрать товары под ваши задачи.",
    buttonPhone: "Позвонить",
    phone: "+998901234567",
    buttonTelegram: "Telegram",
    telegram: "termostik",
    gradientFrom: "#a3e635",
    gradientTo: "#bef264",
  })

  const handleSave = () => {
    setIsSaving(true)
    // Here you would save to database/API
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const toggleSection = (id: string) => {
    setSections(sections.map(s =>
      s.id === id ? { ...s, isExpanded: !s.isExpanded } : s
    ))
  }

  const toggleVisibility = (id: string) => {
    setSections(sections.map(s =>
      s.id === id ? { ...s, isVisible: !s.isVisible } : s
    ))
  }

  const tabs = [
    { id: "hero", label: "Hero" },
    { id: "marquee", label: "Бегущая строка" },
    { id: "categories", label: "Категории" },
    { id: "products", label: "Товары" },
    { id: "features", label: "Преимущества" },
    { id: "cta", label: "CTA" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Управление главной страницей</h1>
          <p className="text-gray-500">Настройте содержимое и внешний вид главной страницы</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Предпросмотр
          </Button>
          <Button variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Сбросить
          </Button>
          <Button
            className="bg-primary text-black hover:bg-primary/90"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>

      {/* Sections Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Секции страницы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                <span className="font-medium flex-1">{section.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleVisibility(section.id)}
                >
                  {section.isVisible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab(section.id)}
                >
                  Редактировать
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-black"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Section Editor */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Hero секция
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Badge */}
              <div>
                <label className="block text-sm font-medium mb-2">Бейдж (над заголовком)</label>
                <Input
                  value={heroData.badge}
                  onChange={(e) => setHeroData({ ...heroData, badge: e.target.value })}
                  placeholder="Новая коллекция 2024"
                />
              </div>

              {/* Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Заголовок (строка 1)</label>
                  <Input
                    value={heroData.titleLine1}
                    onChange={(e) => setHeroData({ ...heroData, titleLine1: e.target.value })}
                    className="text-2xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Заголовок (строка 2) - цветная</label>
                  <Input
                    value={heroData.titleLine2}
                    onChange={(e) => setHeroData({ ...heroData, titleLine2: e.target.value })}
                    className="text-2xl font-bold text-primary"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium mb-2">Подзаголовок</label>
                <textarea
                  value={heroData.subtitle}
                  onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                  rows={2}
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Кнопка 1 (основная)</label>
                  <Input
                    value={heroData.buttonPrimary}
                    onChange={(e) => setHeroData({ ...heroData, buttonPrimary: e.target.value })}
                    placeholder="Текст кнопки"
                  />
                  <Input
                    value={heroData.buttonPrimaryLink}
                    onChange={(e) => setHeroData({ ...heroData, buttonPrimaryLink: e.target.value })}
                    placeholder="Ссылка"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Кнопка 2 (дополнительная)</label>
                  <Input
                    value={heroData.buttonSecondary}
                    onChange={(e) => setHeroData({ ...heroData, buttonSecondary: e.target.value })}
                    placeholder="Текст кнопки"
                  />
                  <Input
                    value={heroData.buttonSecondaryLink}
                    onChange={(e) => setHeroData({ ...heroData, buttonSecondaryLink: e.target.value })}
                    placeholder="Ссылка"
                  />
                </div>
              </div>

              {/* Floating Badge */}
              <div>
                <label className="block text-sm font-medium mb-2">Плавающий бейдж</label>
                <Input
                  value={heroData.floatingBadge}
                  onChange={(e) => setHeroData({ ...heroData, floatingBadge: e.target.value })}
                  placeholder="Скидки до 30%"
                />
              </div>

              {/* Stats */}
              <div>
                <label className="block text-sm font-medium mb-2">Статистика</label>
                <div className="grid grid-cols-4 gap-4">
                  {heroData.stats.map((stat, index) => (
                    <div key={index} className="space-y-2">
                      <Input
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...heroData.stats]
                          newStats[index] = { ...stat, value: e.target.value }
                          setHeroData({ ...heroData, stats: newStats })
                        }}
                        placeholder="500+"
                        className="font-bold text-center"
                      />
                      <Input
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...heroData.stats]
                          newStats[index] = { ...stat, label: e.target.value }
                          setHeroData({ ...heroData, stats: newStats })
                        }}
                        placeholder="Товаров"
                        className="text-center text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Cards */}
              <div>
                <label className="block text-sm font-medium mb-2">Плавающие карточки</label>
                <div className="space-y-4">
                  {heroData.cards.map((card, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <Input
                        value={card.icon}
                        onChange={(e) => {
                          const newCards = [...heroData.cards]
                          newCards[index] = { ...card, icon: e.target.value }
                          setHeroData({ ...heroData, cards: newCards })
                        }}
                        className="w-16 text-center text-2xl"
                        placeholder="🔥"
                      />
                      <div className="flex-1 space-y-2">
                        <Input
                          value={card.title}
                          onChange={(e) => {
                            const newCards = [...heroData.cards]
                            newCards[index] = { ...card, title: e.target.value }
                            setHeroData({ ...heroData, cards: newCards })
                          }}
                          placeholder="Название"
                        />
                        <Input
                          value={card.subtitle}
                          onChange={(e) => {
                            const newCards = [...heroData.cards]
                            newCards[index] = { ...card, subtitle: e.target.value }
                            setHeroData({ ...heroData, cards: newCards })
                          }}
                          placeholder="Подзаголовок"
                        />
                      </div>
                      {card.price && (
                        <Input
                          value={card.price}
                          onChange={(e) => {
                            const newCards = [...heroData.cards]
                            newCards[index] = { ...card, price: e.target.value }
                            setHeroData({ ...heroData, cards: newCards })
                          }}
                          className="w-40"
                          placeholder="от 15 000 сум"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Marquee Editor */}
      {activeTab === "marquee" && (
        <Card>
          <CardHeader>
            <CardTitle>Бегущая строка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Цвет фона</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={marqueeData.backgroundColor}
                  onChange={(e) => setMarqueeData({ ...marqueeData, backgroundColor: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <Input
                  value={marqueeData.backgroundColor}
                  onChange={(e) => setMarqueeData({ ...marqueeData, backgroundColor: e.target.value })}
                  className="w-32"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Скорость (секунд)</label>
              <Input
                type="number"
                value={marqueeData.speed}
                onChange={(e) => setMarqueeData({ ...marqueeData, speed: parseInt(e.target.value) })}
                className="w-32"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Элементы</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMarqueeData({
                    ...marqueeData,
                    items: [...marqueeData.items, { icon: "star", text: "Новый текст" }]
                  })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-2">
                {marqueeData.items.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={item.icon}
                      onChange={(e) => {
                        const newItems = [...marqueeData.items]
                        newItems[index] = { ...item, icon: e.target.value }
                        setMarqueeData({ ...marqueeData, items: newItems })
                      }}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="zap">⚡ Молния</option>
                      <option value="star">⭐ Звезда</option>
                      <option value="package">📦 Посылка</option>
                      <option value="truck">🚚 Доставка</option>
                      <option value="shield">🛡️ Щит</option>
                      <option value="heart">❤️ Сердце</option>
                    </select>
                    <Input
                      value={item.text}
                      onChange={(e) => {
                        const newItems = [...marqueeData.items]
                        newItems[index] = { ...item, text: e.target.value }
                        setMarqueeData({ ...marqueeData, items: newItems })
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setMarqueeData({
                          ...marqueeData,
                          items: marqueeData.items.filter((_, i) => i !== index)
                        })
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Editor */}
      {activeTab === "categories" && (
        <Card>
          <CardHeader>
            <CardTitle>Категории</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Заголовок</label>
                <Input
                  value={categoriesData.title}
                  onChange={(e) => setCategoriesData({ ...categoriesData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Бейдж</label>
                <Input
                  value={categoriesData.badge}
                  onChange={(e) => setCategoriesData({ ...categoriesData, badge: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Категории</label>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-3">
                {categoriesData.items.map((cat, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg items-center">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                    <Input
                      value={cat.icon}
                      onChange={(e) => {
                        const newItems = [...categoriesData.items]
                        newItems[index] = { ...cat, icon: e.target.value }
                        setCategoriesData({ ...categoriesData, items: newItems })
                      }}
                      className="w-16 text-center text-2xl"
                    />
                    <Input
                      value={cat.name}
                      onChange={(e) => {
                        const newItems = [...categoriesData.items]
                        newItems[index] = { ...cat, name: e.target.value }
                        setCategoriesData({ ...categoriesData, items: newItems })
                      }}
                      className="flex-1"
                      placeholder="Название"
                    />
                    <Input
                      value={cat.slug}
                      onChange={(e) => {
                        const newItems = [...categoriesData.items]
                        newItems[index] = { ...cat, slug: e.target.value }
                        setCategoriesData({ ...categoriesData, items: newItems })
                      }}
                      className="w-40"
                      placeholder="slug"
                    />
                    <select
                      value={cat.size}
                      onChange={(e) => {
                        const newItems = [...categoriesData.items]
                        newItems[index] = { ...cat, size: e.target.value }
                        setCategoriesData({ ...categoriesData, items: newItems })
                      }}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="large">Большой</option>
                      <option value="medium">Средний</option>
                      <option value="small">Маленький</option>
                    </select>
                    <Input
                      value={cat.color}
                      onChange={(e) => {
                        const newItems = [...categoriesData.items]
                        newItems[index] = { ...cat, color: e.target.value }
                        setCategoriesData({ ...categoriesData, items: newItems })
                      }}
                      className="w-56"
                      placeholder="from-orange-500 to-red-500"
                    />
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Editor */}
      {activeTab === "products" && (
        <Card>
          <CardHeader>
            <CardTitle>Популярные товары</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Заголовок</label>
                <Input
                  value={productsData.title}
                  onChange={(e) => setProductsData({ ...productsData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Бейдж</label>
                <Input
                  value={productsData.badge}
                  onChange={(e) => setProductsData({ ...productsData, badge: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Количество товаров</label>
              <Input
                type="number"
                value={productsData.showCount}
                onChange={(e) => setProductsData({ ...productsData, showCount: parseInt(e.target.value) })}
                className="w-32"
                min={1}
                max={12}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Режим выбора</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={productsData.autoSelect}
                    onChange={() => setProductsData({ ...productsData, autoSelect: true })}
                  />
                  <span>Автоматически (топ продаж)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!productsData.autoSelect}
                    onChange={() => setProductsData({ ...productsData, autoSelect: false })}
                  />
                  <span>Выбрать вручную</span>
                </label>
              </div>
            </div>

            {!productsData.autoSelect && (
              <div>
                <label className="block text-sm font-medium mb-2">Выберите товары</label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-gray-500 text-sm">
                    Здесь будет список товаров для выбора. Перетащите товары для изменения порядка.
                  </p>
                  {/* Product selector would go here */}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Features Editor */}
      {activeTab === "features" && (
        <Card>
          <CardHeader>
            <CardTitle>Преимущества</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Заголовок</label>
                <Input
                  value={featuresData.title}
                  onChange={(e) => setFeaturesData({ ...featuresData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Бейдж</label>
                <Input
                  value={featuresData.badge}
                  onChange={(e) => setFeaturesData({ ...featuresData, badge: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Элементы</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeaturesData({
                    ...featuresData,
                    items: [...featuresData.items, { icon: "star", title: "Новое преимущество", description: "Описание" }]
                  })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-3">
                {featuresData.items.map((item, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-grab mt-2" />
                    <select
                      value={item.icon}
                      onChange={(e) => {
                        const newItems = [...featuresData.items]
                        newItems[index] = { ...item, icon: e.target.value }
                        setFeaturesData({ ...featuresData, items: newItems })
                      }}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="truck">🚚 Доставка</option>
                      <option value="shield">🛡️ Гарантия</option>
                      <option value="clock">🕐 Время</option>
                      <option value="package">📦 Посылка</option>
                      <option value="star">⭐ Звезда</option>
                      <option value="heart">❤️ Сердце</option>
                      <option value="check">✅ Галочка</option>
                    </select>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const newItems = [...featuresData.items]
                          newItems[index] = { ...item, title: e.target.value }
                          setFeaturesData({ ...featuresData, items: newItems })
                        }}
                        placeholder="Заголовок"
                      />
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...featuresData.items]
                          newItems[index] = { ...item, description: e.target.value }
                          setFeaturesData({ ...featuresData, items: newItems })
                        }}
                        placeholder="Описание"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFeaturesData({
                          ...featuresData,
                          items: featuresData.items.filter((_, i) => i !== index)
                        })
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Editor */}
      {activeTab === "cta" && (
        <Card>
          <CardHeader>
            <CardTitle>CTA блок (Призыв к действию)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Заголовок</label>
              <Input
                value={ctaData.title}
                onChange={(e) => setCtaData({ ...ctaData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Подзаголовок</label>
              <textarea
                value={ctaData.subtitle}
                onChange={(e) => setCtaData({ ...ctaData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Кнопка телефона</label>
                <Input
                  value={ctaData.buttonPhone}
                  onChange={(e) => setCtaData({ ...ctaData, buttonPhone: e.target.value })}
                  placeholder="Текст кнопки"
                />
                <Input
                  value={ctaData.phone}
                  onChange={(e) => setCtaData({ ...ctaData, phone: e.target.value })}
                  placeholder="+998901234567"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Кнопка Telegram</label>
                <Input
                  value={ctaData.buttonTelegram}
                  onChange={(e) => setCtaData({ ...ctaData, buttonTelegram: e.target.value })}
                  placeholder="Текст кнопки"
                />
                <Input
                  value={ctaData.telegram}
                  onChange={(e) => setCtaData({ ...ctaData, telegram: e.target.value })}
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Цвета градиента</label>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs text-gray-500">От</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={ctaData.gradientFrom}
                      onChange={(e) => setCtaData({ ...ctaData, gradientFrom: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={ctaData.gradientFrom}
                      onChange={(e) => setCtaData({ ...ctaData, gradientFrom: e.target.value })}
                      className="w-28"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">До</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={ctaData.gradientTo}
                      onChange={(e) => setCtaData({ ...ctaData, gradientTo: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={ctaData.gradientTo}
                      onChange={(e) => setCtaData({ ...ctaData, gradientTo: e.target.value })}
                      className="w-28"
                    />
                  </div>
                </div>
                <div
                  className="flex-1 h-16 rounded-lg"
                  style={{
                    background: `linear-gradient(to right, ${ctaData.gradientFrom}, ${ctaData.gradientTo})`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
