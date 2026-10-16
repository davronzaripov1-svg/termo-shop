import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AddToCartButton } from "@/components/shop/AddToCartButton"
import { ProductImage } from "@/components/shop/ProductImage"
import { FavoriteButton } from "@/components/shop/FavoriteButton"
import { calculateDiscount, cn, formatSum } from "@/lib/utils"
import type { ProductCardData } from "@/lib/catalog"

export function productCartItem(product: ProductCardData) {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    price: product.price,
    image: product.image ?? undefined,
    quantity: product.minQuantity,
    maxQuantity: product.maxQuantity,
  }
}

export function ProductCard({ product, layout = "grid" }: { product: ProductCardData; layout?: "grid" | "list" }) {
  const href = `/product/${product.slug}`
  const discount = product.oldPrice ? calculateDiscount(product.price, product.oldPrice) : 0
  const isList = layout === "list"

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className={cn("p-4 h-full", isList ? "flex gap-4" : "flex flex-col")}>
        <div className={cn("relative", isList ? "w-32 h-32 flex-shrink-0" : "w-full aspect-square mb-3")}>
          <Link href={href} className="block h-full overflow-hidden rounded-lg">
            <ProductImage src={product.image} alt={product.name} className="h-full w-full" />
            <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
              {product.isNew && <Badge>Новинка</Badge>}
              {discount > 0 && <Badge className="bg-red-500 text-white border-0">-{discount}%</Badge>}
            </div>
          </Link>
          <FavoriteButton productId={product.id} className="absolute top-2 right-2" />
        </div>

        <div className="flex flex-col flex-1">
          <p className="text-xs text-gray-400 mb-1">{product.sku}</p>
          <Link href={href} className="font-medium mb-1 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </Link>
          <p className="text-sm text-gray-500 mb-2">{product.categoryName}</p>
          <div className="flex items-center gap-2 flex-wrap mt-auto">
            <span className="font-bold text-lg">{formatSum(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">{formatSum(product.oldPrice)}</span>
            )}
          </div>
          {product.availability === "on_order" && (
            <p className="text-xs text-amber-600 mt-1">Под заказ</p>
          )}
          <AddToCartButton
            item={productCartItem(product)}
            disabled={product.availability === "out_of_stock"}
            size="sm"
            className={cn("mt-3", isList ? "self-start" : "w-full")}
          >
            {product.availability === "out_of_stock" ? "Нет в наличии" : "В корзину"}
          </AddToCartButton>
        </div>
      </CardContent>
    </Card>
  )
}
