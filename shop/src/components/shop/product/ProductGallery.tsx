"use client"

import { useState } from "react"
import { ProductImage } from "@/components/shop/ProductImage"
import { cn } from "@/lib/utils"

type Image = { id: string; url: string; alt: string | null }

export function ProductGallery({ images, name }: { images: Image[]; name: string }) {
  const [active, setActive] = useState(0)
  const current = images[active]

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-2xl border">
        <ProductImage src={current?.url} alt={current?.alt || name} className="h-full w-full" />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "aspect-square overflow-hidden rounded-lg border-2",
                i === active ? "border-primary" : "border-transparent"
              )}
              aria-label={`Фото ${i + 1}`}
            >
              <ProductImage src={img.url} alt={img.alt || name} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
