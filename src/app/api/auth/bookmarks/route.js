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

  const { newsUuid, newsId, title, content, source, newsUrl, sourceUrl, publishedAt } = await req.json()

  if (!newsUuid || !newsId || !title || !content || !newsUrl || !sourceUrl || !source || !publishedAt) {
    return NextResponse.json({ error: 'Missing news data' }, { status: 400 })
  }

  try {
    const userId = parseInt(session.user.id, 10)

    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const sourceRecord = await db.source.upsert({
      where: { name: source },
      update: {},
      create: { name: source, sourceUrl }
    })

    // Ensure the news entry is unique per source
    let news = await db.news.upsert({
      where: {
        newsId_sourceId: {
          newsId: newsId, // Ensure uniqueness with source
          sourceId: sourceRecord.id
        }
      },
      update: {
        title,
        content,
        url: newsUrl,
        publishedAt: new Date(publishedAt)
      },
      create: {
        newsId,
        uuid: newsUuid,
        title,
        content,
        url: newsUrl,
        sourceId: sourceRecord.id,
        publishedAt: new Date(publishedAt)
      }
    })

    const existingBookmark = await db.bookmark.findFirst({
      where: {
        userId,
        newsId: newsId,
        sourceId: news.sourceId
      }
    })

    if (existingBookmark) {
      return NextResponse.json({ message: 'Bookmark already exists' }, { status: 200 })
    }

    await db.bookmark.create({
      data: {
        userId,
        newsId: newsId,
        sourceId: news.sourceId,
        uuid: newsUuid
      }
    })

    return NextResponse.json({ message: 'Bookmark saved' }, { status: 201 })
  } catch (error) {
    console.error('❌ Bookmark API Error:', error.message)

    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const newsId = searchParams.get('newsId')
    const newsUuid = searchParams.get('newsUuid')
    const source = searchParams.get('source')

    if (!newsId || !source) {
      return NextResponse.json({ error: 'Missing newsId or source' }, { status: 400 })
    }

    const userId = parseInt(session.user.id, 10)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const sourceRecord = await db.source.findUnique({
      where: { name: source }
    })

    if (!sourceRecord) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    const news = await db.news.findFirst({
      where: {
        uuid: newsUuid,
        sourceId: sourceRecord.id
      }
    })

    if (!news) {
      return NextResponse.json({ error: 'News not found for this source' }, { status: 404 })
    }

    await db.bookmark.deleteMany({
      where: {
        userId,
        uuid: newsUuid,
        sourceId: sourceRecord.id
      }
    })

    return NextResponse.json({ message: 'Bookmark removed' }, { status: 200 })
  } catch (error) {
    console.error('❌ Bookmark DELETE Error:', error)

    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}

// Handle GET request to fetch user's bookmarks
// Handle GET request to fetch user's bookmarks
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    // console.log('🔍 Session Data:', session)

    if (!session || !session.user?.id) {
      console.error('❌ Unauthorized request - No valid session found.')

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id, 10)

    if (isNaN(userId)) {
      console.error('❌ Invalid User ID:', session.user.id)

      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Extract source from query params
    const { searchParams } = new URL(req.url)
    const sourceName = searchParams.get('source')

    if (!sourceName) {
      return NextResponse.json({ error: 'Source name is required' }, { status: 400 })
    }

    // Fetch the source record
    const sourceRecord = await db.source.findUnique({
      where: { name: sourceName }
    })

    if (!sourceRecord) {
      return NextResponse.json({ bookmarks: [] }, { status: 200 }) // No bookmarks if source doesn't exist
    }

    // Fetch all bookmarks for the user, including the related news and source info
    const bookmarks = await db.bookmark.findMany({
      where: {
        userId,
        sourceId: sourceRecord.id
      },
      include: {
        news: {
          select: {
            uuid: true,
            title: true,
            content: true,
            url: true,
            publishedAt: true

            // Add anything else needed
          }
        }
      }
    })

    console.log('📌 Bookmarks retrieved:', bookmarks)

    return NextResponse.json({ bookmarks }, { status: 200 })
  } catch (error) {
    console.error('❌ Bookmark API Error:', error.message)

    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
