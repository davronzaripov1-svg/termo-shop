import { auth } from "@/lib/auth"

export async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role as string | undefined
  if (!session?.user || !role || !["SUPER_ADMIN", "ADMIN"].includes(role)) {
    return null
  }
  return session
}
