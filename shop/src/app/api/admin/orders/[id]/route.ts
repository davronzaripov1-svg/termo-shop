import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: { include: { images: { take: 1 } } } } },
      statusHistory: { orderBy: { createdAt: "desc" } },
      address: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: body.status,
        paymentStatus: body.paymentStatus,
        adminNote: body.adminNote,
        ...(body.status === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
    })

    // Add status history
    if (body.status) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: body.status,
          comment: body.statusComment || null,
        },
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Update order failed:", error)
    return NextResponse.json({ error: "Не удалось обновить заказ" }, { status: 500 })
  }
}
