import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Handle POST request to save a bookmark
export async function POST(req) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { newsId, title, content, source, publishedAt } = await req.json()

  if (newsId === null || newsId === undefined || !title || !content || !source || !publishedAt) {
    return NextResponse.json({ error: 'Missing news data' }, { status: 400 })
  }

  try {
    const userId = parseInt(session.user.id, 10)

    // Check if news already exists in DB, otherwise insert it
    let news = await db.news.findUnique({
      where: { id: newsId }
    })

    if (!news) {
      news = await db.news.create({
        data: {
          id: newsId, // Assuming `newsId` is unique from API
          title,
          content,
          source,
          publishedAt: new Date(publishedAt)
        }
      })
    }

    // Save bookmark
    await db.bookmark.create({
      data: { userId, newsId }
    })

    return NextResponse.json({ message: 'Bookmark saved' }, { status: 201 })
  } catch (error) {
    console.error('❌ Bookmark API Error:', error.message)

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Handle DELETE request to remove a bookmark
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newsId } = await req.json()

    if (!newsId) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 })
    }

    const userId = parseInt(session.user.id, 10)

    if (isNaN(userId)) {
      console.error('❌ Invalid User ID:', session.user.id)

      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    console.log('🗑 Deleting Bookmark:', { userId, newsId })

    await db.bookmark.deleteMany({
      where: {
        userId,
        newsId
      }
    })

    console.log('✅ Bookmark deleted successfully')

    return NextResponse.json({ message: 'Bookmark removed' }, { status: 200 })
  } catch (error) {
    console.error('❌ Bookmark API Error:', error)

    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}

// Handle GET request to fetch user's bookmarks
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    console.log('🔍 Session Data:', session)

    if (!session || !session.user?.id) {
      console.error('❌ Unauthorized request - No valid session found.')

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id, 10)

    if (isNaN(userId)) {
      console.error('❌ Invalid User ID:', session.user.id)

      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    console.log('✅ Authenticated User ID:', userId)

    // Fetch bookmarks with the actual news data
    const bookmarks = await db.bookmark.findMany({
      where: { userId },
      include: { news: true } // Fetch the related news data
    })

    console.log('📌 Bookmarks retrieved:', bookmarks)

    return NextResponse.json({ bookmarks }, { status: 200 })
  } catch (error) {
    console.error('❌ Bookmark API Error:', error.message)

    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
