import Header from "@/components/shop/Header"
import Footer from "@/components/shop/Footer"
import { getSiteSettings } from "@/lib/settings"

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const site = await getSiteSettings()
  return (
    <>
      <Header phone={site.phone} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
