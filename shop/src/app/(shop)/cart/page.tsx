import { CartView } from "@/components/shop/cart/CartView"
import { getShopSettings } from "@/lib/settings"

export const metadata = { title: "Корзина" }

export default async function CartPage() {
  const settings = await getShopSettings()
  return <CartView freeShippingFrom={settings.freeShippingFrom} />
}
