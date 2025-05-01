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
  const cached = localStorage.getItem(`news-${key}`)

  return cached ? JSON.parse(cached) : null
}

export const setCachedNews = (key, data) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(`news-${key}`, JSON.stringify({ data, timestamp: Date.now() }))
}

export const clearNewsCache = async () => {
  await del('cachedNews')
  console.log('🧹 IndexedDB news cache cleared.')
}
