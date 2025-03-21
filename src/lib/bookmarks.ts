import { db } from './db'

// lib/bookmarks.ts

/**
 * Saves a bookmark for the user if it does not already exist.
 * @param userId - The ID of the user.
 * @param newsId - The ID of the news article.
 * @returns The created bookmark.
 * @throws Error if the bookmark already exists or if an error occurs.
 */
export const saveBookmark = async (userId: number, newsId: number) => {
  try {
    const existingBookmark = await db.bookmark.findUnique({
      where: { userId_newsId: { userId, newsId } }
    })

    if (existingBookmark) {
      throw new Error('Bookmark already exists.')
    }

    return await db.bookmark.create({
      data: { userId, newsId }
    })
  } catch (error) {
    console.error('Error saving bookmark:', error)
    throw new Error('Failed to save bookmark.')
  }
}

/**
 * Removes a bookmark for the user if it exists.
 * @param userId - The ID of the user.
 * @param newsId - The ID of the news article.
 * @returns A success message if removed.
 * @throws Error if the bookmark is not found or if an error occurs.
 */
export const removeBookmark = async (userId: number, newsId: number) => {
  try {
    const existingBookmark = await db.bookmark.findUnique({
      where: { userId_newsId: { userId, newsId } }
    })

    if (!existingBookmark) {
      throw new Error('Bookmark not found.')
    }

    await db.bookmark.delete({
      where: { userId_newsId: { userId, newsId } }
    })

    return { message: 'Bookmark removed successfully.' }
  } catch (error) {
    console.error('Error removing bookmark:', error)
    throw new Error('Failed to remove bookmark.')
  }
}
