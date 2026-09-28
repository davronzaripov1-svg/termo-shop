import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { ensureDesignFolder } from "@/lib/google-drive"

function serializeDesign(design: any) {
  return {
    ...design,
    files: (design.files || []).map((file: any) => ({
      ...file,
      sizeBytes: Number(file.sizeBytes),
    })),
  }
}

function cleanCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 20)
}

function typePrefix(designType: string) {
  const value = designType.toUpperCase().replace(/_/g, "-")
  if (value === "UV" || value === "UV-DTF") return "UV"
  if (value === "DTF") return "DTF"
  if (value === "3D") return "3D"
  return cleanCode(value).slice(0, 4) || "DSN"
}

async function nextCode(designType: string, seriesCode: string) {
  const prefix = `${typePrefix(designType)}-${cleanCode(seriesCode)}-`
  const rows = await prisma.design.findMany({
    where: { code: { startsWith: prefix } },
    select: { code: true },
  })
  let max = 0
  for (const row of rows) {
    const n = Number(row.code.split("-").at(-1))
    if (Number.isFinite(n)) max = Math.max(max, n)
  }
  return `${prefix}${String(max + 1).padStart(3, "0")}`
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() || ""
  const designType = searchParams.get("type")?.trim() || ""

  const items = await prisma.design.findMany({
    where: {
      ...(designType ? { designType } : {}),
      ...(q ? {
        OR: [
          { code: { contains: q, mode: "insensitive" } },
          { title: { contains: q, mode: "insensitive" } },
          { series: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: { files: { orderBy: [{ isCurrent: "desc" }, { version: "desc" }] } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(items.map(serializeDesign))
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const title = String(body.title || "").trim()
    const series = String(body.series || "").trim()
    const seriesCode = cleanCode(String(body.seriesCode || ""))
    const designType = String(body.designType || "UV-DTF").trim().toUpperCase()

    if (!title || !series || seriesCode.length < 2) {
      return NextResponse.json({ error: "Заполните название, серию и код серии" }, { status: 400 })
    }

    const code = await nextCode(designType, seriesCode)
    const driveFolderId = await ensureDesignFolder(designType, code)

    const item = await prisma.design.create({
      data: {
        code,
        title,
        series,
        seriesCode,
        designType,
        storageLocation: body.storageLocation ? String(body.storageLocation) : null,
        driveFolderId,
      },
      include: { files: true },
    })

    return NextResponse.json(serializeDesign(item), { status: 201 })
  } catch (error) {
    console.error("Create design failed:", error)
    return NextResponse.json({ error: "Не удалось создать дизайн" }, { status: 500 })
  }
}
