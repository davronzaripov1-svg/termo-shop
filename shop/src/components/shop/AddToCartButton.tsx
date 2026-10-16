"use client"

import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useCartStore, type CartItem } from "@/store/cart"

type Props = {
  item: Omit<CartItem, "id">
  disabled?: boolean
  className?: string
  size?: "default" | "sm" | "lg"
  children?: React.ReactNode
}

export function AddToCartButton({ item, disabled, className, size = "default", children }: Props) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const inCart = useCartStore((state) =>
    state.items.find((i) => i.productId === item.productId && i.variantId === item.variantId)?.quantity ?? 0
  )
  const limitReached = item.maxQuantity !== undefined && inCart >= item.maxQuantity

  const handleClick = () => {
    if (limitReached) {
      toast.info("В корзине уже весь доступный остаток")
      return
    }
    addItem(item)
    toast.success(`«${item.name}» в корзине`, {
      action: { label: "Перейти", onClick: () => router.push("/cart") },
    })
  }

  return (
    <Button type="button" size={size} className={className} disabled={disabled} onClick={handleClick}>
      <ShoppingCart className="h-4 w-4 mr-2" />
      {children ?? "В корзину"}
    </Button>
  )
}
