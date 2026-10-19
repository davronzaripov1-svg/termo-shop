import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || ""
  const q = searchParams.get("q") || ""

  // Build where clause
  const where: any = {}

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ]
  }

  if (status === "low") {
    where.stock = { gt: 0, lte: 5 }
    where.isActive = true
  } else if (status === "out") {
    where.stock = 0
    where.isActive = true
  } else if (status === "normal") {
    where.stock = { gt: 5 }
    where.isActive = true
  }

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      isActive: true,
      category: { select: { name: true } },
      images: { take: 1, select: { url: true } },
    },
    orderBy: { stock: "asc" },
    take: 100,
  })

  // Calculate stats
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { stock: true },
  })

  const totalStock = allProducts.reduce((sum, p) => sum + p.stock, 0)
  const lowStockCount = allProducts.filter((p) => p.stock > 0 && p.stock <= 5).length
  const outOfStockCount = allProducts.filter((p) => p.stock === 0).length

  // Map products to stock items format
  const stockItems = products.map((p) => ({
    id: p.id,
    sku: p.sku || `SKU-${p.id.slice(0, 6)}`,
    name: p.name,
    category: p.category?.name || "Без категории",
    stock: p.stock,
    reserved: 0, // TODO: Calculate from pending orders
    available: p.stock,
    minStock: 5,
    maxStock: 100,
    image: p.images?.[0]?.url,
    status: p.stock === 0 ? "out" : p.stock <= 5 ? "low" : "normal",
  }))

  return NextResponse.json({
    items: stockItems,
    stats: {
      totalStock,
      reserved: 0,
      lowStockCount,
      outOfStockCount,
    },
  })
}

// Update stock
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { productId, type, quantity, note } = body

  if (!productId || !type || !quantity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  let newStock = product.stock

  if (type === "in") {
    newStock = product.stock + quantity
  } else if (type === "out") {
    if (product.stock < quantity) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 })
    }
    newStock = product.stock - quantity
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { stock: newStock },
  })

  return NextResponse.json({
    success: true,
    product: {
      id: updated.id,
      name: updated.name,
      stock: updated.stock,
    },
  })
}
