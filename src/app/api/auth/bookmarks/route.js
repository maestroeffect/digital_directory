import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Handle POST request to save a bookmark
export async function POST(req) {
  // try {
  //   const body = await req.json() // Await req.json() once
  //   console.log('📩 Incoming Request Data:', body) // Log the full request body

  //   return NextResponse.json({ message: 'Check your server logs for the request body.' })
  // } catch (error) {
  //   console.error('❌ Error reading request JSON:', error)
  //   return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  // }
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { newsId, title, content, source, newsUrl, sourceUrl, publishedAt } = await req.json()

  if (
    newsId === null ||
    newsId === undefined ||
    !title ||
    !content ||
    !newsUrl ||
    !sourceUrl ||
    !source ||
    !publishedAt
  ) {
    return NextResponse.json({ error: 'Missing news data' }, { status: 400 })
  }

  try {
    const userId = parseInt(session.user.id, 10)

    // 🔹 Find or create the source
    let sourceRecord = await db.source.findUnique({
      where: { name: source }
    })

    if (!sourceRecord) {
      sourceRecord = await db.source.create({
        data: { name: source, sourceUrl: sourceUrl }
      })
    }

    // 🔹 Find or create the news item in the specific source
    let news = await db.news.findFirst({
      where: {
        title,
        sourceId: sourceRecord.id // Ensure news is unique per source
      }
    })

    if (!news) {
      news = await db.news.create({
        data: {
          title,
          content,
          url: newsUrl,
          sourceId: sourceRecord.id,
          publishedAt: new Date(publishedAt)
        }
      })
    }

    console.log('📰 News Found/Created:', news.id)

    // Save bookmark
    await db.bookmark.create({
      data: {
        userId,
        newsId: news.id,
        sourceId: news.sourceId // use sourceId here
        // user: { connect: { id: userId } } // Connecting the user with the bookmark
      }
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
        news: true // Fetch related news data
      }
    })

    console.log('📌 Bookmarks retrieved:', bookmarks)

    return NextResponse.json({ bookmarks }, { status: 200 })
  } catch (error) {
    console.error('❌ Bookmark API Error:', error.message)

    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
