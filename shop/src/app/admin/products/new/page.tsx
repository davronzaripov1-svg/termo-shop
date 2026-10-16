import { ProductForm } from "@/components/admin/products/ProductForm"
import { getCategoryOptions } from "@/lib/admin"

export const metadata = { title: "Новый товар" }

export default async function NewProductPage() {
  const categories = await getCategoryOptions()

  return (
    <ProductForm
      categories={categories}
      initial={{
        name: "",
        slug: "",
        sku: "",
        categoryId: "",
        description: "",
        price: "",
        oldPrice: "",
        costPrice: "",
        unit: "шт",
        minQuantity: "1",
        stock: "0",
        reserved: 0,
        lowStockThreshold: "5",
        status: "ACTIVE",
        isActive: true,
        isFeatured: false,
        isNew: true,
        weight: "",
        dimensions: "",
        metaTitle: "",
        metaDescription: "",
        images: [],
        attributes: [],
        variants: [],
      }}
    />
  )
}
