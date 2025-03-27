import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { compare } from 'bcryptjs'

import { db } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const existingUser = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!existingUser || !existingUser.password) return null

        const passwordMatch = await compare(credentials.password, existingUser.password)

        if (!passwordMatch) return null

        return {
          id: `${existingUser.id}`,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        let existingUser = await db.user.findUnique({ where: { email: user.email } })

        if (existingUser) {
          // If user exists but has no linked Google account, link it
          const existingAccount = await db.account.findFirst({
            where: { userId: existingUser.id, provider: 'google' }
          })

          if (!existingAccount) {
            await db.account.create({
              data: {
                userId: existingUser.id,
                provider: 'google',
                providerAccountId: account.providerAccountId
              }
            })
          }

          user.id = existingUser.id.toString()
        } else {
          // Create user for new Google sign-in
          existingUser = await db.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              password: null
            }
          })

          await db.account.create({
            data: {
              userId: existingUser.id,
              provider: 'google',
              providerAccountId: account.providerAccountId
            }
          })

          user.id = existingUser.id.toString()
        }
      }

      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }

      if (account?.provider === 'google') {
        token.accessToken = account.access_token
      }

      return token
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id,
          name: token.name,
          email: token.email,
          image: token.picture
        }
      }
    }
  }
}
