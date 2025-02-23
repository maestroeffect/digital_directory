'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation' // Use useParams for dynamic routes

import FeedLayout from '@/components/layout/vertical/FeedLayout'
import NewsList from '@/components/NewsList'
import NewsReader from '@/components/NewsReader'

const SourcePage = () => {
  const [newsData, setNewsData] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(7)

  const params = useParams() // Access dynamic route parameters
  const source = params.slug // Get the 'slug' parameter correctly

  // Function to fetch and filter news for the specific source
  const fetchNews = async () => {
    if (!source) return

    setLoading(true)

    try {
      const response = await fetch('https://api2.qubicweb.com/v2/feed', {
        next: { revalidate: 10 }
      })

      const data = await response.json()

      // Log the full data to check its structure
      // console.log('Fetched Data:', data)
      // console.log('Source from params:', source)

      // console.log('Source in data:', item.source?.title)

      // Filter items by the source title
      const items = data.items
        .filter(item => {
          const lowercaseSource = item.source.toLowerCase() // Convert the source to lowercase

          console.log(`Source in item (lowercase): ${lowercaseSource}`) // Log the lowercase source

          return lowercaseSource === source.toLowerCase()
        })
        .map((item, index) => ({
          id: index,
          title: item.title,
          link: item.link,
          source: item.source || 'Unknown Source',
          contentSnippet: item.contentSnippet,
          publishedDate: item.publishedDate,
          image: item.image || '',
          fullContent: item.fullContent || ''
        }))

      console.log(`Fetched News Items for Source: ${source}`, items)

      setNewsData(items)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews() // Fetch news when the component mounts or `source` changes
  }, [source])

  // Function to fetch more news items
  const fetchMoreNews = async () => {
    if (loading || displayedCount >= newsData.length) return // Prevent fetching if already loading or no more news

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 5000)) // Simulate a delay of 5 seconds

    try {
      // Increase the count of displayed news items
      setDisplayedCount(prevCount => prevCount + 5) // Show 5 more items on each scroll
    } catch (error) {
      console.error('Error fetching more news:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews() // Call the fetch function on component mount
  }, [])

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
