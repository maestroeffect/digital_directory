// cache.js
import { set, get, del, clear, keys } from 'idb-keyval'

export const setCachedNews = async (key, data) => {
  try {
    await set(key, data)
  } catch (e) {
    console.error('Error saving to IndexedDB:', e)
  }
}

export const getCachedNews = async key => {
  try {
    return await get(key)
  } catch (e) {
    console.error('Error retrieving from IndexedDB:', e)

    return null
  }
}

export const deleteCachedNews = async key => {
  try {
    await del(key)
  } catch (e) {
    console.error('Error deleting from IndexedDB:', e)
  }
}

export const clearAllCachedNews = async () => {
  try {
    await clear()
  } catch (e) {
    console.error('Error clearing IndexedDB:', e)
  }
}

export const getAllCacheKeys = async () => {
  try {
    return await keys()
  } catch (e) {
    console.error('Error fetching keys from IndexedDB:', e)

    return []
  }
}

export const assignPerSourceIds = newsArray => {
  const seenSources = {}

  return newsArray.map(news => {
    const source = news.source

    if (!seenSources[source]) seenSources[source] = 1
    const assignedId = seenSources[source]

    seenSources[source] += 1

    return { ...news, id: assignedId }
  })
}
