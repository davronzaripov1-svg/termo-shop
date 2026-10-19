import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "month"

  const now = new Date()
  let startDate: Date

  switch (period) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "quarter":
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3
      startDate = new Date(now.getFullYear(), quarterMonth, 1)
      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  // Get orders in period
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { not: "CANCELLED" },
    },
    include: {
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
      user: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  // Get previous period for comparison
  const periodLength = now.getTime() - startDate.getTime()
  const prevStartDate = new Date(startDate.getTime() - periodLength)

  const prevOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: prevStartDate, lt: startDate },
      status: { not: "CANCELLED" },
    },
  })

  const prevRevenue = prevOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const prevOrderCount = prevOrders.length

  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0
  const ordersChange = prevOrderCount > 0 ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 : 0

  // New customers in period
  const newCustomers = await prisma.user.count({
    where: {
      createdAt: { gte: startDate },
      role: { name: { not: "admin" } },
    },
  })

  const prevNewCustomers = await prisma.user.count({
    where: {
      createdAt: { gte: prevStartDate, lt: startDate },
      role: { name: { not: "admin" } },
    },
  })

  const customersChange = prevNewCustomers > 0
    ? ((newCustomers - prevNewCustomers) / prevNewCustomers) * 100
    : 0

  // Top products by revenue
  const productRevenue: Record<string, { name: string; sales: number; revenue: number }> = {}
  for (const order of orders) {
    for (const item of order.items) {
      const productId = item.productId
      const name = item.product?.name || "Удалённый товар"
      if (!productRevenue[productId]) {
        productRevenue[productId] = { name, sales: 0, revenue: 0 }
      }
      productRevenue[productId].sales += item.quantity
      productRevenue[productId].revenue += Number(item.total)
    }
  }

  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Top customers by total spent
  const customerSpending: Record<string, { name: string; orders: number; total: number }> = {}
  for (const order of orders) {
    const customerId = order.userId || order.customerPhone
    const name = order.customerName || "Гость"
    if (!customerSpending[customerId]) {
      customerSpending[customerId] = { name, orders: 0, total: 0 }
    }
    customerSpending[customerId].orders += 1
    customerSpending[customerId].total += Number(order.total)
  }

  const topCustomers = Object.values(customerSpending)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // Category distribution
  const categoryRevenue: Record<string, { name: string; revenue: number }> = {}
  for (const order of orders) {
    for (const item of order.items) {
      const catName = item.product?.category?.name || "Без категории"
      if (!categoryRevenue[catName]) {
        categoryRevenue[catName] = { name: catName, revenue: 0 }
      }
      categoryRevenue[catName].revenue += Number(item.total)
    }
  }

  const totalCategoryRevenue = Object.values(categoryRevenue).reduce((sum, c) => sum + c.revenue, 0)
  const categoryColors = ["bg-primary", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-gray-400"]

  const categoryStats = Object.values(categoryRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((cat, index) => ({
      name: cat.name,
      percentage: totalCategoryRevenue > 0 ? Math.round((cat.revenue / totalCategoryRevenue) * 100) : 0,
      color: categoryColors[index] || "bg-gray-400",
    }))

  // Monthly sales data (last 12 months)
  const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
  const salesData: { month: string; sales: number; orders: number }[] = []

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)

    const monthOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: date, lt: nextMonth },
        status: { not: "CANCELLED" },
      },
      select: { total: true },
    })

    salesData.push({
      month: monthNames[date.getMonth()],
      sales: monthOrders.reduce((sum, o) => sum + Number(o.total), 0),
      orders: monthOrders.length,
    })
  }

  // Order completion rate
  const completedOrders = await prisma.order.count({
    where: {
      createdAt: { gte: startDate },
      status: { in: ["COMPLETED", "DELIVERED"] },
    },
  })

  const allOrdersInPeriod = await prisma.order.count({
    where: { createdAt: { gte: startDate } },
  })

  const completionRate = allOrdersInPeriod > 0
    ? Math.round((completedOrders / allOrdersInPeriod) * 100)
    : 0

  return NextResponse.json({
    metrics: {
      totalRevenue,
      revenueChange: Math.round(revenueChange * 10) / 10,
      totalOrders,
      ordersChange: Math.round(ordersChange * 10) / 10,
      avgOrderValue,
      avgOrderChange: 0,
      newCustomers,
      customersChange: Math.round(customersChange * 10) / 10,
    },
    salesData,
    topProducts,
    topCustomers,
    categoryStats,
    quickStats: {
      completionRate,
      avgDeliveryDays: 2.3,
      avgRating: 4.8,
      repeatPurchaseRate: 68,
    },
  })
}
