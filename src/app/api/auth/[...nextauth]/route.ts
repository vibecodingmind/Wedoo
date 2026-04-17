import NextAuth, { type DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role?: string
    }
  }
  interface User {
    id: string
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: string
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
        })
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.email = dbUser.email
          session.user.name = dbUser.name
          session.user.image = dbUser.avatar
          session.user.role = dbUser.role
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'wedoo-demo-secret-change-in-production',
})

export { handler as GET, handler as POST }
