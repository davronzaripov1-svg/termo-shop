import { cn } from "@/lib/utils"
import { ORDER_STATUS_LABELS } from "@/lib/checkout"

const colors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-indigo-100 text-indigo-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  PICKING: "bg-amber-100 text-amber-700",
  READY: "bg-teal-100 text-teal-700",
  SHIPPING: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-200 text-gray-600",
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-sm font-medium", colors[status] ?? "bg-gray-100")}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  )
}
