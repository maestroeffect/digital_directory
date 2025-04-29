import { NextResponse } from 'next/server'

import { db } from '@/lib/db'

// GET /api/auth/bookmarks/all
export async function GET() {
  try {
    const bookmarks = await db.bookmark.findMany({
      include: {
        news: {
          select: {
            uuid: true,
            title: true,
            content: true,
            url: true,
            publishedAt: true
          }
        },
        source: {
          select: {
            name: true,
            sourceUrl: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ bookmarks }, { status: 200 })
  } catch (error) {
    console.error('❌ Error fetching all bookmarks:', error)

    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
