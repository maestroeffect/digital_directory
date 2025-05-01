import { openDB } from 'idb'
import { del } from 'idb-keyval'

const DB_NAME = 'newsCacheDB'
const STORE_NAME = 'newsDataStore'
const CACHE_KEY = 'newsItems'
const ONE_DAY = 24 * 60 * 60 * 1000 // 1 day in milliseconds

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME)

        store.put({ data: [], timestamp: 0 }, CACHE_KEY)
      }
    }
  })
}

export const getCachedNews = key => {
  if (typeof window === 'undefined') return null

  const cached = localStorage.getItem(key)

  if (!cached) return null

  try {
    const parsed = JSON.parse(cached)

    return parsed
  } catch (e) {
    console.error('Error parsing cached news:', e)

    return null
  }
}

export const setCachedNews = (key, data) => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('Error setting cached news:', e)
  }
}
