"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/shop/AddToCartButton"
import { calculateDiscount, cn, formatSum } from "@/lib/utils"
import type { Availability, ProductDetails } from "@/lib/catalog"

const availabilityText: Record<Availability, { label: string; className: string }> = {
  in_stock: { label: "В наличии", className: "text-green-600" },
  on_order: { label: "Под заказ", className: "text-amber-600" },
  out_of_stock: { label: "Нет в наличии", className: "text-red-500" },
}

/** Цена, выбор варианта и количества, кнопка «В корзину». */
export function ProductPurchase({ product }: { product: ProductDetails }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id)
  const variant = product.variants.find((v) => v.id === variantId)

  const price = variant?.price ?? product.price
  const oldPrice = product.oldPrice && product.oldPrice > price ? product.oldPrice : null
  const { availability, maxQuantity } = variant ?? product
  const minQuantity = product.minQuantity
  const canBuy = availability !== "out_of_stock" && maxQuantity >= minQuantity

  const [quantity, setQuantity] = useState(minQuantity)
  const clamp = (n: number) => Math.min(Math.max(n, minQuantity), Math.max(maxQuantity, minQuantity))

  const status = availabilityText[canBuy ? availability : "out_of_stock"]

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-black">{formatSum(price)}</span>
          {oldPrice && (
            <>
              <span className="text-lg text-gray-400 line-through">{formatSum(oldPrice)}</span>
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-sm font-semibold text-white">
                -{calculateDiscount(price, oldPrice)}%
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">за 1 {product.unit}</p>
      </div>

      <p className={cn("font-medium", status.className)}>
        {status.label}
        {availability === "in_stock" && canBuy && maxQuantity <= 10 && (
          <span className="text-gray-500 font-normal"> — осталось {maxQuantity} {product.unit}</span>
        )}
      </p>

      {product.variants.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Вариант</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVariantId(v.id)
                  setQuantity(minQuantity)
                }}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm transition-colors",
                  v.id === variantId ? "border-primary bg-primary/10 font-medium" : "hover:border-gray-400",
                  v.availability === "out_of_stock" && "text-gray-400 line-through"
                )}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center border rounded-lg">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQuantity(clamp(quantity - 1))}
            disabled={!canBuy || quantity <= minQuantity}
            aria-label="Меньше"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <input
            type="number"
            value={quantity}
            min={minQuantity}
            max={maxQuantity}
            onChange={(e) => setQuantity(clamp(Number(e.target.value) || minQuantity))}
            disabled={!canBuy}
            className="w-16 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Количество"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQuantity(clamp(quantity + 1))}
            disabled={!canBuy || quantity >= maxQuantity}
            aria-label="Больше"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <AddToCartButton
          size="lg"
          className="flex-1 min-w-48"
          disabled={!canBuy}
          item={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            sku: variant?.sku || product.sku,
            price,
            image: product.image ?? undefined,
            quantity,
            maxQuantity,
            variantId: variant?.id,
            variantName: variant?.name,
          }}
        >
          {canBuy ? "В корзину" : "Нет в наличии"}
        </AddToCartButton>
      </div>

      {minQuantity > 1 && (
        <p className="text-sm text-gray-500">Минимальный заказ: {minQuantity} {product.unit}</p>
      )}
    </div>
  )
}
