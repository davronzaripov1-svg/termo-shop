import { useEffect, useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartFix } from '@/app/actions/checkout'

export interface CartItem {
  id: string
  productId: string
  slug?: string
  name: string
  sku: string
  price: number
  image?: string
  quantity: number
  variantId?: string
  variantName?: string
  /** Сколько можно заказать (остаток на складе) */
  maxQuantity?: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  applyFixes: (fixes: CartFix[]) => void
  getTotal: () => number
  getItemsCount: () => number
}

function clampQuantity(quantity: number, max?: number): number {
  return max !== undefined && max > 0 ? Math.min(quantity, max) : quantity
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, ...item, quantity: clampQuantity(i.quantity + item.quantity, item.maxQuantity) }
                  : i
              ),
            }
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: clampQuantity(item.quantity, item.maxQuantity),
                id: `${item.productId}-${item.variantId || 'default'}-${Date.now()}`,
              },
            ],
          }
        })
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }))
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: clampQuantity(quantity, i.maxQuantity) }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      // Сервер сообщил, что цены/остатки изменились — приводим корзину в соответствие
      applyFixes: (fixes) => {
        set((state) => ({
          items: state.items.flatMap((i) => {
            const fix = fixes.find((f) => f.productId === i.productId && f.variantId === i.variantId)
            if (!fix) return [i]
            if (fix.remove) return []
            const maxQuantity = fix.maxQuantity ?? i.maxQuantity
            return [{
              ...i,
              price: fix.price ?? i.price,
              maxQuantity,
              quantity: clampQuantity(i.quantity, maxQuantity),
            }]
          }),
        }))
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
      // Корзину читаем из localStorage только после первой отрисовки (useCartHydration),
      // иначе разметка с сервера не совпадёт с браузерной
      skipHydration: true,
    }
  )
)

/** Подгружает сохранённую корзину. Вызывается один раз в layout магазина. */
export function useCartHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate()
  }, [])
}

/** true, когда корзина уже прочитана из localStorage. */
export function useCartHydrated() {
  return useSyncExternalStore(
    (onChange) => useCartStore.persist.onFinishHydration(onChange),
    () => useCartStore.persist.hasHydrated(),
    () => false
  )
}
