const path = require('path')

const fs = require('fs')

const { v5: uuidv5 } = require('uuid')

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const xml2js = require('xml2js')

const schedule = require('node-schedule')
const pLimit = require('p-limit').default

const app = express()
const limit = pLimit(30)
const cacheFilePath = path.join(__dirname, 'feedCache.json')

// You can generate your own namespace UUID if needed, but keep it constant
const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8' // Example fixed UUID namespace

let cachedFeed = null
let lastFetchTime = null

// Load cache from disk
const loadCacheFromFile = () => {
  if (fs.existsSync(cacheFilePath)) {
    try {
      const data = fs.readFileSync(cacheFilePath, 'utf8')

      cachedFeed = JSON.parse(data)
      console.log('Cache successfully loaded from disk.')
    } catch (error) {
      console.error('Error loading cache from disk:', error.message)
    }
  }
}

// Save cache to disk
const saveCacheToFile = () => {
  if (cachedFeed) {
    try {
      fs.writeFileSync(cacheFilePath, JSON.stringify(cachedFeed, null, 2))
      console.log('Cache successfully saved to disk.')
    } catch (error) {
      console.error('Error saving cache to disk:', error.message)
    }
  }
}

// Function to format dates
const formatDate = dateString => {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Function to generate favicon URL based on the domain
const getFaviconUrl = siteUrl => {
  try {
    const hostname = new URL(siteUrl).hostname

    return `https://icons.duckduckgo.com/ip3/${hostname}.ico`
  } catch (error) {
    console.error('Error extracting favicon:', error.message)

    return null
  }
}

app.use(
  cors({
    origin: ['https://digital-directory-five.vercel.app', 'https://app.qubicweb.com', 'http://localhost:3000'], // Allow frontend URLs
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
  })
)
app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')))

// Root route
app.get('/v2', (req, res) => {
  res.send('Welcome to the API RSS Server!')
})

// Fetch and process RSS feed data
const processFeedData = async feedEntries => {
  const results = await Promise.allSettled(
    feedEntries.map(entry =>
      limit(async () => {
        const title = entry.title && typeof entry.title === 'object' ? entry.title._ : entry.title
        const validTitle = typeof title === 'string' ? title : 'Untitled'

        const fullContent =
          entry.content && typeof entry.content === 'object' ? entry.content._ : 'No full content available.'

        const sourceTitle = entry.source?.title || 'Unknown Source'
        const link = entry.link?.$.href || null

        // Use a combination of link and source to generate stable UUID
        const uniqueIdString = `${link}-${sourceTitle}`
        const uuid = uuidv5(uniqueIdString, UUID_NAMESPACE)

        return {
          uuid, // ✅ Stable UUIDv5
          title: validTitle,
          link: link || 'No link available',
          contentSnippet: entry.summary || 'No summary available.',
          fullContent: fullContent,
          publishedDate: entry.updated ? formatDate(entry.updated) : 'No published date available',
          source: sourceTitle,
          author: entry.author || 'Unknown Author',
          favicon: link ? getFaviconUrl(link) : null // Fetch favicon dynamically
        }
      })
    )
  )

  return results.filter(result => result.status === 'fulfilled').map(result => result.value)
}

// Fetch and cache the RSS feed
const fetchAndCacheFeed = async () => {
  try {
    console.log('Fetching RSS feed in background...')
    const response = await axios.get('https://api.qubicweb.com/v1/feed')

    const parser = new xml2js.Parser({ explicitArray: false })
    const parsedData = await parser.parseStringPromise(response.data)

    if (!parsedData || !parsedData.feed || !parsedData.feed.entry) {
      throw new Error('Invalid feed data structure')
    }

    const feedEntries = Array.isArray(parsedData.feed.entry) ? parsedData.feed.entry : [parsedData.feed.entry]

    console.log('Number of Feed Entries:', feedEntries.length)

    const processedItems = await processFeedData(feedEntries)

    cachedFeed = { items: processedItems }
    lastFetchTime = Date.now()
    console.log('RSS feed successfully cached.')
    saveCacheToFile()
  } catch (error) {
    console.error('Error fetching RSS feed:', error.message)
  }
}

// Schedule feed fetching at 3:00 AM daily
schedule.scheduleJob('0 * * * *', async () => {
  console.log('Scheduled job triggered: Updating cache every hour.')
  await fetchAndCacheFeed()
})

// Route to serve the cached RSS feed
app.get('/v2/feed', (req, res) => {
  const { refresh } = req.query

  if (refresh) {
    console.log('Manual refresh triggered.')
    fetchAndCacheFeed()

    return res.json({
      message: 'Manual refresh triggered. Serving cached feed.',
      lastFetchTime: lastFetchTime ? new Date(lastFetchTime).toISOString() : 'No fetch has occurred yet.',
      cachedFeed
    })
  }

  if (cachedFeed) {
    console.log('Serving cached feed.')
    res.json(cachedFeed)
  } else {
    res.status(503).json({ error: 'Feed is not yet cached. Try again later.' })
  }
})

// Load cache when the server starts
loadCacheFromFile()

// Save cache when the server shuts down
process.on('exit', saveCacheToFile)
process.on('SIGINT', () => {
  saveCacheToFile()
  process.exit()
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
