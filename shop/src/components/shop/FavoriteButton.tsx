"use client"

import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFavoritesStore } from "@/store/favorites"

export function FavoriteButton({ productId, className }: { productId: string; className?: string }) {
  const active = useFavoritesStore((s) => s.ids.includes(productId))
  const toggle = useFavoritesStore((s) => s.toggle)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        toggle(productId)
      }}
      aria-pressed={active}
      aria-label={active ? "Убрать из избранного" : "В избранное"}
      title={active ? "Убрать из избранного" : "В избранное"}
      className={cn("rounded-full bg-white/90 p-2 shadow-sm hover:bg-white transition-colors", className)}
    >
      <Heart className={cn("h-4 w-4", active ? "fill-red-500 text-red-500" : "text-gray-600")} />
    </button>
  )
}
