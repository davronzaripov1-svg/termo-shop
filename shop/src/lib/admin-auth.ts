import { auth } from "@/lib/auth"

export async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role as string | undefined
  const normalizedRole = role?.toUpperCase()
  if (!session?.user || !normalizedRole || !["SUPER_ADMIN", "ADMIN"].includes(normalizedRole)) {
    return null
  }
  return session
}
