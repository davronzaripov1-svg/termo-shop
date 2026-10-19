import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Пароль должен быть минимум 8 символов" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Пользователь с таким email уже существует" },
          { status: 400 }
        )
      }
      if (phone && existingUser.phone === phone) {
        return NextResponse.json(
          { error: "Пользователь с таким телефоном уже существует" },
          { status: 400 }
        )
      }
    }

    // Get or create customer role
    let customerRole = await prisma.role.findUnique({
      where: { name: "customer" },
    })

    if (!customerRole) {
      customerRole = await prisma.role.create({
        data: {
          name: "customer",
          displayName: "Покупатель",
          description: "Обычный покупатель магазина",
          permissions: [],
        },
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        roleId: customerRole.id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Ошибка при регистрации" },
      { status: 500 }
    )
  }
}
