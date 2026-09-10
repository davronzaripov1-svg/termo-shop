"use client"

import Link from "next/link"
import { useState } from "react"
import { ShoppingCart, Menu, X, Search, User, Heart, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/store/cart"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const itemsCount = useCartStore((state) => state.getItemsCount())

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      {/* Top Bar */}
      <div className="hidden md:block bg-gray-100 text-sm">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="tel:+998901234567" className="flex items-center gap-1 hover:text-primary">
              <Phone className="h-4 w-4" />
              +998 90 123 45 67
            </a>
            <span className="text-gray-400">|</span>
            <span>Доставка по всему Узбекистану</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-primary">О компании</Link>
            <Link href="/delivery" className="hover:text-primary">Доставка</Link>
            <Link href="/contacts" className="hover:text-primary">Контакты</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-black">Termo</span>
            <span className="text-primary">stik</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/catalog" className="font-medium hover:text-primary transition-colors">
              Каталог
            </Link>
            <Link href="/new" className="font-medium hover:text-primary transition-colors">
              Новинки
            </Link>
            <Link href="/sale" className="font-medium hover:text-primary transition-colors">
              Акции
            </Link>
          </nav>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Поиск товаров..."
                className="w-full pl-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/favorites">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/account">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {itemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {itemsCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="md:hidden border-t p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Поиск товаров..."
              className="w-full pl-10"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link
              href="/catalog"
              className="py-2 font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Каталог
            </Link>
            <Link
              href="/new"
              className="py-2 font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Новинки
            </Link>
            <Link
              href="/sale"
              className="py-2 font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Акции
            </Link>
            <hr className="my-2" />
            <Link
              href="/about"
              className="py-2 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              О компании
            </Link>
            <Link
              href="/delivery"
              className="py-2 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Доставка
            </Link>
            <Link
              href="/contacts"
              className="py-2 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Контакты
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
