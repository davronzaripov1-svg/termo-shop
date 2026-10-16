import { useEffect, useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Избранное хранится в браузере (как корзина) — работает и без входа в аккаунт
interface FavoritesState {
  ids: string[]
  toggle: (productId: string) => void
  remove: (productIds: string[]) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId) ? state.ids.filter((id) => id !== productId) : [productId, ...state.ids],
        })),
      remove: (productIds) => set((state) => ({ ids: state.ids.filter((id) => !productIds.includes(id)) })),
    }),
    // Читаем из localStorage после первой отрисовки — как корзину (см. store/cart.ts)
    { name: 'favorites', skipHydration: true }
  )
)

export function useFavoritesHydration() {
  useEffect(() => {
    useFavoritesStore.persist.rehydrate()
  }, [])
}

/** true, когда избранное уже прочитано из localStorage */
export function useFavoritesHydrated() {
  return useSyncExternalStore(
    (onChange) => useFavoritesStore.persist.onFinishHydration(onChange),
    () => useFavoritesStore.persist.hasHydrated(),
    () => false
  )
}
