'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import Mercury from '@postlight/mercury-parser'

import FeedLayout from '@/components/layout/vertical/FeedLayout'
import NewsList from '@/components/NewsList'
import NewsReader from '@/components/NewsReader'

const SourcePage = () => {
  const [newsData, setNewsData] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(false) // Track loading state for Mercury fetch
  const [displayedCount, setDisplayedCount] = useState(7)

  const params = useParams()
  const source = params.slug

  // Function to generate slug from source name
  const generateSlug = name => name.toLowerCase().replace(/\s+/g, '-')

  // Fetch and filter news (without Mercury)
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
          fullContent: '', // Will be fetched when clicked
          additionalImages: []
        }))

      console.log(`Fetched News for ${source}:`, filteredItems)
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

  // Fetch full content and images using Mercury
  // const fetchFullContent = async url => {
  //   setLoadingArticle(true)

  //   try {
  //     const result = await Mercury.parse(url)

  //     if (result) {
  //       const content = result.content || ''
  //       const mainImage = result.lead_image_url || ''
  //       const images = extractImages(content)

  //       return { fullContent: content, mainImage, images }
  //     }
  //   } catch (error) {
  //     console.error(`Error fetching content for ${url}:`, error)
  //   } finally {
  //     setLoadingArticle(false)
  //   }

  //   return { fullContent: '', mainImage: '', images: [] }
  // }

  const fetchFullContent = async url => {
    setLoadingArticle(true)

    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`

      const response = await fetch(proxyUrl)
      const html = await response.text() // Get the raw HTML from the proxy

      const result = await Mercury.parse(url, { html }) // Pass the original URL and raw HTML

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

  // Function to extract all image URLs from content
  const extractImages = htmlContent => {
    const imgTags = htmlContent.match(/<img[^>]+src="([^">]+)"/g) || []

    return imgTags.map(tag => tag.match(/src="([^">]+)"/)[1])
  }

  // Handle clicking on a news item
  const handleNewsClick = async id => {
    const selectedNews = newsData.find(news => news.id === id)

    if (!selectedNews || selectedNews.fullContent) {
      setActiveId(id)

      return
    }

    setActiveId(id)

    // Fetch full content only if it hasn't been fetched yet
    const { fullContent, mainImage, images } = await fetchFullContent(selectedNews.link)

    setNewsData(prevNews =>
      prevNews.map(news =>
        news.id === id ? { ...news, fullContent, image: mainImage || news.image, additionalImages: images } : news
      )
    )
  }

  const fetchMoreNews = async () => {
    if (loading || displayedCount >= newsData.length) return
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 5000))

    try {
      setDisplayedCount(prevCount => prevCount + 5)
    } catch (error) {
      console.error('Error fetching more news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScroll = container => {
    const { scrollTop, scrollHeight, clientHeight } = container

    if (loading || scrollTop + clientHeight < scrollHeight - 10) return
    fetchMoreNews()
  }

  return (
    <FeedLayout activeLink={newsData.find(n => n.id === activeId)?.link || null}>
      <NewsList
        newsData={newsData.slice(0, displayedCount)}
        onClick={handleNewsClick}
        activeId={activeId}
        loading={loading}
        onScroll={handleScroll}
      />
      <NewsReader newsData={newsData} activeId={activeId} loadingArticle={loadingArticle} />
    </FeedLayout>
  )
}

export default SourcePage
