"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

const options = [
  { value: "default", label: "По умолчанию" },
  { value: "popular", label: "Популярные" },
  { value: "price-asc", label: "Сначала дешевые" },
  { value: "price-desc", label: "Сначала дорогие" },
  { value: "name", label: "По названию" },
]

export function SortSelect({ value }: { value: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (sort: string) => {
    const params = new URLSearchParams(searchParams)
    if (sort === "default") params.delete("sort")
    else params.set("sort", sort)
    params.delete("page")
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="border rounded-lg px-3 py-2 text-sm bg-white"
      aria-label="Сортировка"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
