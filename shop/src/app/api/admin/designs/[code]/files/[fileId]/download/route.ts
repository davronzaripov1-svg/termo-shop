import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { downloadDesignFile } from "@/lib/google-drive"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string; fileId: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { code, fileId } = await params

  const stored = await prisma.designFile.findFirst({
    where: { id: fileId, design: { code: code.toUpperCase() } },
  })
  if (!stored) return NextResponse.json({ error: "File not found" }, { status: 404 })

  const upstream = await downloadDesignFile(stored.driveFileId)
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Google Drive download failed" }, { status: 502 })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": stored.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${stored.filename.replace(/"/g, "")}"`,
    },
  })
}
