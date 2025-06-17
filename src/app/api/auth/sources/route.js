import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://app.qubicweb.com' : 'http://localhost:3000'

export async function GET(req) {
  try {
    const sourcesFromDb = await db.source.findMany({
      select: { name: true, sourceUrl: true }
    })

    const sources = sourcesFromDb.map(source => {
      const updatedUrl = source.sourceUrl.replace('http://localhost:3000', BASE_URL)
      return {
        ...source,
        sourceUrl: updatedUrl
      }
    })

    return NextResponse.json({ sources }, { status: 200 })
  } catch (error) {
    console.error('❌ Fetch Sources API Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
