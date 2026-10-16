import { Package } from "lucide-react"
import { cn } from "@/lib/utils"

/** Фото товара или заглушка, если фото ещё не загружено. */
export function ProductImage({
  src,
  alt,
  className,
}: {
  src: string | null | undefined
  alt: string
  className?: string
}) {
  if (!src) {
    return (
      <div className={cn("flex items-center justify-center bg-gray-100 text-gray-300", className)}>
        <Package className="h-1/3 w-1/3" strokeWidth={1.25} />
      </div>
    )
  }

  // Обычный <img>: фото могут лежать на любом домене, next/image потребовал бы настройки
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={cn("object-cover bg-gray-100", className)} loading="lazy" />
}
