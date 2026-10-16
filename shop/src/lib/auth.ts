import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { isStaffRole } from "./roles"

/** Пароль верный, но аккаунт заблокирован — показываем это, а не «неверный пароль» */
export class AccountBlockedError extends CredentialsSignin {
  code = "blocked"
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        login: { label: "Email или телефон", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const login = String(credentials?.login ?? "").trim()
        const password = String(credentials?.password ?? "")
        if (!login || !password) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: login.includes("@")
            ? { email: login.toLowerCase() }
            : { phone: normalizePhone(login) },
          include: { role: true },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
          return null
        }
        if (!user.isActive) {
          throw new AccountBlockedError()
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
          role: user.role.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})

/** Сессия сотрудника или null — для проверок в серверном коде и API. */
export async function getStaffSession() {
  const session = await auth()
  return session?.user && isStaffRole(session.user.role) ? session : null
}

/** "+998 90 123-45-67" -> "+998901234567" */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits ? `+${digits}` : ""
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
