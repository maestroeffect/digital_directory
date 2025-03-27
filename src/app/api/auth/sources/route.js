import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req) {
  try {
    const sources = await db.source.findMany({
      select: { name: true, sourceUrl: true } // Fetch only the names
    })

    return NextResponse.json({ sources }, { status: 200 })
  } catch (error) {
    console.error('❌ Fetch Sources API Error:', error.message)

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
