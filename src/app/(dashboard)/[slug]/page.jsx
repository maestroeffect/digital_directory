'use client'

import { useEffect, useState } from 'react'

import { useNews } from '@/context/NewsContext'

import FeedLayout from '@/components/layout/vertical/FeedLayout'
import NewsList from '@/components/NewsList'
import NewsReader from '@/components/NewsReader'

const SourcePage = () => {
  const { newsData, activeId, setActiveId, loading, loadingArticle, handleNewsClick } = useNews()

  const [displayedCount, setDisplayedCount] = useState(20)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchMoreNews = async () => {
    if (loadingMore || displayedCount >= newsData.length) return
    setLoadingMore(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Optional delay
      setDisplayedCount(prev => prev + 5)
    } catch (error) {
      console.error('Error fetching more news:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleScroll = container => {
    const { scrollTop, scrollHeight, clientHeight } = container

    if (loadingMore || scrollTop + clientHeight < scrollHeight - 10) return
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
