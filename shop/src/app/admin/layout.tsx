import { redirect } from "next/navigation"
import AdminShell from "@/components/admin/AdminShell"
import { can, getStaff } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // proxy.ts уже отправляет гостей на /login, здесь — основная проверка прав
  const staff = await getStaff()
  if (!staff) {
    redirect("/login?callbackUrl=/admin")
  }

  const newOrders = can(staff, "orders") ? await prisma.order.count({ where: { status: "NEW" } }) : 0

  return (
    <AdminShell
      userName={staff.name}
      roleName={staff.roleDisplayName}
      permissions={staff.permissions}
      newOrders={newOrders}
    >
      {children}
    </AdminShell>
  )
}
