import { requirePagePermission } from "@/lib/admin"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requirePagePermission("customers")
  return children
}
