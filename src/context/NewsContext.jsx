'use client'

import { createContext, useContext, useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import Mercury from '@postlight/mercury-parser'

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

  const generateSlug = name => name.toLowerCase().replace(/\s+/g, '-')

  const fetchNews = async () => {
    if (!source) return
    setLoading(true)

    try {
      const response = await fetch('https://api2.qubicweb.com/v2/feed', {
        next: { revalidate: 10 }
      })

      const data = await response.json()
      const items = Array.isArray(data.items) ? data.items : []

      const filteredItems = items
        .filter(item => item.source && generateSlug(item.source) === source)
        .map((item, index) => ({
          id: index,
          title: item.title,
          link: item.link,
          source: item.source || 'Unknown Source',
          contentSnippet: item.contentSnippet,
          publishedDate: item.publishedDate,
          image: item.image || '',
          fullContent: '',
          additionalImages: []
        }))

      setNewsData(filteredItems)
    } catch (error) {
      console.error('Error fetching news:', error)
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
    const selectedNews = newsData.find(news => news.id === id)

    if (!selectedNews || selectedNews.fullContent) {
      setActiveId(id)

      return
    }

    setActiveId(id)
    const { fullContent, mainImage, images } = await fetchFullContent(selectedNews.link)

    setNewsData(prevNews =>
      prevNews.map(news =>
        news.id === id ? { ...news, fullContent, image: mainImage || news.image, additionalImages: images } : news
      )
    )
  }

  return (
    <NewsContext.Provider
      value={{ newsData, activeId, setActiveId, loading, fontSize, setFontSize, loadingArticle, handleNewsClick }}
    >
      {children}
    </NewsContext.Provider>
  )
}

export const useNews = () => {
  return useContext(NewsContext)
}
