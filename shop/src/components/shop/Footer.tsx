import Link from "next/link"
import { Phone, Mail, MapPin, Send } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4">
              <span>Termo</span>
              <span className="text-primary">stik</span>
            </h3>
            <p className="text-sm mb-4">
              Термотрансферы, виниловые наклейки, DTF и UV DTF печать. Быстрая доставка по всему Узбекистану.
            </p>
            <div className="flex gap-4">
              <a
                href="https://t.me/termostik"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="text-white font-semibold mb-4">Каталог</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors">
                  Все товары
                </Link>
              </li>
              <li>
                <Link href="/new" className="hover:text-white transition-colors">
                  Новинки
                </Link>
              </li>
              <li>
                <Link href="/sale" className="hover:text-white transition-colors">
                  Акции
                </Link>
              </li>
              <li>
                <Link href="/popular" className="hover:text-white transition-colors">
                  Популярные
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-white font-semibold mb-4">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-white transition-colors">
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link href="/guarantee" className="hover:text-white transition-colors">
                  Гарантия
                </Link>
              </li>
              <li>
                <Link href="/return" className="hover:text-white transition-colors">
                  Возврат товара
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Частые вопросы
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:+998901234567" className="hover:text-white transition-colors">
                    +998 90 123 45 67
                  </a>
                  <p className="text-xs text-gray-500">Пн-Сб: 9:00 - 18:00</p>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:info@termostik.uz" className="hover:text-white transition-colors">
                  info@termostik.uz
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>г. Ташкент, ул. Примерная, 123</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Termo stik. Все права защищены.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">
              Условия использования
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Конфиденциальность
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
