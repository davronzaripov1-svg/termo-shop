import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { isStaffRole } from "@/lib/roles"

// Быстрая проверка перед /admin. Полная проверка прав — в admin/layout.tsx и в API.
export default auth((req) => {
  const user = req.auth?.user

  if (!user) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  if (!isStaffRole(user.role)) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"],
}
