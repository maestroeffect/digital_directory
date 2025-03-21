import { NextResponse } from 'next/server'

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

import { authOptions } from '@/lib/auth'

// const prisma = new PrismaClient()

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
