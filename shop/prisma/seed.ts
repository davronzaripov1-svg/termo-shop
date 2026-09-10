import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {},
      create: {
        name: 'SUPER_ADMIN',
        displayName: 'Супер Администратор',
        description: 'Полный доступ ко всем функциям',
        permissions: JSON.stringify(['*']),
      },
    }),
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        displayName: 'Администратор',
        description: 'Управление товарами, заказами и клиентами',
        permissions: JSON.stringify(['products', 'orders', 'customers', 'categories']),
      },
    }),
    prisma.role.upsert({
      where: { name: 'MANAGER' },
      update: {},
      create: {
        name: 'MANAGER',
        displayName: 'Менеджер',
        description: 'Работа с клиентами и заказами',
        permissions: JSON.stringify(['orders', 'customers']),
      },
    }),
    prisma.role.upsert({
      where: { name: 'WAREHOUSE' },
      update: {},
      create: {
        name: 'WAREHOUSE',
        displayName: 'Склад',
        description: 'Комплектация и складской учет',
        permissions: JSON.stringify(['warehouse', 'picking']),
      },
    }),
    prisma.role.upsert({
      where: { name: 'CUSTOMER' },
      update: {},
      create: {
        name: 'CUSTOMER',
        displayName: 'Клиент',
        description: 'Обычный покупатель',
        permissions: JSON.stringify(['shop']),
      },
    }),
  ])

  console.log('Created roles:', roles.map(r => r.name))

  // Create customer groups
  const groups = await Promise.all([
    prisma.customerGroup.upsert({
      where: { name: 'RETAIL' },
      update: {},
      create: {
        name: 'RETAIL',
        displayName: 'Розница',
        discount: 0,
        description: 'Розничные покупатели',
      },
    }),
    prisma.customerGroup.upsert({
      where: { name: 'WHOLESALE' },
      update: {},
      create: {
        name: 'WHOLESALE',
        displayName: 'Оптовый',
        discount: 10,
        description: 'Оптовые покупатели (скидка 10%)',
      },
    }),
    prisma.customerGroup.upsert({
      where: { name: 'VIP' },
      update: {},
      create: {
        name: 'VIP',
        displayName: 'VIP',
        discount: 15,
        description: 'VIP клиенты (скидка 15%)',
      },
    }),
    prisma.customerGroup.upsert({
      where: { name: 'DEALER' },
      update: {},
      create: {
        name: 'DEALER',
        displayName: 'Дилер',
        discount: 20,
        description: 'Дилеры (скидка 20%)',
      },
    }),
  ])

  console.log('Created customer groups:', groups.map(g => g.name))

  // Create super admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const superAdminRole = roles.find(r => r.name === 'SUPER_ADMIN')!

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shop.uz' },
    update: {},
    create: {
      email: 'admin@shop.uz',
      phone: '+998901234567',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      roleId: superAdminRole.id,
      emailVerified: new Date(),
    },
  })

  console.log('Created admin user:', admin.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'termotransfers' },
      update: {},
      create: {
        name: 'Термотрансферы',
        slug: 'termotransfers',
        description: 'Термотрансферная печать на ткань',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'vinyl' },
      update: {},
      create: {
        name: 'Виниловые наклейки',
        slug: 'vinyl',
        description: 'Виниловые пленки и наклейки',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'dtf' },
      update: {},
      create: {
        name: 'DTF печать',
        slug: 'dtf',
        description: 'Пленки и порошок для DTF печати',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'uv-dtf' },
      update: {},
      create: {
        name: 'UV DTF',
        slug: 'uv-dtf',
        description: 'UV DTF стикеры и материалы',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'materials' },
      update: {},
      create: {
        name: 'Расходные материалы',
        slug: 'materials',
        description: 'Чернила, порошки, пленки',
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'equipment' },
      update: {},
      create: {
        name: 'Оборудование',
        slug: 'equipment',
        description: 'Термопрессы и принтеры',
        sortOrder: 6,
      },
    }),
  ])

  console.log('Created categories:', categories.map(c => c.name))

  // Create sample products
  const termoCategory = categories.find(c => c.slug === 'termotransfers')!
  const vinylCategory = categories.find(c => c.slug === 'vinyl')!
  const dtfCategory = categories.find(c => c.slug === 'dtf')!

  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'TT-001' },
      update: {},
      create: {
        name: 'Термотрансфер Premium A4',
        slug: 'termotransfer-premium-a4',
        sku: 'TT-001',
        description: 'Высококачественный термотрансфер для светлых тканей',
        price: 15000,
        oldPrice: 20000,
        stock: 100,
        categoryId: termoCategory.id,
        isFeatured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'VN-002' },
      update: {},
      create: {
        name: 'Виниловая пленка глянцевая',
        slug: 'vinilovaya-plenka-glyantsevaya',
        sku: 'VN-002',
        description: 'Глянцевая виниловая пленка 50см x 25м',
        price: 85000,
        stock: 50,
        categoryId: vinylCategory.id,
        isNew: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'DTF-003' },
      update: {},
      create: {
        name: 'DTF пленка рулон 60см',
        slug: 'dtf-plenka-rulon-60cm',
        sku: 'DTF-003',
        description: 'DTF пленка для печати 60см x 100м',
        price: 350000,
        oldPrice: 420000,
        stock: 30,
        categoryId: dtfCategory.id,
      },
    }),
  ])

  console.log('Created products:', products.map(p => p.name))

  // Create settings
  await prisma.setting.upsert({
    where: { key: 'site' },
    update: {},
    create: {
      key: 'site',
      value: {
        name: 'Termo stik',
        description: 'Термотрансферы, виниловые наклейки, DTF и UV DTF печать',
        phone: '+998 90 123 45 67',
        email: 'info@termostik.uz',
        telegram: '@termostik',
        address: 'г. Ташкент, ул. Примерная, 123',
        workingHours: 'Пн-Сб: 9:00 - 18:00',
      },
    },
  })

  console.log('Created settings')

  // Create static pages
  const pages = await Promise.all([
    prisma.page.upsert({
      where: { slug: 'about' },
      update: {},
      create: {
        slug: 'about',
        title: 'О компании',
        content: '<h1>О нашей компании</h1><p>Мы работаем с 2020 года и предлагаем качественные товары по доступным ценам.</p>',
      },
    }),
    prisma.page.upsert({
      where: { slug: 'delivery' },
      update: {},
      create: {
        slug: 'delivery',
        title: 'Доставка и оплата',
        content: '<h1>Доставка</h1><p>Бесплатная доставка при заказе от 500 000 сум.</p><h2>Оплата</h2><p>Наличные, банковские карты, рассрочка.</p>',
      },
    }),
    prisma.page.upsert({
      where: { slug: 'contacts' },
      update: {},
      create: {
        slug: 'contacts',
        title: 'Контакты',
        content: '<h1>Контакты</h1><p>Телефон: +998 90 123 45 67</p><p>Email: info@shop.uz</p>',
      },
    }),
  ])

  console.log('Created pages:', pages.map(p => p.slug))

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
