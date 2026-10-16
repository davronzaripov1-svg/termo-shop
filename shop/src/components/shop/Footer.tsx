import Link from "next/link"
import { Phone, Mail, MapPin, Send, Camera } from "lucide-react"
import { getSiteSettings, telHref, telegramHref } from "@/lib/settings"

export default async function Footer() {
  const site = await getSiteSettings()
  const telegram = telegramHref(site.telegram)
  const instagram = site.instagram.replace(/^@/, "")

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
            <p className="text-sm mb-4">{site.description}</p>
            <div className="flex gap-4">
              {telegram && (
                <a href={telegram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Telegram">
                  <Send className="h-5 w-5" />
                </a>
              )}
              {instagram && (
                <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                  <Camera className="h-5 w-5" />
                </a>
              )}
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
              {site.phone && (
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <a href={telHref(site.phone)} className="hover:text-white transition-colors block">{site.phone}</a>
                    {site.phone2 && <a href={telHref(site.phone2)} className="hover:text-white transition-colors block">{site.phone2}</a>}
                    {site.workingHours && <p className="text-xs text-gray-500">{site.workingHours}</p>}
                  </div>
                </li>
              )}
              {site.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a href={`mailto:${site.email}`} className="hover:text-white transition-colors">{site.email}</a>
                </li>
              )}
              {site.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{site.address}</span>
                </li>
              )}
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
