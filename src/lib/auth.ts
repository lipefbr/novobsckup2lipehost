import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-mail e senha são obrigatórios')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user) {
          throw new Error('Usuário não encontrado')
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) {
          throw new Error('Senha incorreta')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Cloudflare handles HTTPS on frontend; VPS is HTTP behind proxy
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in — save user data to token
      if (user) {
        token.role = (user as { role?: string }).role ?? 'USER'
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      // Update — when client calls updateSession({ user: { name: 'new name' } })
      // This refreshes the token with new data from the client
      if (trigger === 'update' && session) {
        if (session.user?.name) {
          token.name = session.user.name
        }
        if (session.user?.image) {
          token.picture = session.user.image
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Always sync from token — guarantees name is fresh even after profile edit
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { id?: string }).id = token.id as string
        if (token.name) {
          session.user.name = token.name as string
        }
        if (token.email) {
          session.user.email = token.email as string
        }
        if (token.picture) {
          session.user.image = token.picture as string | null
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
