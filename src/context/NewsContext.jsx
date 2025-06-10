'use client'

import { createContext, useContext, useState, useEffect } from 'react'

import { useParams, usePathname, useSearchParams } from 'next/navigation'

import Mercury from '@postlight/mercury-parser'
import { toast } from 'react-toastify'

import { getCachedNews, setCachedNews } from '@/utils/newsCache'

const NewsContext = createContext()

export const NewsProvider = ({ children }) => {
  const [newsData, setNewsData] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(20)
  const [fontSize, setFontSize] = useState(16)
  const [allNews, setAllNews] = useState([])
  const [filtering, setFiltering] = useState(false)

  const CACHE_KEY = 'allNews'
  const CACHE_TIMESTAMP_KEY = 'allNewsTimestamp'
  const CACHE_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds

  // const params = useParams()
  // const source = params.slug
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sourceParam, setSourceParam] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const source = searchParams.get('source')

      setSourceParam(source)
    }
  }, [pathname]) // ✅ pathname changes when the URL updates

  useEffect(() => {
    const handleOnline = () => toast.success('✅ You are back online!')
    const handleOffline = () => toast.error('❌ You are offline.')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const generateSlug = name => name.toLowerCase().replace(/\s+/g, '-')

  const isYouTubeLink = url => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)

    return match ? match[1] : null
  }

  const fetchNews = async () => {
    setLoading(true)

    try {
      if (!navigator.onLine) throw new Error('No internet connection.')
      const cached = await getCachedNews(CACHE_KEY)
      const cachedTimestamp = await getCachedNews(CACHE_TIMESTAMP_KEY)
      const now = Date.now()

      if (cached && cachedTimestamp && now - cachedTimestamp < CACHE_EXPIRY_MS) {
        // Cache is still fresh, use it
        const filtered = filterNewsBySource(cached)

        setAllNews(cached) // ← ✅ this is missing
        setNewsData(filtered)

        // const assigned = assignPerSourceIds(filtered)

        setLoading(false)

        return
      }

      const response = await fetch('https://api2.qubicweb.com:8082/v2/feed', {
        next: { revalidate: 10 }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const items = Array.isArray(data.items) ? data.items : []

      const allNews = items.map(item => {
        const videoId = isYouTubeLink(item.link)

        return {
          uuid: item.uuid, // ✅ Use backend-provided UUID
          title: item.title,
          link: item.link,
          source: item.source || 'Unknown Source',
          contentSnippet: item.contentSnippet,
          publishedDate: item.publishedDate,
          image: item.image || '',
          favicon: item.favicon,
          fullContent: videoId ? '' : '',
          videoId,
          additionalImages: []
        }
      })

      // Cache fresh news and timestamp
      await setCachedNews(CACHE_KEY, allNews)
      await setCachedNews(CACHE_TIMESTAMP_KEY, now)

      setAllNews(allNews) // ✅ Store everything
      setNewsData(filterNewsBySource(allNews)) // ✅ Filter view
      // const filtered = filterNewsBySource(allNews)

      // setNewsData(filtered)
    } catch (error) {
      console.error('Error fetching news:', error)

      if (error.message === 'No internet connection.') {
        toast.error('❌ No internet connection.')
      } else {
        toast.error('❌ An unexpected error occurred.')
      }

      setNewsData([])
    } finally {
      setLoading(false)
    }
  }

  const filterNewsBySource = newsList => {
    if (!sourceParam) return newsList

    const slugSource = generateSlug(sourceParam)

    return newsList.filter(item => generateSlug(item.source) === slugSource)
  }

  // Only fetch on first load
  useEffect(() => {
    fetchNews()
  }, []) // ← only run once on initial mount

  useEffect(() => {
    if (allNews.length > 0) {
      setFiltering(true)

      setTimeout(() => {
        const filtered = filterNewsBySource(allNews)

        setNewsData(filtered)
        setFiltering(false)
      }, 0)
    }
  }, [sourceParam, allNews]) // ✅ now reactive!

  const fetchFullContent = async url => {
    setLoadingArticle(true)

    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      const html = await response.text()
      const result = await Mercury.parse(url, { html })

      if (result) {
        const content = result.content || ''
        const mainImage = result.lead_image_url || ''
        const images = extractImages(content)

        return { fullContent: content, mainImage, images }
      }
    } catch (error) {
      console.error(`Error fetching content for ${url}:`, error)
    } finally {
      setLoadingArticle(false)
    }

    return { fullContent: '', mainImage: '', images: [] }
  }

  const extractImages = htmlContent => {
    const imgTags = htmlContent.match(/<img[^>]+src="([^"]+)"/g) || []

    return imgTags.map(tag => tag.match(/src="([^"]+)"/)[1])
  }

  const handleNewsClick = async uuid => {
    setLoadingArticle(true)

    const selectedNews = newsData.find(news => news.uuid === uuid)

    if (!selectedNews || selectedNews.fullContent || selectedNews.videoId) {
      setActiveId(uuid)
      setLoadingArticle(false)

      return
    }

    setActiveId(uuid)
    const { fullContent, mainImage, images } = await fetchFullContent(selectedNews.link)

    setNewsData(prevNews =>
      prevNews.map(news =>
        news.uuid === uuid ? { ...news, fullContent, image: mainImage || news.image, additionalImages: images } : news
      )
    )
    setLoadingArticle(false)
  }

  return (
    <NewsContext.Provider
      value={{
        allNews,
        newsData,
        setNewsData,
        activeId,
        setActiveId,
        loading,
        fontSize,
        setFontSize,
        loadingArticle,
        handleNewsClick,
        filtering
      }}
    >
      {children}
    </NewsContext.Provider>
  )
}

export const useNews = () => useContext(NewsContext)
