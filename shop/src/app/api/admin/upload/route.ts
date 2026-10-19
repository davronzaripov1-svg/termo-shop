import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { uploadImage } from "@/lib/google-drive"

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate image type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const result = await uploadImage(file, filename)

    return NextResponse.json({
      id: result.id,
      url: result.directUrl,
    })
  } catch (error) {
    console.error("Upload failed:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
