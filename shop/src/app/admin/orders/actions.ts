"use server"

import { OrderStatus, PaymentStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { adminAction, logActivity, type ActionResult } from "@/lib/admin"
import { OrderTransitionError, transitionOrder } from "@/lib/orders"

function refresh(orderId: string) {
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin", "layout") // счётчик новых заказов в шапке
}

export async function changeOrderStatus(orderId: string, status: string, comment: string): Promise<ActionResult> {
  return adminAction("orders", async (staff) => {
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      return { ok: false, error: "Неизвестный статус" }
    }
    try {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUniqueOrThrow({
          where: { id: orderId },
          select: { id: true, orderNumber: true, status: true },
        })
        await transitionOrder(tx, order, status as OrderStatus, staff.id, comment.trim())
      })
    } catch (error) {
      if (error instanceof OrderTransitionError) return { ok: false, error: error.message }
      throw error
    }
    await logActivity(staff.id, "order.status", "Order", orderId, { newData: { status } })
    refresh(orderId)
    return { ok: true }
  })
}

export async function updateOrderDetails(
  orderId: string,
  data: { paymentStatus: string; managerId: string; adminNote: string }
): Promise<ActionResult> {
  return adminAction("orders", async (staff) => {
    if (!Object.values(PaymentStatus).includes(data.paymentStatus as PaymentStatus)) {
      return { ok: false, error: "Неизвестный статус оплаты" }
    }
    if (data.managerId) {
      const manager = await prisma.user.findFirst({
        where: { id: data.managerId, isActive: true, role: { name: { not: "CUSTOMER" } } },
        select: { id: true },
      })
      if (!manager) return { ok: false, error: "Сотрудник не найден" }
    }

    const before = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { paymentStatus: true, managerId: true, adminNote: true },
    })
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: data.paymentStatus as PaymentStatus,
        managerId: data.managerId || null,
        adminNote: data.adminNote.trim() || null,
      },
    })
    await logActivity(staff.id, "order.update", "Order", orderId, { oldData: before, newData: data })
    refresh(orderId)
    return { ok: true }
  })
}
