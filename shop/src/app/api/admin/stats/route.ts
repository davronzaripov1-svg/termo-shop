import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get counts
  const [
    totalOrders,
    todayOrders,
    monthOrders,
    newOrders,
    totalProducts,
    activeProducts,
    lowStockProducts,
    totalCustomers,
    todayCustomers,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
    prisma.user.count({ where: { role: { name: { not: "admin" } } } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart }, role: { name: { not: "admin" } } } }),
  ])

  // Get revenue
  const revenueResult = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { not: "CANCELLED" } },
  })
  const totalRevenue = Number(revenueResult._sum.total || 0)

  const monthRevenueResult = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { not: "CANCELLED" }, createdAt: { gte: monthStart } },
  })
  const monthRevenue = Number(monthRevenueResult._sum.total || 0)

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      total: true,
      status: true,
      createdAt: true,
    },
  })

  // Low stock products
  const lowStock = await prisma.product.findMany({
    where: { stock: { lte: 5 }, isActive: true },
    take: 5,
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      images: { take: 1, select: { url: true } },
    },
    orderBy: { stock: "asc" },
  })

  return NextResponse.json({
    stats: {
      totalOrders,
      todayOrders,
      monthOrders,
      newOrders,
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalCustomers,
      todayCustomers,
      totalRevenue,
      monthRevenue,
    },
    recentOrders,
    lowStock,
  })
}
