"use server"

import { AuthError, CredentialsSignin } from "next-auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth, signIn, signOut, hashPassword, normalizePhone, verifyPassword } from "@/lib/auth"
import { CUSTOMER_ROLE, isStaffRole } from "@/lib/roles"

export type AuthFormState = {
  error?: string
  fieldErrors?: Record<string, string>
  // React очищает форму после отправки — возвращаем введённое (без паролей), чтобы заполнить заново
  values?: Record<string, string>
} | undefined

function formValues(formData: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, String(formData.get(key) ?? "")]))
}

/** Разрешаем возвращаться только на свои страницы, чтобы ссылка не уводила на чужой сайт. */
function safeCallbackUrl(value: FormDataEntryValue | null): string | null {
  const url = typeof value === "string" ? value : ""
  return url.startsWith("/") && !url.startsWith("//") ? url : null
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const loginValue = String(formData.get("login") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  try {
    await signIn("credentials", { login: loginValue, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: error instanceof CredentialsSignin && error.code === "blocked"
          ? "Аккаунт заблокирован. Свяжитесь с магазином."
          : error.type === "CredentialsSignin"
            ? "Неверный email/телефон или пароль"
            : "Не удалось войти, попробуйте ещё раз",
        values: { login: loginValue },
      }
    }
    throw error
  }

  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"))
  if (callbackUrl) {
    redirect(callbackUrl)
  }

  const user = await prisma.user.findFirst({
    where: loginValue.includes("@")
      ? { email: loginValue.toLowerCase() }
      : { phone: normalizePhone(loginValue) },
    select: { role: { select: { name: true } } },
  })
  redirect(isStaffRole(user?.role.name) ? "/admin" : "/")
}

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Укажите имя"),
    lastName: z.string().trim().optional(),
    phone: z
      .string()
      .transform(normalizePhone)
      .refine((v) => /^\+\d{9,15}$/.test(v), "Неверный номер телефона"),
    email: z.string().trim().toLowerCase().pipe(z.email("Неверный email")),
    password: z.string().min(8, "Минимум 8 символов"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Пароли не совпадают",
  })

export async function register(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = formValues(formData, ["firstName", "lastName", "phone", "email"])

  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0])
      fieldErrors[key] ??= issue.message
    }
    return { fieldErrors, values }
  }

  const { firstName, lastName, phone, email, password } = parsed.data

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
    select: { email: true },
  })
  if (existing) {
    return existing.email === email
      ? { fieldErrors: { email: "Этот email уже зарегистрирован" }, values }
      : { fieldErrors: { phone: "Этот телефон уже зарегистрирован" }, values }
  }

  const customerRole = await prisma.role.findUnique({ where: { name: CUSTOMER_ROLE } })
  if (!customerRole) {
    return { error: "Регистрация временно недоступна", values }
  }

  await prisma.user.create({
    data: {
      firstName,
      lastName: lastName || null,
      phone,
      email,
      password: await hashPassword(password),
      roleId: customerRole.id,
    },
  })

  await signIn("credentials", { login: email, password, redirect: false })
  redirect("/")
}

export async function logout() {
  await signOut({ redirectTo: "/" })
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Введите текущий пароль"),
    newPassword: z.string().min(8, "Минимум 8 символов"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Пароли не совпадают" })

export type PasswordFormState = { error?: string; fieldErrors?: Record<string, string>; success?: boolean } | undefined

export async function changePassword(_prev: PasswordFormState, formData: FormData): Promise<PasswordFormState> {
  const session = await auth()
  if (!session?.user) return { error: "Войдите в аккаунт" }

  const parsed = passwordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message
    return { fieldErrors }
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } })
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.password))) {
    return { fieldErrors: { currentPassword: "Неверный текущий пароль" } }
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: await hashPassword(parsed.data.newPassword) },
  })
  return { success: true }
}
