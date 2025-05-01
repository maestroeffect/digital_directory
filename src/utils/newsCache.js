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

export async function getCachedNews() {
  const db = await getDB()
  const cache = await db.get(STORE_NAME, CACHE_KEY)

  if (cache && Date.now() - cache.timestamp < ONE_DAY) {
    return cache.data
  }

  return null
}

export async function setCachedNews(data) {
  const db = await getDB()

  await db.put(STORE_NAME, { data, timestamp: Date.now() }, CACHE_KEY)
}

export const clearNewsCache = async () => {
  await del('cachedNews')
  console.log('🧹 IndexedDB news cache cleared.')
}
