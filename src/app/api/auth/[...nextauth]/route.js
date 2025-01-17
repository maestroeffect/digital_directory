import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],

  callbacks: {
    async jwt(token, user, account, profile, isNewUser) {
      if (user) {
        token.id = user.id
      }

      return token
    },

    async session(session, token) {
      session.user = token.id

      return session
    }
  },

  // A database is required to persist users across multiple sessions
  database: process.env.DATABASE_URL
})
