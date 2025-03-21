'use client'

import { useState, useEffect } from 'react'

import FeedLayout from '@/components/layout/vertical/FeedLayout'
import NewsList from '@/components/NewsList'
import NewsReader from '@/components/NewsReader'

const Home = () => {
  const [newsData, setNewsData] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(20) // Track number of displayed news items

  // Function to fetch news from the RSS feed
  const fetchNews = async () => {
    setLoading(true)

    try {
      const response = await fetch('https://server.qubicweb.com/rss-feed', { next: { revalidate: 10 } })

      const data = await response.json() // Parse as JSON

      // Extract items from the JSON response
      const items = data.items.map((item, index) => ({
        id: index, // Use index as a unique ID for simplicity
        title: item.title,
        link: item.link,
        contentSnippet: item.contentSnippet,
        publishedDate: item.publishedDate,
        image: item.image,
        source: item.source.title,
        fullContent: item.fullContent,

        author: item.author,
        category: item.category,
        points: Math.floor(Math.random() * 100), // Placeholder for points
        comments: Math.floor(Math.random() * 50) // Placeholder for comments
      }))

      // Log the fetched items
      console.log('Fetched News Items:', items)

      // Update state with fetched news data
      setNewsData(items)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

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
        newsData={newsData.slice(0, displayedCount)} // Display only up to `displayedCount`
        onClick={handleNewsClick}
        activeId={activeId}
        loading={loading}
        onScroll={handleScroll}
      />
      <NewsReader newsData={newsData} activeId={activeId} />
    </FeedLayout>
  )
}

export default Home
