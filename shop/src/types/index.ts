import type { User, Role, Product, Category, Order, OrderItem } from '@prisma/client'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}

export type SafeUser = Omit<User, 'password'>

export interface ProductWithRelations extends Product {
  category: Category
  images: { id: string; url: string; isMain: boolean }[]
}

export interface OrderWithRelations extends Order {
  items: OrderItem[]
  user: SafeUser
}

export interface CategoryWithChildren extends Category {
  children: Category[]
  parent: Category | null
  _count?: { products: number }
}

export type OrderStatusType =
  | 'NEW'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PICKING'
  | 'READY'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'

export const ORDER_STATUS_LABELS: Record<OrderStatusType, string> = {
  NEW: 'Новый',
  CONFIRMED: 'Подтвержден',
  PROCESSING: 'В обработке',
  PICKING: 'Комплектуется',
  READY: 'Готов',
  SHIPPING: 'Доставка',
  DELIVERED: 'Доставлен',
  COMPLETED: 'Завершен',
  CANCELLED: 'Отменен',
}

export const ORDER_STATUS_COLORS: Record<OrderStatusType, string> = {
  NEW: 'bg-blue-500',
  CONFIRMED: 'bg-indigo-500',
  PROCESSING: 'bg-yellow-500',
  PICKING: 'bg-orange-500',
  READY: 'bg-teal-500',
  SHIPPING: 'bg-purple-500',
  DELIVERED: 'bg-green-500',
  COMPLETED: 'bg-green-700',
  CANCELLED: 'bg-red-500',
}

export type PaymentStatusType = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'FAILED'

export const PAYMENT_STATUS_LABELS: Record<PaymentStatusType, string> = {
  PENDING: 'Ожидает',
  PAID: 'Оплачен',
  PARTIAL: 'Частично',
  REFUNDED: 'Возврат',
  FAILED: 'Ошибка',
}
