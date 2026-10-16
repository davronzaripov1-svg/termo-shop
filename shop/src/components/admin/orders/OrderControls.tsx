"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { changeOrderStatus, updateOrderDetails } from "@/app/admin/orders/actions"
import { ORDER_STATUS_LABELS } from "@/lib/checkout"
import { PAYMENT_STATUS_LABELS } from "@/lib/orders"

const selectClass = "w-full border rounded-lg px-3 py-2 text-sm bg-white"

const stockHints: Record<string, string> = {
  SHIPPING: "Товар спишется со склада",
  DELIVERED: "Товар спишется со склада",
  COMPLETED: "Товар спишется со склада",
  CANCELLED: "Резерв снимется, товар вернётся на склад",
}

export function OrderControls({
  orderId,
  status,
  allowedStatuses,
  paymentStatus,
  managerId,
  adminNote,
  managers,
}: {
  orderId: string
  status: string
  allowedStatuses: string[]
  paymentStatus: string
  managerId: string
  adminNote: string
  managers: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [nextStatus, setNextStatus] = useState(status)
  const [comment, setComment] = useState("")
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [details, setDetails] = useState({ paymentStatus, managerId, adminNote })
  const [isPending, startTransition] = useTransition()

  const detailsChanged =
    details.paymentStatus !== paymentStatus || details.managerId !== managerId || details.adminNote !== adminNote

  const submitStatus = () => {
    if (nextStatus === "CANCELLED" && !confirmCancel) {
      setConfirmCancel(true)
      return
    }
    startTransition(async () => {
      const result = await changeOrderStatus(orderId, nextStatus, comment)
      setConfirmCancel(false)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`Статус: ${ORDER_STATUS_LABELS[nextStatus]}`)
      setComment("")
      router.refresh()
    })
  }

  const submitDetails = () => {
    startTransition(async () => {
      const result = await updateOrderDetails(orderId, details)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Сохранено")
      router.refresh()
    })
  }

  return (
    <>
      <Card>
        <CardHeader><CardTitle>Статус заказа</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {status === "CANCELLED" ? (
            <p className="text-sm text-gray-500">Заказ отменён. Изменить статус нельзя.</p>
          ) : (
            <>
              <select
                className={selectClass}
                value={nextStatus}
                onChange={(e) => {
                  setNextStatus(e.target.value)
                  setConfirmCancel(false)
                }}
                aria-label="Новый статус"
              >
                {allowedStatuses.map((s) => (
                  <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                ))}
              </select>
              {nextStatus !== status && stockHints[nextStatus] && (
                <p className="text-xs text-gray-500">{stockHints[nextStatus]}</p>
              )}
              <textarea
                className={selectClass}
                rows={2}
                placeholder="Комментарий (виден в истории)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {confirmCancel && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  Отменить заказ? Вернуть его в работу будет нельзя. Нажмите ещё раз для подтверждения.
                </p>
              )}
              <Button
                className="w-full"
                variant={nextStatus === "CANCELLED" ? "destructive" : "default"}
                onClick={submitStatus}
                disabled={isPending || nextStatus === status}
              >
                {confirmCancel ? "Да, отменить заказ" : "Изменить статус"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Оплата и менеджер</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <label className="block text-sm">
            <span className="text-gray-500">Оплата</span>
            <select
              className={selectClass}
              value={details.paymentStatus}
              onChange={(e) => setDetails({ ...details, paymentStatus: e.target.value })}
            >
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-gray-500">Менеджер</span>
            <select
              className={selectClass}
              value={details.managerId}
              onChange={(e) => setDetails({ ...details, managerId: e.target.value })}
            >
              <option value="">Не назначен</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-gray-500">Заметка (видна только сотрудникам)</span>
            <textarea
              className={selectClass}
              rows={3}
              value={details.adminNote}
              onChange={(e) => setDetails({ ...details, adminNote: e.target.value })}
            />
          </label>
          <Button className="w-full" variant="outline" onClick={submitDetails} disabled={isPending || !detailsChanged}>
            Сохранить
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
