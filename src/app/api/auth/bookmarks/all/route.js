import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/auth/bookmarks/all
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id, 10)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const bookmarks = await db.bookmark.findMany({
      where: { userId },
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
        }
      }
    })

    return NextResponse.json({ bookmarks }, { status: 200 })
  } catch (error) {
    console.error('❌ Error fetching all bookmarks:', error)

    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
