"use client"

import { useState, useEffect, useRef } from "react"
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  RotateCcw,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

type Section = {
  id: string
  name: string
  isVisible: boolean
  isExpanded: boolean
}

type HeroCard = {
  icon: string
  image?: string
  title: string
  subtitle: string
  price?: string
}

type CategoryItem = {
  name: string
  slug: string
  count: number
  color: string
  icon: string
  image?: string
  size: string
}

type FeatureItem = {
  icon: string
  image?: string
  title: string
  description: string
}

export default function HomepageManagementPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("hero")
  const [uploading, setUploading] = useState<string | null>(null)

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
      { icon: "🔥", image: "", title: "Термотрансферы", subtitle: "Премиум качество для профессионалов", price: "от 15 000 сум" },
      { icon: "✨", image: "", title: "Винил", subtitle: "200+ видов" },
      { icon: "🎨", image: "", title: "DTF печать", subtitle: "Всё для печати" },
    ] as HeroCard[],
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
      { name: "Термотрансферы", slug: "termotransfers", count: 150, color: "from-orange-500 to-red-500", icon: "🔥", image: "", size: "large" },
      { name: "Виниловые наклейки", slug: "vinyl", count: 200, color: "from-purple-500 to-pink-500", icon: "✨", image: "", size: "medium" },
      { name: "DTF печать", slug: "dtf", count: 180, color: "from-blue-500 to-cyan-500", icon: "🎨", image: "", size: "medium" },
      { name: "UV DTF", slug: "uv-dtf", count: 120, color: "from-emerald-500 to-teal-500", icon: "💎", image: "", size: "small" },
      { name: "Расходники", slug: "materials", count: 85, color: "from-amber-500 to-orange-500", icon: "📦", image: "", size: "small" },
      { name: "Оборудование", slug: "equipment", count: 45, color: "from-slate-600 to-slate-800", icon: "⚙️", image: "", size: "small" },
    ] as CategoryItem[],
  })

  // Featured Products State
  const [productsData, setProductsData] = useState({
    title: "Популярные товары",
    badge: "Топ продаж",
    showCount: 6,
    autoSelect: true,
    manualProducts: ["1", "2", "3", "4", "5", "6"],
  })

  // Features State
  const [featuresData, setFeaturesData] = useState({
    title: "Преимущества работы с нами",
    badge: "Почему мы",
    items: [
      { icon: "truck", image: "", title: "Быстрая доставка", description: "По всему Узбекистану за 1-3 дня" },
      { icon: "shield", image: "", title: "Гарантия качества", description: "100% оригинальная продукция" },
      { icon: "clock", image: "", title: "Поддержка 24/7", description: "Всегда на связи в Telegram" },
      { icon: "package", image: "", title: "Большой выбор", description: "Более 500 товаров в наличии" },
    ] as FeatureItem[],
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

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings/homepage")
        const data = await response.json()

        if (data.hero) setHeroData(data.hero)
        if (data.marquee) setMarqueeData(data.marquee)
        if (data.categories) setCategoriesData(data.categories)
        if (data.products) setProductsData(data.products)
        if (data.features) setFeaturesData(data.features)
        if (data.cta) setCtaData(data.cta)
        if (data.sections) {
          setSections(data.sections.map((s: Section) => ({ ...s, isExpanded: false })))
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast.error("Ошибка загрузки настроек")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero: heroData,
          marquee: marqueeData,
          categories: categoriesData,
          products: productsData,
          features: featuresData,
          cta: ctaData,
          sections: sections.map(s => ({ id: s.id, name: s.name, isVisible: s.isVisible })),
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Настройки сохранены!")
      } else {
        toast.error("Ошибка сохранения")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Ошибка сохранения")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleVisibility = (id: string) => {
    setSections(sections.map(s =>
      s.id === id ? { ...s, isVisible: !s.isVisible } : s
    ))
  }

  // Image upload handler
  async function handleImageUpload(
    file: File,
    uploadKey: string,
    onSuccess: (url: string) => void
  ) {
    setUploading(uploadKey)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: form })
      if (res.ok) {
        const data = await res.json()
        onSuccess(data.url)
        toast.success("Изображение загружено")
      } else {
        toast.error("Ошибка загрузки")
      }
    } catch (error) {
      toast.error("Ошибка загрузки")
    } finally {
      setUploading(null)
    }
  }

  // Image upload component
  function ImageUploader({
    currentImage,
    currentIcon,
    uploadKey,
    onImageChange,
    onIconChange,
    onRemoveImage,
  }: {
    currentImage?: string
    currentIcon: string
    uploadKey: string
    onImageChange: (url: string) => void
    onIconChange: (icon: string) => void
    onRemoveImage: () => void
  }) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    return (
      <div className="flex items-center gap-3">
        {currentImage ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
            <img src={currentImage} alt="" className="w-full h-full object-cover" />
            <button
              onClick={onRemoveImage}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <Input
            value={currentIcon}
            onChange={(e) => onIconChange(e.target.value)}
            className="w-16 text-center text-2xl"
            placeholder="🔥"
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleImageUpload(file, uploadKey, onImageChange)
            }
            e.target.value = ""
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading === uploadKey}
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploading === uploadKey ? "..." : "Фото"}
        </Button>
      </div>
    )
  }

  const tabs = [
    { id: "hero", label: "Hero" },
    { id: "marquee", label: "Бегущая строка" },
    { id: "categories", label: "Категории" },
    { id: "products", label: "Товары" },
    { id: "features", label: "Преимущества" },
    { id: "cta", label: "CTA" },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка настроек...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Управление главной страницей</h1>
          <p className="text-gray-500">Настройте содержимое и внешний вид главной страницы</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/", "_blank")}>
            <Eye className="h-4 w-4 mr-2" />
            Предпросмотр
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
            {sections.map((section) => (
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

              {/* Floating Cards with Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Плавающие карточки (эмодзи или фото)</label>
                <div className="space-y-4">
                  {heroData.cards.map((card, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg items-start">
                      <ImageUploader
                        currentImage={card.image}
                        currentIcon={card.icon}
                        uploadKey={`hero-card-${index}`}
                        onImageChange={(url) => {
                          const newCards = [...heroData.cards]
                          newCards[index] = { ...card, image: url }
                          setHeroData({ ...heroData, cards: newCards })
                        }}
                        onIconChange={(icon) => {
                          const newCards = [...heroData.cards]
                          newCards[index] = { ...card, icon }
                          setHeroData({ ...heroData, cards: newCards })
                        }}
                        onRemoveImage={() => {
                          const newCards = [...heroData.cards]
                          newCards[index] = { ...card, image: "" }
                          setHeroData({ ...heroData, cards: newCards })
                        }}
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
                      {card.price !== undefined && (
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
                      <option value="zap">Молния</option>
                      <option value="star">Звезда</option>
                      <option value="package">Посылка</option>
                      <option value="truck">Доставка</option>
                      <option value="shield">Щит</option>
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

      {/* Categories Editor with Image Upload */}
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
                <label className="block text-sm font-medium">Категории (эмодзи или фото)</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCategoriesData({
                    ...categoriesData,
                    items: [...categoriesData.items, {
                      name: "Новая категория",
                      slug: "new",
                      count: 0,
                      color: "from-gray-500 to-gray-600",
                      icon: "📦",
                      image: "",
                      size: "small"
                    }]
                  })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-3">
                {categoriesData.items.map((cat, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg items-center">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                    <ImageUploader
                      currentImage={cat.image}
                      currentIcon={cat.icon}
                      uploadKey={`cat-${index}`}
                      onImageChange={(url) => {
                        const newItems = [...categoriesData.items]
                        newItems[index] = { ...cat, image: url }
                        setCategoriesData({ ...categoriesData, items: newItems })
                      }}
                      onIconChange={(icon) => {
                        const newItems = [...categoriesData.items]
                        newItems[index] = { ...cat, icon }
                        setCategoriesData({ ...categoriesData, items: newItems })
                      }}
                      onRemoveImage={() => {
                        const newItems = [...categoriesData.items]
                        newItems[index] = { ...cat, image: "" }
                        setCategoriesData({ ...categoriesData, items: newItems })
                      }}
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
                      className="w-32"
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
                      className="w-48"
                      placeholder="from-orange-500 to-red-500"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCategoriesData({
                          ...categoriesData,
                          items: categoriesData.items.filter((_, i) => i !== index)
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
          </CardContent>
        </Card>
      )}

      {/* Features Editor with Image Upload */}
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
                <label className="block text-sm font-medium">Элементы (иконка или фото)</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeaturesData({
                    ...featuresData,
                    items: [...featuresData.items, { icon: "star", image: "", title: "Новое преимущество", description: "Описание" }]
                  })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-3">
                {featuresData.items.map((item, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg items-start">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-grab mt-2" />
                    <div className="flex flex-col gap-2">
                      {item.image ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => {
                              const newItems = [...featuresData.items]
                              newItems[index] = { ...item, image: "" }
                              setFeaturesData({ ...featuresData, items: newItems })
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <select
                          value={item.icon}
                          onChange={(e) => {
                            const newItems = [...featuresData.items]
                            newItems[index] = { ...item, icon: e.target.value }
                            setFeaturesData({ ...featuresData, items: newItems })
                          }}
                          className="px-3 py-2 border rounded-lg"
                        >
                          <option value="truck">Доставка</option>
                          <option value="shield">Гарантия</option>
                          <option value="clock">Время</option>
                          <option value="package">Посылка</option>
                          <option value="star">Звезда</option>
                          <option value="check">Галочка</option>
                        </select>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={`feature-img-${index}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(file, `feature-${index}`, (url) => {
                              const newItems = [...featuresData.items]
                              newItems[index] = { ...item, image: url }
                              setFeaturesData({ ...featuresData, items: newItems })
                            })
                          }
                          e.target.value = ""
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`feature-img-${index}`)?.click()}
                        disabled={uploading === `feature-${index}`}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        {uploading === `feature-${index}` ? "..." : "Фото"}
                      </Button>
                    </div>
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
