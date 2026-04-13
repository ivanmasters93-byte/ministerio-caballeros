import type { NextAuthConfig } from 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authConfig: any = {
  providers: [],
  callbacks: {
    async jwt({ token, user }: { token: Record<string, unknown>; user?: { role?: string; id?: string } }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: { user?: { role?: string; id?: string } }; token: Record<string, unknown> }) {
      if (session.user) {
        session.user.role = token.role as string | undefined
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}
