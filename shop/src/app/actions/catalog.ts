"use server"

import { getProductsByIds } from "@/lib/catalog"

/** Карточки товаров для страницы избранного (скрытые и удалённые не вернутся) */
export async function getFavoriteProducts(ids: string[]) {
  return getProductsByIds(ids.filter((id) => typeof id === "string").slice(0, 200))
}
