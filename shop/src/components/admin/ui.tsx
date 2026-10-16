import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ORDER_STATUS_LABELS } from "@/lib/checkout"
import { PAYMENT_STATUS_LABELS } from "@/lib/orders"

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500",
  CONFIRMED: "bg-indigo-500",
  PROCESSING: "bg-yellow-500",
  PICKING: "bg-orange-500",
  READY: "bg-teal-500",
  SHIPPING: "bg-purple-500",
  DELIVERED: "bg-green-500",
  COMPLETED: "bg-green-700",
  CANCELLED: "bg-red-500",
}

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500",
  PAID: "bg-green-500",
  PARTIAL: "bg-blue-500",
  REFUNDED: "bg-gray-500",
  FAILED: "bg-red-500",
}

export function OrderStatus({ status }: { status: string }) {
  return (
    <Badge className={`${statusColors[status] ?? "bg-gray-500"} text-white border-0 whitespace-nowrap`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export function PaymentStatus({ status }: { status: string }) {
  return (
    <Badge className={`${paymentStatusColors[status] ?? "bg-gray-500"} text-white border-0 whitespace-nowrap`}>
      {PAYMENT_STATUS_LABELS[status as keyof typeof PAYMENT_STATUS_LABELS] ?? status}
    </Badge>
  )
}

/** Ссылка «назад/вперёд» с сохранением фильтров. */
export function Pagination({
  path,
  params,
  page,
  pageCount,
  total,
  shown,
  noun,
}: {
  path: string
  params: Record<string, string | undefined>
  page: number
  pageCount: number
  total: number
  shown: number
  noun: string
}) {
  const href = (p: number) => {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries({ ...params, page: p > 1 ? String(p) : undefined })) {
      if (v) sp.set(k, v)
    }
    const qs = sp.toString()
    return qs ? `${path}?${qs}` : path
  }

  return (
    <div className="flex flex-wrap justify-between items-center gap-3">
      <p className="text-sm text-gray-500">
        Показано {shown} из {total} {noun}
        {pageCount > 1 && ` · страница ${page} из ${pageCount}`}
      </p>
      {pageCount > 1 && (
        <div className="flex gap-2">
          {page > 1 ? (
            <Button asChild variant="outline"><Link href={href(page - 1)}>Назад</Link></Button>
          ) : (
            <Button variant="outline" disabled>Назад</Button>
          )}
          {page < pageCount ? (
            <Button asChild variant="outline"><Link href={href(page + 1)}>Вперед</Link></Button>
          ) : (
            <Button variant="outline" disabled>Вперед</Button>
          )}
        </div>
      )}
    </div>
  )
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-10 text-center text-gray-500">{children}</td>
    </tr>
  )
}
