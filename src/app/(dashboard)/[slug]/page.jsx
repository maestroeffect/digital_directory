'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import FeedLayout from '@/components/layout/vertical/FeedLayout'
import NewsList from '@/components/NewsList'
import NewsReader from '@/components/NewsReader'

const SourcePage = () => {
  const [newsData, setNewsData] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(7)

  const params = useParams()
  const source = params.slug

  // Function to generate slug from source name
  const generateSlug = name => name.toLowerCase().replace(/\s+/g, '-')

  // Function to extract all image URLs from content
  const extractImages = htmlContent => {
    const imgTags = htmlContent.match(/<img[^>]+src="([^">]+)"/g) || []

    return imgTags.map(tag => tag.match(/src="([^">]+)"/)[1])
  }

  // Fetch full content and images using your API
  const fetchFullContent = async url => {
    try {
      const response = await fetch(`https://api2.qubicweb.com/v2/fetch-content?url=${encodeURIComponent(url)}`)
      const result = await response.json()

      if (result) {
        const content = result.content || ''
        const mainImage = result.mainImage || '' // Main Hero Image
        const images = extractImages(content)

        return { fullContent: content, mainImage, images }
      }
    } catch (error) {
      console.error(`Error fetching content for ${url}:`, error)
    }

    return { fullContent: '', mainImage: '', images: [] }
  }

  // Fetch and filter news
  const fetchNews = async () => {
    if (!source) return

    setLoading(true)

    try {
      const response = await fetch('https://api2.qubicweb.com/v2/feed', {
        next: { revalidate: 10 }
      })

      const data = await response.json()
      const items = Array.isArray(data.items) ? data.items : []

      const filteredItems = await Promise.all(
        items
          .filter(item => item.source && generateSlug(item.source) === source)
          .map(async (item, index) => {
            const { fullContent, mainImage, images } = await fetchFullContent(item.link)

            return {
              id: index,
              title: item.title,
              link: item.link,
              source: item.source || 'Unknown Source',
              contentSnippet: item.contentSnippet,
              publishedDate: item.publishedDate,
              image: mainImage || images[0] || item.image || '/default-news.jpg', // Use Main Image, First Extracted Image, or Fallback
              fullContent: fullContent || item.fullContent || '',
              additionalImages: images
            }
          })
      )

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

  const [activeLink, setActiveLink] = useState(null)

  const handleNewsClick = id => {
    const selectedNews = newsData.find(news => news.id === id)

    setActiveId(id)
    setActiveLink(selectedNews?.link || null)
  }

  return (
    <FeedLayout activeLink={activeLink}>
      <NewsList
        newsData={newsData.slice(0, displayedCount)}
        onClick={handleNewsClick}
        activeId={activeId}
        loading={loading}
        onScroll={handleScroll}
      />
      <NewsReader newsData={newsData} activeId={activeId} />
    </FeedLayout>
  )
}

export default SourcePage
