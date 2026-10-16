"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shop/ProductCard"
import { getFavoriteProducts } from "@/app/actions/catalog"
import type { ProductCardData } from "@/lib/catalog"
import { useFavoritesHydrated, useFavoritesStore } from "@/store/favorites"

export function FavoritesView() {
  const ids = useFavoritesStore((s) => s.ids)
  const remove = useFavoritesStore((s) => s.remove)
  const hydrated = useFavoritesHydrated()
  const [products, setProducts] = useState<ProductCardData[] | null>(null)

  const idsKey = ids.join(",")
  useEffect(() => {
    if (!hydrated) return
    let cancelled = false
    getFavoriteProducts(idsKey ? idsKey.split(",") : []).then((list) => {
      if (cancelled) return
      setProducts(list)
      // Товары, которые сняли с продажи, убираем из избранного
      const gone = (idsKey ? idsKey.split(",") : []).filter((id) => !list.some((p) => p.id === id))
      if (gone.length) remove(gone)
    })
    return () => {
      cancelled = true
    }
  }, [hydrated, idsKey, remove])

  // Убранные сердечком прячем сразу, не дожидаясь сервера
  const visible = products?.filter((p) => ids.includes(p.id))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Избранное</h1>
      {!visible ? (
        <p className="text-gray-400 text-center py-16">Загрузка...</p>
      ) : visible.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16">
          <Heart className="h-20 w-20 mx-auto text-gray-300 mb-6" />
          <p className="text-xl font-semibold mb-2">Здесь пока пусто</p>
          <p className="text-gray-500 mb-6">Нажмите на сердечко у товара, чтобы сохранить его</p>
          <Button asChild><Link href="/catalog">Перейти в каталог</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
