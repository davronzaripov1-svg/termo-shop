"use client"

import Link from "next/link"
import { ArrowRight, ArrowUpRight, Sparkles, Zap, Star, Play, ChevronRight, Phone, Send, Package, Truck, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const categories = [
  { name: "Термотрансферы", slug: "termotransfers", count: 150, color: "from-orange-500 to-red-500", icon: "🔥" },
  { name: "Виниловые наклейки", slug: "vinyl", count: 200, color: "from-purple-500 to-pink-500", icon: "✨" },
  { name: "DTF печать", slug: "dtf", count: 180, color: "from-blue-500 to-cyan-500", icon: "🎨" },
  { name: "UV DTF", slug: "uv-dtf", count: 120, color: "from-emerald-500 to-teal-500", icon: "💎" },
  { name: "Расходники", slug: "materials", count: 85, color: "from-amber-500 to-orange-500", icon: "📦" },
  { name: "Оборудование", slug: "equipment", count: 45, color: "from-slate-600 to-slate-800", icon: "⚙️" },
]

const featuredProducts = [
  { id: "1", name: "Термотрансфер Premium A4", price: 15000, oldPrice: 20000, tag: "Хит", color: "bg-orange-500" },
  { id: "2", name: "Виниловая пленка глянцевая 50см", price: 85000, tag: "Новинка", color: "bg-purple-500" },
  { id: "3", name: "DTF пленка рулон 60см x 100м", price: 350000, oldPrice: 420000, tag: "-17%", color: "bg-blue-500" },
  { id: "4", name: "UV DTF стикеры набор 100шт", price: 125000, tag: "Топ", color: "bg-emerald-500" },
  { id: "5", name: "Порошок DTF белый 1кг", price: 180000, color: "bg-amber-500" },
  { id: "6", name: "Термопресс автомат 40x60", price: 2500000, tag: "Премиум", color: "bg-slate-700" },
]

const stats = [
  { value: "500+", label: "Товаров" },
  { value: "1000+", label: "Клиентов" },
  { value: "50+", label: "Городов" },
  { value: "24/7", label: "Поддержка" },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price)
}

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section - Creative Split Design */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
          </div>
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">Новая коллекция 2024</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                <span className="block">Termo</span>
                <span className="block text-primary">stik</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-md leading-relaxed">
                Профессиональные материалы для термопереноса и печати. Создавайте уникальные изделия.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/catalog">
                  <Button size="lg" className="bg-primary text-black hover:bg-primary/90 rounded-full px-8 h-14 text-lg font-semibold group">
                    Каталог
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-black bg-white text-black hover:bg-gray-100">
                  <Play className="mr-2 h-5 w-5" />
                  Как это работает
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8 border-t border-white/10">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Floating Cards */}
            <div className="relative hidden lg:block h-[600px]">
              {/* Main Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-80 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-xl rounded-3xl border border-primary/20 p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="text-6xl mb-4">🔥</div>
                <h3 className="text-white text-xl font-bold mb-2">Термотрансферы</h3>
                <p className="text-gray-400 text-sm mb-4">Премиум качество для профессионалов</p>
                <div className="text-primary text-2xl font-bold">от 15 000 сум</div>
              </div>

              {/* Floating Card 1 */}
              <div className="absolute top-10 right-10 w-48 h-48 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <div className="text-4xl mb-2">✨</div>
                <h4 className="text-white font-semibold">Винил</h4>
                <p className="text-gray-500 text-xs">200+ видов</p>
              </div>

              {/* Floating Card 2 */}
              <div className="absolute bottom-20 left-0 w-44 h-44 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 transform rotate-12 hover:rotate-0 transition-transform duration-500">
                <div className="text-4xl mb-2">🎨</div>
                <h4 className="text-white font-semibold">DTF печать</h4>
                <p className="text-gray-500 text-xs">Всё для печати</p>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-20 left-20 px-4 py-2 bg-primary rounded-full text-black font-semibold text-sm transform -rotate-12">
                Скидки до 30%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <div className="bg-primary py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 text-black font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Бесплатная доставка от 500 000 сум
              <span className="mx-4">•</span>
              <Star className="h-4 w-4" />
              Гарантия качества
              <span className="mx-4">•</span>
              <Package className="h-4 w-4" />
              Быстрая отправка
            </span>
          ))}
        </div>
      </div>

      {/* Categories - Bento Grid Style */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-0">Каталог</Badge>
              <h2 className="text-4xl font-black">Категории товаров</h2>
            </div>
            <Link href="/catalog" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-primary transition-colors group">
              Все категории
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[180px]">
            {/* Large Card */}
            <Link href="/catalog/termotransfers" className="col-span-2 row-span-2 group">
              <div className="h-full bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 text-[150px] opacity-20 transform translate-x-10 -translate-y-10">🔥</div>
                <div>
                  <Badge className="bg-white/20 text-white border-0 mb-2">Популярное</Badge>
                  <h3 className="text-white text-2xl font-bold">Термотрансферы</h3>
                  <p className="text-white/70 mt-1">150+ товаров</p>
                </div>
                <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                  <span className="font-semibold">Смотреть</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Medium Cards */}
            {categories.slice(1, 3).map((cat, i) => (
              <Link key={cat.slug} href={`/catalog/${cat.slug}`} className="col-span-2 group">
                <div className={`h-full bg-gradient-to-br ${cat.color} rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 text-[80px] opacity-20 transform translate-x-4 -translate-y-4">{cat.icon}</div>
                  <div>
                    <h3 className="text-white text-lg font-bold">{cat.name}</h3>
                    <p className="text-white/70 text-sm">{cat.count} товаров</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}

            {/* Small Cards */}
            {categories.slice(3).map((cat) => (
              <Link key={cat.slug} href={`/catalog/${cat.slug}`} className="col-span-1 md:col-span-2 lg:col-span-1 group">
                <div className={`h-full bg-gradient-to-br ${cat.color} rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden`}>
                  <div className="text-3xl">{cat.icon}</div>
                  <div>
                    <h3 className="text-white text-sm font-bold">{cat.name}</h3>
                    <p className="text-white/70 text-xs">{cat.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Modern Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Badge className="mb-4 bg-black text-white border-0">Топ продаж</Badge>
              <h2 className="text-4xl font-black">Популярные товары</h2>
            </div>
            <Link href="/catalog" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-primary transition-colors group">
              Все товары
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, i) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group">
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
                  {/* Product Image Area */}
                  <div className={`${product.color} h-48 relative flex items-center justify-center`}>
                    <div className="text-white/20 text-8xl font-black">0{i + 1}</div>
                    {product.tag && (
                      <Badge className="absolute top-4 left-4 bg-white text-black border-0 font-semibold">
                        {product.tag}
                      </Badge>
                    )}
                    <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black">{formatPrice(product.price)}</span>
                      <span className="text-sm text-gray-400">сум</span>
                      {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through ml-auto">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/catalog">
              <Button size="lg" className="rounded-full px-10 h-14 text-lg bg-black text-white hover:bg-gray-900">
                Смотреть весь каталог
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us - Modern Features */}
      <section className="py-20 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary text-black border-0">Почему мы</Badge>
            <h2 className="text-4xl font-black">Преимущества работы с нами</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Быстрая доставка", desc: "По всему Узбекистану за 1-3 дня" },
              { icon: Shield, title: "Гарантия качества", desc: "100% оригинальная продукция" },
              { icon: Clock, title: "Поддержка 24/7", desc: "Всегда на связи в Telegram" },
              { icon: Package, title: "Большой выбор", desc: "Более 500 товаров в наличии" },
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-colors h-full">
                  <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-lime-400 rounded-[40px] p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.05)_25%,rgba(0,0,0,0.05)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.05)_75%)] bg-[size:20px_20px]" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-black mb-4">
                  Готовы сделать заказ?
                </h2>
                <p className="text-black/70 text-lg max-w-md">
                  Свяжитесь с нами любым удобным способом. Мы поможем подобрать товары под ваши задачи.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <a href="tel:+998901234567">
                  <Button size="lg" className="bg-black text-white hover:bg-gray-900 rounded-full px-8 h-14 text-lg">
                    <Phone className="mr-2 h-5 w-5" />
                    Позвонить
                  </Button>
                </a>
                <a href="https://t.me/termostik" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-black text-black hover:bg-black/10">
                    <Send className="mr-2 h-5 w-5" />
                    Telegram
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
