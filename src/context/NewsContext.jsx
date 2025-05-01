'use client'

import { createContext, useContext, useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

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

  // ✅ Add font size state
  const [fontSize, setFontSize] = useState(16) // Default font size

  const params = useParams()
  const source = params.slug

  useEffect(() => {
    const handleOnline = () => {
      toast.success('✅ You are back online!')
    }

    const handleOffline = () => {
      toast.error('❌ You are offline. Please check your connection.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  const generateSlug = name => name.toLowerCase().replace(/\s+/g, '-')

  // Function to detect YouTube links and extract video ID
  const isYouTubeLink = url => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)

    // console.log('YT:', match[1])

    return match ? match[1] : null
  }

  const fetchNews = async () => {
    // if (!source) return
    setLoading(true)

    try {
      // Check if the user is offline before trying to fetch
      if (!navigator.onLine) {
        throw new Error('No internet connection.')
      }

      const response = await fetch('https://api2.qubicweb.com:8082/v2/feed', {
        next: { revalidate: 10 }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const items = Array.isArray(data.items) ? data.items : []

      const filteredItems = items

        // .filter(item => item.source && generateSlug(item.source) === source)
        .filter(item => !source || generateSlug(item.source) === source) // Fetch all if no source
        .map((item, index) => {
          const videoId = isYouTubeLink(item.link) // Check if it's a YouTube link

          // console.log('Video ID for', item.link, ':', videoId) // Log detected video ID

          return {
            id: index,
            title: item.title,
            link: item.link,
            source: item.source || 'Unknown Source',
            contentSnippet: item.contentSnippet,
            publishedDate: item.publishedDate,
            image: item.image || '',
            fullContent: videoId ? '' : '', // Don't fetch full content for YouTube videos
            videoId, // Store YouTube video ID
            additionalImages: []
          }
        })

      setNewsData(filteredItems)
    } catch (error) {
      console.error('Error fetching news:', error)

      if (error.message === 'No internet connection.') {
        toast.error('❌ No internet connection. Please check your network.')
      } else if (error.message.includes('HTTP error! status: 404')) {
        toast.error('❌ News not found (404). Please try again later.')
      } else {
        toast.error('❌ An unexpected error occurred. Please Refresh.')
      }

      setNewsData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [source])

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

  const handleNewsClick = async id => {
    setLoadingArticle(true)
    const selectedNews = newsData.find(news => news.id === id)

    console.log('handleNewsClick triggered for ID:', id) // Debugging log

    // If it's a YouTube video or already has content, just set it as active
    if (!selectedNews || selectedNews.fullContent || selectedNews.videoId) {
      setActiveId(id)
      setLoadingArticle(false) // ✅ FIX: Ensure the loader is cleared

      return
    }

    setActiveId(id)
    const { fullContent, mainImage, images } = await fetchFullContent(selectedNews.link)

    setNewsData(prevNews =>
      prevNews.map(news =>
        news.id === id ? { ...news, fullContent, image: mainImage || news.image, additionalImages: images } : news
      )
    )
    setLoadingArticle(false)
  }

  return (
    <NewsContext.Provider
      value={{
        newsData,
        setNewsData,
        activeId,
        setActiveId,
        loading,
        fontSize,
        setFontSize,
        loadingArticle,
        handleNewsClick
      }}
    >
      {children}
    </NewsContext.Provider>
  )
}

export const useNews = () => {
  return useContext(NewsContext)
}
