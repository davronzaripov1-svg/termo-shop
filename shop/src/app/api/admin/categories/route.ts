import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100) + "-" + Date.now().toString(36)
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      children: {
        include: {
          _count: { select: { products: true } },
        },
      },
    },
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  })

  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const name = String(body.name || "").trim()

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: generateSlug(name),
        description: body.description || null,
        image: body.image || null,
        parentId: body.parentId || null,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Create category failed:", error)
    return NextResponse.json({ error: "Не удалось создать категорию" }, { status: 500 })
  }
}
