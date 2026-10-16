"use client"

import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCartHydrated, useCartStore } from "@/store/cart"
import { ProductImage } from "@/components/shop/ProductImage"

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU").format(price) + " сум"
}

export function CartView({ freeShippingFrom }: { freeShippingFrom: number }) {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
  const hydrated = useCartHydrated()

  if (!hydrated) {
    return <div className="container mx-auto px-4 py-16 text-center text-gray-400">Загрузка корзины...</div>
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
          <p className="text-gray-600 mb-8">
            Добавьте товары из каталога, чтобы оформить заказ
          </p>
          <Link href="/catalog">
            <Button size="lg">Перейти в каталог</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Корзина</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <ProductImage src={item.image} alt={item.name} className="w-24 h-24 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          {item.slug ? (
                            <Link href={`/product/${item.slug}`} className="font-medium hover:text-primary">
                              {item.name}
                            </Link>
                          ) : (
                            <h3 className="font-medium">{item.name}</h3>
                          )}
                          <p className="text-sm text-gray-500">{item.sku}</p>
                          {item.variantName && (
                            <p className="text-sm text-gray-500">{item.variantName}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.productId, item.variantId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1, item.variantId)
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1, item.variantId)
                            }
                            disabled={item.maxQuantity !== undefined && item.quantity >= item.maxQuantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price)} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={clearCart}>
              Очистить корзину
            </Button>
            <Link href="/catalog">
              <Button variant="outline">Продолжить покупки</Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Итого</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Товаров:</span>
                <span>{items.reduce((acc, item) => acc + item.quantity, 0)} шт.</span>
              </div>
              <div className="flex justify-between">
                <span>Сумма:</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              <p className="text-sm text-gray-500">
                Доставка и промокод — на следующем шаге.
                {freeShippingFrom > 0 && ` Доставка бесплатно от ${formatPrice(freeShippingFrom)}.`}
              </p>

              <hr />

              <div className="flex justify-between text-lg font-bold">
                <span>Итого:</span>
                <span>{formatPrice(getTotal())}</span>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Оформить заказ
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
